from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.property import Property
from app.models.user import User
from app.schemas.property import PropertyCreate, PropertyRead, PropertyUpdate
from app.schemas.common import Page
from app.pagination import paginate
from app.auth import require_role
from app.constants import Role

router = APIRouter(prefix="/api/properties", tags=["properties"])


@router.get("", response_model=Page[PropertyRead])
async def list_properties(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: str = "",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.ADMIN, Role.MANAGER, Role.AGENT)),
):
    stmt = select(Property).order_by(Property.created_at.desc())
    if search:
        like = f"%{search}%"
        stmt = stmt.where(
            or_(Property.title.ilike(like), Property.location.ilike(like))
        )
    if current_user.role == Role.AGENT:
        stmt = stmt.where(Property.agent_id == current_user.id)
    items, total, pages = await paginate(db, stmt, page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page, pages=pages)


@router.get("/{property_id}", response_model=PropertyRead)
async def get_property(
    property_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.ADMIN, Role.MANAGER, Role.AGENT)),
):
    result = await db.execute(select(Property).where(Property.id == property_id))
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(404, detail="Property not found")
    if current_user.role == Role.AGENT and prop.agent_id != current_user.id:
        raise HTTPException(403, detail="Property not assigned to you")
    return prop


@router.post("", response_model=PropertyRead, status_code=201)
async def create_property(
    data: PropertyCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    prop_id = f"PR-{__import__('time').time():.6f}".replace(".", "").upper()[:12]
    prop = Property(id=prop_id, **data.model_dump())
    db.add(prop)
    await db.commit()
    await db.refresh(prop)
    return prop


@router.put("/{property_id}", response_model=PropertyRead)
async def update_property(
    property_id: str,
    data: PropertyUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    result = await db.execute(select(Property).where(Property.id == property_id))
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(404, detail="Property not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(prop, field, value)
    await db.commit()
    await db.refresh(prop)
    return prop


@router.delete("/{property_id}", status_code=204)
async def delete_property(
    property_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    result = await db.execute(select(Property).where(Property.id == property_id))
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(404, detail="Property not found")
    await db.delete(prop)
    await db.commit()
