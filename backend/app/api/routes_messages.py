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

    user_msg = await chat_service.add_message(db, chat_id, "user", body.message)

    history = await chat_service.get_chat_history(db, chat_id, limit=20)
    history_without_last = history[:-1] if history and history[-1]["content"] == body.message else history

    attachment_texts = await attachment_service.get_attachment_texts(db, body.attachment_ids or [])

    result = await council_service.run_council(
        user_message=body.message,
        chat_history=history_without_last,
        attachment_texts=attachment_texts,
    )

    counselors_data = [c.model_dump() for c in result.counselors]
    import json as _json
    ceo_content = _json.dumps({
        "decision": result.ceo_decision.decision,
        "reasoning": result.ceo_decision.reasoning,
    }, ensure_ascii=False)

    assistant_msg = await chat_service.add_message(
        db,
        chat_id,
        "assistant",
        ceo_content,
        counselor_responses=counselors_data,
    )

    if body.attachment_ids:
        await attachment_service.link_attachments_to_message(db, body.attachment_ids, user_msg.id)

    await chat_service.auto_title_chat(db, chat_id, body.message)

    return CouncilResponse(
        message_id=assistant_msg.id,
        counselors=result.counselors,
        ceo_decision=result.ceo_decision,
    )
