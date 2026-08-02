from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.follow_up import FollowUp
from app.schemas.follow_up import FollowUpCreate, FollowUpRead, FollowUpUpdate
from app.schemas.common import Page
from app.pagination import paginate
from app.auth import require_role
from app.constants import Role

router = APIRouter(prefix="/api/follow-ups", tags=["follow-ups"])


@router.get("", response_model=Page[FollowUpRead])
async def list_follow_ups(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    status: str = "",
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER, Role.AGENT)),
):
    stmt = select(FollowUp).order_by(FollowUp.created_at.desc())
    if status:
        stmt = stmt.where(FollowUp.status == status)
    items, total, pages = await paginate(db, stmt, page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page, pages=pages)


@router.get("/{follow_up_id}", response_model=FollowUpRead)
async def get_follow_up(
    follow_up_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER, Role.AGENT)),
):
    result = await db.execute(select(FollowUp).where(FollowUp.id == follow_up_id))
    follow_up = result.scalar_one_or_none()
    if not follow_up:
        raise HTTPException(404, detail="Follow-up not found")
    return follow_up


@router.post("", response_model=FollowUpRead, status_code=201)
async def create_follow_up(
    data: FollowUpCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER, Role.AGENT)),
):
    follow_up_id = f"FU-{__import__('time').time():.6f}".replace(".", "").upper()[:12]
    follow_up = FollowUp(id=follow_up_id, **data.model_dump())
    db.add(follow_up)
    await db.commit()
    await db.refresh(follow_up)
    return follow_up


@router.put("/{follow_up_id}", response_model=FollowUpRead)
async def update_follow_up(
    follow_up_id: str,
    data: FollowUpUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER, Role.AGENT)),
):
    result = await db.execute(select(FollowUp).where(FollowUp.id == follow_up_id))
    follow_up = result.scalar_one_or_none()
    if not follow_up:
        raise HTTPException(404, detail="Follow-up not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(follow_up, field, value)
    await db.commit()
    await db.refresh(follow_up)
    return follow_up


@router.delete("/{follow_up_id}", status_code=204)
async def delete_follow_up(
    follow_up_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER, Role.AGENT)),
):
    result = await db.execute(select(FollowUp).where(FollowUp.id == follow_up_id))
    follow_up = result.scalar_one_or_none()
    if not follow_up:
        raise HTTPException(404, detail="Follow-up not found")
    await db.delete(follow_up)
    await db.commit()
