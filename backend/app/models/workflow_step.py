from sqlalchemy import Column, String, Boolean, Integer, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB

from app.database import Base


class WorkflowStep(Base):
    __tablename__ = "workflow_steps"

    id = Column(String, primary_key=True)
    workflow_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    step_type = Column(String, nullable=False)
    action = Column(String, nullable=False)
    config = Column(JSONB, default=dict)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
