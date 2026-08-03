from sqlalchemy import Column, String, DateTime, func

from app.database import Base


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(String, primary_key=True)
    module_id = Column(String, nullable=False)
    action = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
