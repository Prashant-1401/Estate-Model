from datetime import datetime
from pydantic import BaseModel


class DropdownBase(BaseModel):
    category: str
    label: str
    value: str
    color: str = ""
    sort_order: int = 0


class DropdownCreate(DropdownBase):
    pass


class DropdownUpdate(BaseModel):
    label: str | None = None
    value: str | None = None
    color: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class DropdownRead(DropdownBase):
    id: str
    is_active: bool = True
    created_at: datetime | None = None

    model_config = {"from_attributes": True}
