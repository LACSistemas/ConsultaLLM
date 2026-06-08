import os
import uuid
import zipfile
from pathlib import Path

import aiofiles
from fastapi import UploadFile
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import (
    AttachmentNotFoundError,
    AttachmentParseError,
    AttachmentTooLargeError,
)
from app.db.models import Attachment
from app.services import pdf_service, xlsx_service

_ALLOWED_TYPES = {
    ".pdf": {
        "file_type": "pdf",
        "content_types": {"application/pdf", "application/octet-stream", ""},
        "signature": b"%PDF-",
    },
    ".xlsx": {
        "file_type": "xlsx",
        "content_types": {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/zip",
            "application/vnd.ms-excel",
            "application/octet-stream",
            "",
        },
        "signature": b"PK",
    },
}
_CHUNK_SIZE = 1024 * 1024


def _safe_display_name(filename: str | None) -> str:
    name = Path((filename or "unnamed").replace("\\", "/")).name.strip()
    return name[:500] or "unnamed"


def _validate_metadata(filename: str, content_type: str | None) -> tuple[str, str, bytes]:
    extension = Path(filename).suffix.lower()
    config = _ALLOWED_TYPES.get(extension)
    if config is None:
        raise AttachmentParseError(filename, "apenas arquivos PDF e XLSX são permitidos")

    normalized_content_type = (content_type or "").lower().split(";", 1)[0].strip()
    if normalized_content_type not in config["content_types"]:
        raise AttachmentParseError(filename, "o tipo MIME não corresponde ao formato permitido")

    return extension, config["file_type"], config["signature"]


async def _write_limited_upload(file: UploadFile, file_path: str, expected_signature: bytes) -> None:
    total_bytes = 0
    first_bytes = b""

    try:
        async with aiofiles.open(file_path, "wb") as destination:
            while chunk := await file.read(_CHUNK_SIZE):
                total_bytes += len(chunk)
                if total_bytes > settings.max_upload_bytes:
                    raise AttachmentTooLargeError(settings.max_upload_bytes)
                if len(first_bytes) < len(expected_signature):
                    first_bytes += chunk[: len(expected_signature) - len(first_bytes)]
                await destination.write(chunk)
    except Exception:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise
    finally:
        await file.close()

    if total_bytes == 0:
        os.remove(file_path)
        raise AttachmentParseError(_safe_display_name(file.filename), "o arquivo está vazio")
    if not first_bytes.startswith(expected_signature):
        os.remove(file_path)
        raise AttachmentParseError(_safe_display_name(file.filename), "a assinatura do arquivo é inválida")


def _validate_xlsx_archive(file_path: str, filename: str) -> None:
    try:
        with zipfile.ZipFile(file_path) as archive:
            total_uncompressed = 0
            for member in archive.infolist():
                total_uncompressed += member.file_size
                if total_uncompressed > settings.max_xlsx_uncompressed_bytes:
                    raise AttachmentParseError(
                        filename,
                        "o conteúdo descompactado excede o limite de segurança",
                    )
                if member.flag_bits & 0x1:
                    raise AttachmentParseError(filename, "planilhas criptografadas não são permitidas")
    except zipfile.BadZipFile as exc:
        raise AttachmentParseError(filename, "o arquivo XLSX não é um ZIP válido") from exc


async def upload_attachment(db: AsyncSession, chat_id: str, file: UploadFile) -> Attachment:
    filename = _safe_display_name(file.filename)
    extension, file_type, signature = _validate_metadata(filename, file.content_type)
    stored_name = f"{uuid.uuid4().hex}{extension}"
    file_path = os.path.join(settings.upload_dir, stored_name)

    os.makedirs(settings.upload_dir, exist_ok=True)
    await _write_limited_upload(file, file_path, signature)

    try:
        if file_type == "pdf":
            parsed_text = pdf_service.extract_text(
                file_path,
                max_pages=settings.max_pdf_pages,
                max_chars=settings.max_attachment_chars,
            )
        else:
            _validate_xlsx_archive(file_path, filename)
            parsed_text = xlsx_service.extract_text(
                file_path,
                max_rows=settings.max_xlsx_rows,
                max_chars=settings.max_attachment_chars,
            )
    except AttachmentParseError:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise
    except Exception as exc:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise AttachmentParseError(filename, str(exc)) from exc

    attachment = Attachment(
        chat_id=chat_id,
        filename=filename,
        file_type=file_type,
        parsed_text=parsed_text,
        file_path=file_path,
    )
    db.add(attachment)
    try:
        await db.commit()
        await db.refresh(attachment)
    except Exception:
        await db.rollback()
        if os.path.exists(file_path):
            os.remove(file_path)
        raise
    return attachment


async def get_attachment(db: AsyncSession, chat_id: str, attachment_id: str) -> Attachment:
    result = await db.execute(
        select(Attachment).where(
            Attachment.id == attachment_id,
            Attachment.chat_id == chat_id,
        )
    )
    attachment = result.scalar_one_or_none()
    if attachment is None:
        raise AttachmentNotFoundError()
    return attachment


async def get_pending_attachments(
    db: AsyncSession,
    chat_id: str,
    attachment_ids: list[str],
) -> list[Attachment]:
    unique_ids = list(dict.fromkeys(attachment_ids))
    if len(unique_ids) != len(attachment_ids):
        raise AttachmentNotFoundError()
    if not unique_ids:
        return []
    if len(unique_ids) > settings.max_attachments_per_message:
        raise AttachmentParseError(
            "anexos",
            f"o limite é de {settings.max_attachments_per_message} arquivos por mensagem",
        )

    result = await db.execute(
        select(Attachment).where(
            Attachment.id.in_(unique_ids),
            Attachment.chat_id == chat_id,
            Attachment.message_id.is_(None),
        )
    )
    attachments_by_id = {attachment.id: attachment for attachment in result.scalars().all()}
    if len(attachments_by_id) != len(unique_ids):
        raise AttachmentNotFoundError()
    return [attachments_by_id[attachment_id] for attachment_id in unique_ids]


async def claim_attachments_for_message(
    db: AsyncSession,
    chat_id: str,
    attachment_ids: list[str],
    message_id: str,
) -> None:
    if not attachment_ids:
        return

    result = await db.execute(
        update(Attachment)
        .where(
            Attachment.id.in_(attachment_ids),
            Attachment.chat_id == chat_id,
            Attachment.message_id.is_(None),
        )
        .values(message_id=message_id)
    )
    if result.rowcount != len(attachment_ids):
        await db.rollback()
        raise AttachmentNotFoundError()
    await db.commit()


async def delete_pending_attachment(
    db: AsyncSession,
    chat_id: str,
    attachment_id: str,
) -> None:
    result = await db.execute(
        select(Attachment).where(
            Attachment.id == attachment_id,
            Attachment.chat_id == chat_id,
            Attachment.message_id.is_(None),
        )
    )
    attachment = result.scalar_one_or_none()
    if attachment is None:
        raise AttachmentNotFoundError()

    delete_stored_file(attachment.file_path, strict=True)
    await db.delete(attachment)
    await db.commit()


def delete_stored_file(file_path: str, *, strict: bool = False) -> bool:
    upload_root = Path(settings.upload_dir).resolve()
    candidate = Path(file_path).resolve()
    if candidate.parent != upload_root:
        if strict:
            raise AttachmentParseError(candidate.name, "caminho de armazenamento inválido")
        return False
    try:
        candidate.unlink(missing_ok=True)
        return True
    except OSError as exc:
        if strict:
            raise AttachmentParseError(candidate.name, "não foi possível apagar o arquivo") from exc
        return False
