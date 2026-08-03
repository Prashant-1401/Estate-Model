from sqlalchemy import Column, String, Boolean, Integer, DateTime, func

from app.database import Base


class FormSection(Base):
    __tablename__ = "form_sections"

    id = Column(String, primary_key=True)
    form_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, default="")
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
