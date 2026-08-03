from sqlalchemy import Column, String, Boolean, Integer, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB

from app.database import Base


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    description = Column(String, default="")
    trigger_event = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
