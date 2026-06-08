from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.attachment import AttachmentRead
from app.services import attachment_service, chat_service

router = APIRouter(tags=["attachments"])


@router.post("/chats/{chat_id}/attachments", response_model=AttachmentRead, status_code=201)
async def upload_attachment(
    chat_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    await chat_service.get_chat(db, chat_id)
    attachment = await attachment_service.upload_attachment(db, chat_id, file)
    return AttachmentRead.model_validate(attachment)


@router.get("/chats/{chat_id}/attachments/{attachment_id}", response_model=AttachmentRead)
async def get_attachment(
    chat_id: str,
    attachment_id: str,
    db: AsyncSession = Depends(get_db),
):
    await chat_service.get_chat(db, chat_id)
    attachment = await attachment_service.get_attachment(db, chat_id, attachment_id)
    return AttachmentRead.model_validate(attachment)


@router.delete("/chats/{chat_id}/attachments/{attachment_id}", status_code=204)
async def delete_attachment(
    chat_id: str,
    attachment_id: str,
    db: AsyncSession = Depends(get_db),
):
    await chat_service.get_chat(db, chat_id)
    await attachment_service.delete_pending_attachment(db, chat_id, attachment_id)
