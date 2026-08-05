from sqlalchemy import Column, String, Integer, Boolean, DateTime, func
from sqlalchemy import JSON

from app.database import Base


class Property(Base):
    __tablename__ = "properties"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    location = Column(String, nullable=False)
    price = Column(String, default="")
    bedrooms = Column(Integer, default=0)
    bathrooms = Column(Integer, default=0)
    area = Column(String, default="")
    type = Column(String, default="")
    status = Column(String, default="Available")
    images = Column(JSON, default=list)
    featured = Column(Boolean, default=False)
    project_id = Column(String, nullable=True)
    agent_id = Column(String, nullable=True)
    agent_name = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
