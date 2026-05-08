from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.db.models import Attachment
from app.schemas.attachment import AttachmentRead
from app.services import attachment_service

router = APIRouter(tags=["attachments"])


@router.post("/chats/{chat_id}/attachments", response_model=AttachmentRead, status_code=201)
async def upload_attachment(
    chat_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    att = await attachment_service.upload_attachment(db, chat_id, file)
    return AttachmentRead.model_validate(att)


@router.get("/attachments/{attachment_id}", response_model=AttachmentRead)
async def get_attachment(attachment_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Attachment).where(Attachment.id == attachment_id))
    att = result.scalar_one_or_none()
    if not att:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Attachment not found")
    return AttachmentRead.model_validate(att)
