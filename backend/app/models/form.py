from sqlalchemy import Column, String, Boolean, DateTime, func

from app.database import Base


class Form(Base):
    __tablename__ = "forms"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    description = Column(String, default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
