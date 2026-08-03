import time
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.status import Status
from app.models.lead_source import LeadSource
from app.schemas.status import (
    StatusCreate,
    StatusRead,
    StatusUpdate,
    LeadSourceCreate,
    LeadSourceRead,
    LeadSourceUpdate,
)
from app.schemas.common import Page
from app.pagination import paginate
from app.auth import require_role
from app.constants import Role

router = APIRouter(prefix="/api/config", tags=["config"])


# ── Status Endpoints ────────────────────────────────────────────


@router.get("/statuses", response_model=Page[StatusRead])
async def list_statuses(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    entity_type: str = "",
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    stmt = select(Status).order_by(Status.sort_order, Status.name)
    if entity_type:
        stmt = stmt.where(Status.entity_type == entity_type)
    items, total, pages = await paginate(db, stmt, page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page, pages=pages)


@router.get("/statuses/all", response_model=list[StatusRead])
async def list_all_statuses(
    entity_type: str = "",
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Status).where(Status.is_active == True).order_by(Status.sort_order)
    if entity_type:
        stmt = stmt.where(Status.entity_type == entity_type)
    result = await db.execute(stmt)
    return [StatusRead.model_validate(s) for s in result.scalars().all()]


@router.post("/statuses", response_model=StatusRead, status_code=201)
async def create_status(
    data: StatusCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    status_id = f"STS-{int(time.time() * 1000)}"
    status = Status(id=status_id, **data.model_dump())
    db.add(status)
    await db.commit()
    await db.refresh(status)
    return status


@router.put("/statuses/{status_id}", response_model=StatusRead)
async def update_status(
    status_id: str,
    data: StatusUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(Status).where(Status.id == status_id))
    status = result.scalar_one_or_none()
    if not status:
        raise HTTPException(404, detail="Status not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(status, field, value)

    await db.commit()
    await db.refresh(status)
    return status


@router.delete("/statuses/{status_id}", status_code=204)
async def delete_status(
    status_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(Status).where(Status.id == status_id))
    status = result.scalar_one_or_none()
    if not status:
        raise HTTPException(404, detail="Status not found")
    await db.delete(status)
    await db.commit()


# ── Lead Source Endpoints ───────────────────────────────────────


@router.get("/lead-sources", response_model=Page[LeadSourceRead])
async def list_lead_sources(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    stmt = select(LeadSource).order_by(LeadSource.sort_order, LeadSource.name)
    items, total, pages = await paginate(db, stmt, page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page, pages=pages)


@router.get("/lead-sources/all", response_model=list[LeadSourceRead])
async def list_all_lead_sources(
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LeadSource).where(LeadSource.is_active == True).order_by(LeadSource.sort_order)
    result = await db.execute(stmt)
    return [LeadSourceRead.model_validate(s) for s in result.scalars().all()]


@router.post("/lead-sources", response_model=LeadSourceRead, status_code=201)
async def create_lead_source(
    data: LeadSourceCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    existing = await db.execute(select(LeadSource).where(LeadSource.slug == data.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(400, detail="Lead source with this slug already exists")

    source_id = f"LDS-{int(time.time() * 1000)}"
    source = LeadSource(id=source_id, **data.model_dump())
    db.add(source)
    await db.commit()
    await db.refresh(source)
    return source


@router.put("/lead-sources/{source_id}", response_model=LeadSourceRead)
async def update_lead_source(
    source_id: str,
    data: LeadSourceUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(LeadSource).where(LeadSource.id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(404, detail="Lead source not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(source, field, value)

    await db.commit()
    await db.refresh(source)
    return source


@router.delete("/lead-sources/{source_id}", status_code=204)
async def delete_lead_source(
    source_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(LeadSource).where(LeadSource.id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(404, detail="Lead source not found")
    await db.delete(source)
    await db.commit()
