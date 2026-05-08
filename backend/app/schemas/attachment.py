from datetime import datetime
from pydantic import BaseModel


class AttachmentRead(BaseModel):
    id: str
    filename: str
    file_type: str
    created_at: datetime

    model_config = {"from_attributes": True}
