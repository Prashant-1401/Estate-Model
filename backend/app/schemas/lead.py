from datetime import datetime
from pydantic import BaseModel


class LeadBase(BaseModel):
    name: str
    phone: str
    email: str = ""
    budget: str = ""
    area: str = ""
    type: str = ""
    source: str = "Direct"
    status: str = "New"
    assigned: str = "Unassigned"
    date: str = ""
    property_id: str | None = None
    assigned_to: str | None = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    budget: str | None = None
    area: str | None = None
    type: str | None = None
    source: str | None = None
    status: str | None = None
    assigned: str | None = None
    date: str | None = None
    property_id: str | None = None
    assigned_to: str | None = None


class LeadRead(LeadBase):
    id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
