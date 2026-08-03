from sqlalchemy import Column, String, Boolean, Integer, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB

from app.database import Base


class DashboardWidget(Base):
    __tablename__ = "dashboard_widgets"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    widget_type = Column(String, nullable=False)
    description = Column(String, default="")
    config = Column(JSONB, default=dict)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class UserDashboard(Base):
    __tablename__ = "user_dashboards"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    widgets = Column(JSONB, default=list)
    layout = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
