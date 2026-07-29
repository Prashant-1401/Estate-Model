from datetime import datetime
from pydantic import BaseModel


class PropertyBase(BaseModel):
    title: str
    location: str
    price: str = ""
    bedrooms: int = 0
    bathrooms: int = 0
    area: str = ""
    type: str = ""
    status: str = "Available"
    images: list[str] = []
    featured: bool = False
    project_id: str | None = None


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    title: str | None = None
    location: str | None = None
    price: str | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    area: str | None = None
    type: str | None = None
    status: str | None = None
    images: list[str] | None = None
    featured: bool | None = None
    project_id: str | None = None


class PropertyRead(PropertyBase):
    id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
