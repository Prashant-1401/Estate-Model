from datetime import datetime
from pydantic import BaseModel


class UserBase(BaseModel):
    name: str
    email: str
    phone: str = ""
    role: str = "agent"
    status: str = "Active"
    created: str = ""


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    role: str | None = None
    status: str | None = None
    password: str | None = None


class UserRead(UserBase):
    id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
