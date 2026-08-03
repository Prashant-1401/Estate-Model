from sqlalchemy import Column, String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB

from app.database import Base


class NotificationRule(Base):
    __tablename__ = "notification_rules"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    trigger_event = Column(String, nullable=False)
    template_id = Column(String, nullable=False)
    recipients = Column(JSONB, default=list)
    conditions = Column(JSONB, default=dict)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
