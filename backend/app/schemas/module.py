from datetime import datetime
from pydantic import BaseModel


class ModuleBase(BaseModel):
    name: str
    slug: str
    description: str = ""


class ModuleCreate(ModuleBase):
    pass


class ModuleUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    is_active: bool | None = None


class ModuleRead(ModuleBase):
    id: str
    is_active: bool = True
    created_at: datetime | None = None

    model_config = {"from_attributes": True}
