from sqlalchemy import Column, String, Boolean, Integer, DateTime, func

from app.database import Base


class Dropdown(Base):
    __tablename__ = "dropdowns"

    id = Column(String, primary_key=True)
    key = Column(String, unique=True, nullable=False)
    label = Column(String, nullable=False)
    description = Column(String, default="")
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DropdownOption(Base):
    __tablename__ = "dropdown_options"

    id = Column(String, primary_key=True)
    category = Column(String, nullable=False, index=True)
    label = Column(String, nullable=False)
    value = Column(String, nullable=False)
    color = Column(String, default="")
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
