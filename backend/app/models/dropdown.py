from sqlalchemy import Column, String, Boolean, Integer, DateTime, func

from app.database import Base


class DropdownOption(Base):
    __tablename__ = "dropdown_options"

    id = Column(String, primary_key=True)
    category = Column(String, nullable=False)
    label = Column(String, nullable=False)
    value = Column(String, nullable=False)
    color = Column(String, default="")
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
