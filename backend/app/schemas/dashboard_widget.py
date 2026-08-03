from datetime import datetime
from pydantic import BaseModel


class DashboardWidgetBase(BaseModel):
    name: str
    widget_type: str
    description: str = ""
    config: dict = {}
    sort_order: int = 0


class DashboardWidgetCreate(DashboardWidgetBase):
    pass


class DashboardWidgetUpdate(BaseModel):
    name: str | None = None
    widget_type: str | None = None
    description: str | None = None
    config: dict | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class DashboardWidgetRead(DashboardWidgetBase):
    id: str
    is_active: bool = True
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class UserDashboardBase(BaseModel):
    user_id: str
    widgets: list[dict] = []
    layout: dict = {}


class UserDashboardCreate(UserDashboardBase):
    pass


class UserDashboardUpdate(BaseModel):
    widgets: list[dict] | None = None
    layout: dict | None = None


class UserDashboardRead(UserDashboardBase):
    id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
