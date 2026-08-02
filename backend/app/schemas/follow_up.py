from datetime import datetime
from pydantic import BaseModel


class FollowUpBase(BaseModel):
    lead_id: str
    lead_name: str
    property_title: str = ""
    assigned_to: str = ""
    status: str = "Today"
    time: str = ""
    note: str = ""


class FollowUpCreate(FollowUpBase):
    pass


class FollowUpUpdate(BaseModel):
    lead_id: str | None = None
    lead_name: str | None = None
    property_title: str | None = None
    assigned_to: str | None = None
    status: str | None = None
    time: str | None = None
    note: str | None = None


class FollowUpRead(FollowUpBase):
    id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
