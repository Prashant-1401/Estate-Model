from datetime import datetime
from pydantic import BaseModel


class InquiryBase(BaseModel):
    name: str
    phone: str
    email: str = ""
    property_type: str = ""
    area: str = ""
    budget: str = ""
    message: str = ""
    source: str = "Website"
    status: str = "New"
    date: str = ""


class InquiryCreate(InquiryBase):
    pass


class InquiryUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    property_type: str | None = None
    area: str | None = None
    budget: str | None = None
    message: str | None = None
    source: str | None = None
    status: str | None = None


class InquiryRead(InquiryBase):
    id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
