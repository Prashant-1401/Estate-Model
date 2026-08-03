from datetime import datetime
from pydantic import BaseModel


class NotificationTemplateBase(BaseModel):
    name: str
    channel: str
    subject: str = ""
    body: str
    variables: list[str] = []


class NotificationTemplateCreate(NotificationTemplateBase):
    pass


class NotificationTemplateUpdate(BaseModel):
    name: str | None = None
    channel: str | None = None
    subject: str | None = None
    body: str | None = None
    variables: list[str] | None = None
    is_active: bool | None = None


class NotificationTemplateRead(NotificationTemplateBase):
    id: str
    is_active: bool = True
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class NotificationRuleBase(BaseModel):
    name: str
    trigger_event: str
    template_id: str
    recipients: list[str] = []
    conditions: dict = {}


class NotificationRuleCreate(NotificationRuleBase):
    pass


class NotificationRuleUpdate(BaseModel):
    name: str | None = None
    trigger_event: str | None = None
    template_id: str | None = None
    recipients: list[str] | None = None
    conditions: dict | None = None
    is_active: bool | None = None


class NotificationRuleRead(NotificationRuleBase):
    id: str
    is_active: bool = True
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
