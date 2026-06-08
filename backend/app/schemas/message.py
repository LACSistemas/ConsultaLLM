from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CounselorResponse(BaseModel):
    name: str
    provider: str
    response: str


class CounselorAssessment(BaseModel):
    provider: str
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    contribution: str = ""
    confidence: float = Field(default=0.5, ge=0, le=1)


class CEODecision(BaseModel):
    decision: str
    reasoning: str
    confidence: float = Field(default=0.5, ge=0, le=1)
    consensus: list[str] = Field(default_factory=list)
    disagreements: list[str] = Field(default_factory=list)
    counselor_assessments: list[CounselorAssessment] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    verification_needed: list[str] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)


class MessageRead(BaseModel):
    id: str
    chat_id: str
    role: str
    content: str
    counselor_responses: Optional[list[CounselorResponse]] = None
    created_at: datetime

    model_config = {"from_attributes": True}
