import time
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.dashboard_widget import DashboardWidget, UserDashboard
from app.schemas.dashboard_widget import (
    DashboardWidgetCreate,
    DashboardWidgetRead,
    DashboardWidgetUpdate,
    UserDashboardCreate,
    UserDashboardRead,
    UserDashboardUpdate,
)
from app.schemas.common import Page
from app.pagination import paginate
from app.auth import require_role, get_current_user
from app.constants import Role

router = APIRouter(prefix="/api/dashboard-config", tags=["dashboard-config"])


# ── Widget Endpoints ────────────────────────────────────────────


@router.get("/widgets", response_model=Page[DashboardWidgetRead])
async def list_widgets(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    stmt = select(DashboardWidget).order_by(DashboardWidget.sort_order, DashboardWidget.name)
    items, total, pages = await paginate(db, stmt, page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page, pages=pages)


@router.get("/widgets/all", response_model=list[DashboardWidgetRead])
async def list_all_widgets(
    db: AsyncSession = Depends(get_db),
):
    stmt = select(DashboardWidget).where(DashboardWidget.is_active == True).order_by(DashboardWidget.sort_order)
    result = await db.execute(stmt)
    return [DashboardWidgetRead.model_validate(w) for w in result.scalars().all()]


@router.get("/widgets/{widget_id}", response_model=DashboardWidgetRead)
async def get_widget(
    widget_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    result = await db.execute(select(DashboardWidget).where(DashboardWidget.id == widget_id))
    widget = result.scalar_one_or_none()
    if not widget:
        raise HTTPException(404, detail="Widget not found")
    return widget


@router.post("/widgets", response_model=DashboardWidgetRead, status_code=201)
async def create_widget(
    data: DashboardWidgetCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    widget_id = f"DW-{int(time.time() * 1000)}"
    widget = DashboardWidget(id=widget_id, **data.model_dump())
    db.add(widget)
    await db.commit()
    await db.refresh(widget)
    return widget


@router.put("/widgets/{widget_id}", response_model=DashboardWidgetRead)
async def update_widget(
    widget_id: str,
    data: DashboardWidgetUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(DashboardWidget).where(DashboardWidget.id == widget_id))
    widget = result.scalar_one_or_none()
    if not widget:
        raise HTTPException(404, detail="Widget not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(widget, field, value)

    await db.commit()
    await db.refresh(widget)
    return widget


@router.delete("/widgets/{widget_id}", status_code=204)
async def delete_widget(
    widget_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(DashboardWidget).where(DashboardWidget.id == widget_id))
    widget = result.scalar_one_or_none()
    if not widget:
        raise HTTPException(404, detail="Widget not found")
    await db.delete(widget)
    await db.commit()


# ── User Dashboard Endpoints ────────────────────────────────────


@router.get("/my-dashboard", response_model=UserDashboardRead)
async def get_my_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(UserDashboard).where(UserDashboard.user_id == current_user.id)
    )
    dashboard = result.scalar_one_or_none()
    if not dashboard:
        dashboard_id = f"UD-{int(time.time() * 1000)}"
        dashboard = UserDashboard(
            id=dashboard_id,
            user_id=current_user.id,
            widgets=[],
            layout={},
        )
        db.add(dashboard)
        await db.commit()
        await db.refresh(dashboard)
    return dashboard


@router.put("/my-dashboard", response_model=UserDashboardRead)
async def update_my_dashboard(
    data: UserDashboardUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(UserDashboard).where(UserDashboard.user_id == current_user.id)
    )
    dashboard = result.scalar_one_or_none()
    if not dashboard:
        dashboard_id = f"UD-{int(time.time() * 1000)}"
        dashboard = UserDashboard(
            id=dashboard_id,
            user_id=current_user.id,
            widgets=data.widgets or [],
            layout=data.layout or {},
        )
        db.add(dashboard)
    else:
        if data.widgets is not None:
            dashboard.widgets = data.widgets
        if data.layout is not None:
            dashboard.layout = data.layout

    await db.commit()
    await db.refresh(dashboard)
    return dashboard
