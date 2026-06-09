from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


ConfidenceLevel = Literal["low", "medium", "high"]
DecisionStatus = Literal["recommendation", "needs_clarification"]


class CounselorResponse(BaseModel):
    name: str
    provider: str
    role: str = ""
    role_description: str = ""
    response: str
    critique: str = ""


class CounselorAssessment(BaseModel):
    provider: str
    role: str = ""
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    contribution: str = ""
    reliability: ConfidenceLevel = "medium"


class ConfidenceAssessment(BaseModel):
    level: ConfidenceLevel = "medium"
    rationale: str = ""
    supporting_factors: list[str] = Field(default_factory=list)
    limiting_factors: list[str] = Field(default_factory=list)


class CEODecision(BaseModel):
    status: DecisionStatus = "recommendation"
    decision: str
    reasoning: str
    confidence: ConfidenceAssessment = Field(default_factory=ConfidenceAssessment)
    consensus: list[str] = Field(default_factory=list)
    disagreements: list[str] = Field(default_factory=list)
    minority_views: list[str] = Field(default_factory=list)
    counselor_assessments: list[CounselorAssessment] = Field(default_factory=list)
    known_facts: list[str] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)
    inferences: list[str] = Field(default_factory=list)
    value_judgments: list[str] = Field(default_factory=list)
    unknowns: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    verification_needed: list[str] = Field(default_factory=list)
    clarifying_questions: list[str] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)


class MessageRead(BaseModel):
    id: str
    chat_id: str
    role: str
    content: str
    counselor_responses: Optional[list[CounselorResponse]] = None
    created_at: datetime

    model_config = {"from_attributes": True}
