from datetime import datetime
from pydantic import BaseModel


class ProjectBase(BaseModel):
    name: str
    developer: str = ""
    location: str = ""
    status: str = "Planning"
    total_units: int = 0
    units_sold: int = 0
    launch_date: str = ""
    completion_date: str = ""
    price_range: str = ""
    description: str = ""


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = None
    developer: str | None = None
    location: str | None = None
    status: str | None = None
    total_units: int | None = None
    units_sold: int | None = None
    launch_date: str | None = None
    completion_date: str | None = None
    price_range: str | None = None
    description: str | None = None


class ProjectRead(ProjectBase):
    id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
