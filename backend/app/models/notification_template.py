from sqlalchemy import Column, String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB

from app.database import Base


class NotificationTemplate(Base):
    __tablename__ = "notification_templates"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    channel = Column(String, nullable=False)
    subject = Column(String, default="")
    body = Column(String, nullable=False)
    variables = Column(JSONB, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
