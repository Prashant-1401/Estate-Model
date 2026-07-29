from sqlalchemy import Column, String, Integer, DateTime, func

from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    developer = Column(String, default="")
    location = Column(String, default="")
    status = Column(String, default="Planning")
    total_units = Column(Integer, default=0)
    units_sold = Column(Integer, default=0)
    launch_date = Column(String, default="")
    completion_date = Column(String, default="")
    price_range = Column(String, default="")
    description = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
