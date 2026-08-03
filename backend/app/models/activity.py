from sqlalchemy import Column, String, DateTime, func

from app.database import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(String, primary_key=True)
    lead_id = Column(String, nullable=False)
    type = Column(String, nullable=False)
    description = Column(String, default="")
    note = Column(String, default="")
    performed_by = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
