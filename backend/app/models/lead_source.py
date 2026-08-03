from sqlalchemy import Column, String, Boolean, Integer, DateTime, func

from app.database import Base


class LeadSource(Base):
    __tablename__ = "lead_sources"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    slug = Column(String, nullable=False, unique=True)
    description = Column(String, default="")
    icon = Column(String, default="")
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
