from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ChatCreate(BaseModel):
    title: Optional[str] = None


class ChatUpdate(BaseModel):
    title: str


class ChatRead(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ChatList(BaseModel):
    chats: list[ChatRead]
