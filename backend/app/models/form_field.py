from sqlalchemy import Column, String, Boolean, Integer, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB

from app.database import Base


class FormField(Base):
    __tablename__ = "form_fields"

    id = Column(String, primary_key=True)
    section_id = Column(String, nullable=False)
    field_type = Column(String, nullable=False)
    label = Column(String, nullable=False)
    placeholder = Column(String, default="")
    help_text = Column(String, default="")
    default_value = Column(String, default="")
    is_required = Column(Boolean, default=False)
    is_read_only = Column(Boolean, default=False)
    is_hidden = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    validation_rules = Column(JSONB, default=dict)
    metadata_ = Column("metadata", JSONB, default=dict)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
