from typing import Optional
from pydantic import BaseModel
from app.schemas.message import CounselorResponse, CEODecision


class CouncilRequest(BaseModel):
    message: str
    attachment_ids: Optional[list[str]] = []


class CouncilResponse(BaseModel):
    message_id: str
    counselors: list[CounselorResponse]
    ceo_decision: CEODecision
