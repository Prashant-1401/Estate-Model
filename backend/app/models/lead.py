from sqlalchemy import Column, String, DateTime, func

from app.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, default="")
    budget = Column(String, default="")
    area = Column(String, default="")
    type = Column(String, default="")
    source = Column(String, default="Direct")
    status = Column(String, default="New")
    assigned = Column(String, default="Unassigned")
    date = Column(String, default="")
    property_id = Column(String, nullable=True)
    assigned_to = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
