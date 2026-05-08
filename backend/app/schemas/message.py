from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CounselorResponse(BaseModel):
    name: str
    provider: str
    response: str


class CEODecision(BaseModel):
    decision: str
    reasoning: str


class MessageRead(BaseModel):
    id: str
    chat_id: str
    role: str
    content: str
    counselor_responses: Optional[list[CounselorResponse]] = None
    created_at: datetime

    model_config = {"from_attributes": True}
