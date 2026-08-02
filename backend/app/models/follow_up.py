from sqlalchemy import Column, String, DateTime, func

from app.database import Base


class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(String, primary_key=True)
    lead_id = Column(String, nullable=False)
    lead_name = Column(String, nullable=False)
    property_title = Column(String, default="")
    assigned_to = Column(String, default="")
    status = Column(String, default="Today")
    time = Column(String, default="")
    note = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
