from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.council import CouncilRequest, CouncilResponse
from app.schemas.message import MessageRead
from app.services import chat_service, council_service, attachment_service

router = APIRouter(tags=["messages"])


@router.get("/chats/{chat_id}/messages", response_model=list[MessageRead])
async def get_messages(chat_id: str, db: AsyncSession = Depends(get_db)):
    msgs = await chat_service.get_messages(db, chat_id)
    return [MessageRead.model_validate(m) for m in msgs]


@router.post("/chats/{chat_id}/messages", response_model=CouncilResponse, status_code=201)
async def send_message(chat_id: str, body: CouncilRequest, db: AsyncSession = Depends(get_db)):
    await chat_service.get_chat(db, chat_id)

    attachments = await attachment_service.get_pending_attachments(
        db, chat_id, body.attachment_ids or []
    )
    attachment_texts = [attachment.parsed_text for attachment in attachments if attachment.parsed_text]

    history = await chat_service.get_chat_history(db, chat_id, limit=20)

    result = await council_service.run_council(
        user_message=body.message,
        chat_history=history,
        attachment_texts=attachment_texts,
    )

    user_msg = await chat_service.add_message(db, chat_id, "user", body.message)

    if attachments:
        await attachment_service.claim_attachments_for_message(
            db, chat_id, [attachment.id for attachment in attachments], user_msg.id
        )

    counselors_data = [c.model_dump() for c in result.counselors]
    import json as _json
    ceo_content = _json.dumps(result.ceo_decision.model_dump(), ensure_ascii=False)

    assistant_msg = await chat_service.add_message(
        db,
        chat_id,
        "assistant",
        ceo_content,
        counselor_responses=counselors_data,
    )

    await chat_service.auto_title_chat(db, chat_id, body.message)

    return CouncilResponse(
        message_id=assistant_msg.id,
        counselors=result.counselors,
        ceo_decision=result.ceo_decision,
    )
