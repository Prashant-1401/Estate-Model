from sqlalchemy import Column, String, Boolean, Integer, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB

from app.database import Base


class Status(Base):
    __tablename__ = "statuses"

    id = Column(String, primary_key=True)
    entity_type = Column(String, nullable=False)
    name = Column(String, nullable=False)
    slug = Column(String, nullable=False)
    color = Column(String, default="#64748B")
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
