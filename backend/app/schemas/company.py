from datetime import datetime
from pydantic import BaseModel


class CompanyBase(BaseModel):
    name: str
    logo: str = ""
    email: str = ""
    phone: str = ""
    address: str = ""
    gst_number: str = ""
    currency: str = "INR"
    timezone: str = "Asia/Kolkata"
    working_hours: str = "9:00 AM - 6:00 PM"
    settings: dict = {}


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: str | None = None
    logo: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    gst_number: str | None = None
    currency: str | None = None
    timezone: str | None = None
    working_hours: str | None = None
    settings: dict | None = None


class CompanyRead(CompanyBase):
    id: str
    is_active: bool = True
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
