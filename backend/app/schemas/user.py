from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    name: str
    email: str
    phone: str = ""
    role: str = "Agent"
    status: str = "Active"
    created: str = ""


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    role: str | None = None
    status: str | None = None


class UserRead(UserBase):
    id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
