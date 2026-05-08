from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.chat import ChatCreate, ChatRead, ChatUpdate, ChatList
from app.services import chat_service

router = APIRouter(tags=["chats"])


@router.get("/chats", response_model=ChatList)
async def list_chats(db: AsyncSession = Depends(get_db)):
    chats = await chat_service.list_chats(db)
    return ChatList(chats=[ChatRead.model_validate(c) for c in chats])


@router.post("/chats", response_model=ChatRead, status_code=201)
async def create_chat(body: ChatCreate, db: AsyncSession = Depends(get_db)):
    chat = await chat_service.create_chat(db, title=body.title or "Novo chat")
    return ChatRead.model_validate(chat)


@router.get("/chats/{chat_id}", response_model=ChatRead)
async def get_chat(chat_id: str, db: AsyncSession = Depends(get_db)):
    chat = await chat_service.get_chat(db, chat_id)
    return ChatRead.model_validate(chat)


@router.patch("/chats/{chat_id}", response_model=ChatRead)
async def rename_chat(chat_id: str, body: ChatUpdate, db: AsyncSession = Depends(get_db)):
    chat = await chat_service.rename_chat(db, chat_id, body.title)
    return ChatRead.model_validate(chat)


@router.delete("/chats/{chat_id}", status_code=204)
async def delete_chat(chat_id: str, db: AsyncSession = Depends(get_db)):
    await chat_service.delete_chat(db, chat_id)
