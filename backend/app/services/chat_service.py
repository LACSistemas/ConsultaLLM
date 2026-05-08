from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ChatNotFoundError
from app.db.models import Chat, Message


async def create_chat(db: AsyncSession, title: str = "Novo chat") -> Chat:
    chat = Chat(title=title)
    db.add(chat)
    await db.commit()
    await db.refresh(chat)
    return chat


async def get_chat(db: AsyncSession, chat_id: str) -> Chat:
    result = await db.execute(
        select(Chat).where(Chat.id == chat_id).options(selectinload(Chat.messages))
    )
    chat = result.scalar_one_or_none()
    if not chat:
        raise ChatNotFoundError(chat_id)
    return chat


async def list_chats(db: AsyncSession) -> list[Chat]:
    result = await db.execute(select(Chat).order_by(desc(Chat.updated_at)))
    return list(result.scalars().all())


async def delete_chat(db: AsyncSession, chat_id: str) -> None:
    chat = await get_chat(db, chat_id)
    await db.delete(chat)
    await db.commit()


async def rename_chat(db: AsyncSession, chat_id: str, title: str) -> Chat:
    chat = await get_chat(db, chat_id)
    chat.title = title
    await db.commit()
    await db.refresh(chat)
    return chat


async def auto_title_chat(db: AsyncSession, chat_id: str, first_message: str) -> Chat:
    chat = await get_chat(db, chat_id)
    if chat.title == "Novo chat":
        chat.title = first_message[:60].strip()
        await db.commit()
        await db.refresh(chat)
    return chat


async def add_message(
    db: AsyncSession,
    chat_id: str,
    role: str,
    content: str,
    counselor_responses: list | None = None,
) -> Message:
    msg = Message(
        chat_id=chat_id,
        role=role,
        content=content,
        counselor_responses=counselor_responses,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


async def get_chat_history(db: AsyncSession, chat_id: str, limit: int = 20) -> list[dict]:
    result = await db.execute(
        select(Message)
        .where(Message.chat_id == chat_id)
        .order_by(desc(Message.created_at))
        .limit(limit)
    )
    msgs = list(reversed(result.scalars().all()))
    history = []
    for m in msgs:
        if m.role == "user":
            history.append({"role": "user", "content": m.content})
        else:
            history.append({"role": "assistant", "content": m.content})
    return history


async def get_messages(db: AsyncSession, chat_id: str) -> list[Message]:
    await get_chat(db, chat_id)
    result = await db.execute(
        select(Message).where(Message.chat_id == chat_id).order_by(Message.created_at)
    )
    return list(result.scalars().all())
