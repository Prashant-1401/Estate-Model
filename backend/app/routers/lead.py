from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadRead, LeadUpdate
from app.schemas.common import Page
from app.pagination import paginate
from app.auth import require_role
from app.constants import Role

router = APIRouter(prefix="/api/leads", tags=["leads"])


@router.get("", response_model=Page[LeadRead])
async def list_leads(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: str = "",
    status: str = "",
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER, Role.AGENT)),
):
    stmt = select(Lead).order_by(Lead.created_at.desc())
    if search:
        like = f"%{search}%"
        stmt = stmt.where(
            or_(Lead.name.ilike(like), Lead.phone.ilike(like), Lead.id.ilike(like))
        )
    if status:
        stmt = stmt.where(Lead.status == status)
    items, total, pages = await paginate(db, stmt, page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page, pages=pages)


@router.get("/{lead_id}", response_model=LeadRead)
async def get_lead(
    lead_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER, Role.AGENT)),
):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(404, detail="Lead not found")
    return lead


@router.post("", response_model=LeadRead, status_code=201)
async def create_lead(
    data: LeadCreate,
    db: AsyncSession = Depends(get_db),
):
    lead_id = f"LD-{__import__('time').time():.6f}".replace(".", "").upper()[:12]
    lead = Lead(id=lead_id, **data.model_dump())
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return lead


@router.put("/{lead_id}", response_model=LeadRead)
async def update_lead(
    lead_id: str,
    data: LeadUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(404, detail="Lead not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(lead, field, value)
    await db.commit()
    await db.refresh(lead)
    return lead


@router.delete("/{lead_id}", status_code=204)
async def delete_lead(
    lead_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(404, detail="Lead not found")
    await db.delete(lead)
    await db.commit()
