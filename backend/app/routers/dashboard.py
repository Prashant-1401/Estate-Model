from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.lead import Lead
from app.models.property import Property
from app.models.project import Project
from app.models.user import User
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    total_leads = (await db.execute(select(func.count(Lead.id)))).scalar() or 0

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_leads = (
        await db.execute(select(func.count(Lead.id)).where(Lead.created_at >= today_start))
    ).scalar() or 0

    hot_leads = (
        await db.execute(select(func.count(Lead.id)).where(Lead.status == "Hot"))
    ).scalar() or 0

    total_properties = (await db.execute(select(func.count(Property.id)))).scalar() or 0
    available_properties = (
        await db.execute(select(func.count(Property.id)).where(Property.status == "Available"))
    ).scalar() or 0
    sold_properties = (
        await db.execute(select(func.count(Property.id)).where(Property.status == "Sold"))
    ).scalar() or 0

    total_projects = (await db.execute(select(func.count(Project.id)))).scalar() or 0
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0

    return DashboardStats(
        total_leads=total_leads,
        today_leads=today_leads,
        hot_leads=hot_leads,
        total_properties=total_properties,
        available_properties=available_properties,
        sold_properties=sold_properties,
        total_projects=total_projects,
        total_users=total_users,
    )
