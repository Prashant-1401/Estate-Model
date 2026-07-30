from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.property import Property
from app.schemas.property import PropertyCreate, PropertyRead, PropertyUpdate
from app.auth import require_role
from app.constants import Role

router = APIRouter(prefix="/api/properties", tags=["properties"])


@router.get("", response_model=list[PropertyRead])
async def list_properties(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER, Role.AGENT)),
):
    result = await db.execute(select(Property).order_by(Property.created_at.desc()))
    return result.scalars().all()


@router.get("/{property_id}", response_model=PropertyRead)
async def get_property(
    property_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER, Role.AGENT)),
):
    result = await db.execute(select(Property).where(Property.id == property_id))
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(404, detail="Property not found")
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
