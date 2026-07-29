from sqlalchemy import Column, String, DateTime, func

from app.database import Base


class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, default="")
    property_type = Column(String, default="")
    area = Column(String, default="")
    budget = Column(String, default="")
    message = Column(String, default="")
    source = Column(String, default="Website")
    status = Column(String, default="New")
    date = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
