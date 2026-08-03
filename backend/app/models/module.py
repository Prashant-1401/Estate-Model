from sqlalchemy import Column, String, Boolean, DateTime, func

from app.database import Base


class Module(Base):
    __tablename__ = "modules"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    slug = Column(String, nullable=False, unique=True)
    description = Column(String, default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
