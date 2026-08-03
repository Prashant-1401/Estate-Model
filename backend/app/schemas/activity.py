from datetime import datetime
from pydantic import BaseModel


class ActivityCreate(BaseModel):
    type: str
    note: str = ""


class ActivityRead(BaseModel):
    id: str
    lead_id: str
    type: str
    description: str = ""
    note: str = ""
    performed_by: str = ""
    created_at: datetime | None = None

    model_config = {"from_attributes": True}
