import os
import uuid

import aiofiles
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.errors import AttachmentParseError
from app.db.models import Attachment
from app.schemas.attachment import AttachmentRead
from app.services import pdf_service, xlsx_service


async def upload_attachment(db: AsyncSession, chat_id: str, file: UploadFile) -> Attachment:
    filename = file.filename or "unnamed"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in (".pdf", ".xlsx", ".xls"):
        raise AttachmentParseError(filename, f"Tipo não suportado: {ext}")

    file_type = "pdf" if ext == ".pdf" else "xlsx"
    stored_name = f"{uuid.uuid4()}_{filename}"
    file_path = os.path.join(settings.upload_dir, stored_name)

    os.makedirs(settings.upload_dir, exist_ok=True)
    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    try:
        if file_type == "pdf":
            parsed_text = pdf_service.extract_text(file_path)
        else:
            parsed_text = xlsx_service.extract_text(file_path)
    except Exception as e:
        os.remove(file_path)
        raise AttachmentParseError(filename, str(e)) from e

    attachment = Attachment(
        chat_id=chat_id,
        filename=filename,
        file_type=file_type,
        parsed_text=parsed_text,
        file_path=file_path,
    )
    db.add(attachment)
    await db.commit()
    await db.refresh(attachment)
    return attachment


async def get_attachment_texts(db: AsyncSession, attachment_ids: list[str]) -> list[str]:
    if not attachment_ids:
        return []
    result = await db.execute(
        select(Attachment).where(Attachment.id.in_(attachment_ids))
    )
    attachments = result.scalars().all()
    return [a.parsed_text for a in attachments if a.parsed_text]


async def link_attachments_to_message(db: AsyncSession, attachment_ids: list[str], message_id: str) -> None:
    if not attachment_ids:
        return
    result = await db.execute(
        select(Attachment).where(Attachment.id.in_(attachment_ids))
    )
    for att in result.scalars().all():
        att.message_id = message_id
    await db.commit()
