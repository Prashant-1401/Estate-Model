from datetime import datetime
from pydantic import BaseModel


class StatusBase(BaseModel):
    entity_type: str
    name: str
    slug: str
    color: str = "#64748B"
    sort_order: int = 0


class StatusCreate(StatusBase):
    pass


class StatusUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    color: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class StatusRead(StatusBase):
    id: str
    is_active: bool = True
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class LeadSourceBase(BaseModel):
    name: str
    slug: str
    description: str = ""
    icon: str = ""
    sort_order: int = 0


class LeadSourceCreate(LeadSourceBase):
    pass


class LeadSourceUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    icon: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class LeadSourceRead(LeadSourceBase):
    id: str
    is_active: bool = True
    created_at: datetime | None = None

    model_config = {"from_attributes": True}
