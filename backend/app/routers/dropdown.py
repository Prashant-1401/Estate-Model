import time
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.dropdown import Dropdown, DropdownOption
from app.schemas.dropdown import DropdownCategoryRead, DropdownCreate, DropdownRead, DropdownUpdate
from app.schemas.common import Page
from app.pagination import paginate
from app.auth import require_role
from app.constants import Role

router = APIRouter(prefix="/api/dropdowns", tags=["dropdowns"])


@router.get("", response_model=Page[DropdownRead])
async def list_dropdowns(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    category: str = "",
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    stmt = select(DropdownOption).order_by(DropdownOption.category, DropdownOption.sort_order, DropdownOption.label)
    if category:
        stmt = stmt.where(DropdownOption.category == category)
    items, total, pages = await paginate(db, stmt, page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page, pages=pages)


@router.get("/all", response_model=list[DropdownRead])
async def list_all_dropdowns(
    category: str = "",
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(DropdownOption)
        .where(DropdownOption.is_active == True)
        .order_by(DropdownOption.sort_order, DropdownOption.label)
    )
    if category:
        stmt = stmt.where(DropdownOption.category == category)
    result = await db.execute(stmt)
    return [DropdownRead.model_validate(o) for o in result.scalars().all()]


@router.get("/list", response_model=list[DropdownCategoryRead])
async def list_dropdown_categories(
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Dropdown)
        .where(Dropdown.is_active == True)
        .order_by(Dropdown.sort_order, Dropdown.label)
    )
    result = await db.execute(stmt)
    return [DropdownCategoryRead.model_validate(d) for d in result.scalars().all()]


@router.post("", response_model=DropdownRead, status_code=201)
async def create_dropdown_option(
    data: DropdownCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    option_id = f"DD-{int(time.time() * 1000)}"
    option = DropdownOption(id=option_id, **data.model_dump())
    db.add(option)
    await db.commit()
    await db.refresh(option)
    return option


@router.put("/{option_id}", response_model=DropdownRead)
async def update_dropdown_option(
    option_id: str,
    data: DropdownUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(DropdownOption).where(DropdownOption.id == option_id))
    option = result.scalar_one_or_none()
    if not option:
        raise HTTPException(404, detail="Dropdown option not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(option, field, value)

    await db.commit()
    await db.refresh(option)
    return option


@router.delete("/{option_id}", status_code=204)
async def delete_dropdown_option(
    option_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(DropdownOption).where(DropdownOption.id == option_id))
    option = result.scalar_one_or_none()
    if not option:
        raise HTTPException(404, detail="Dropdown option not found")
    await db.delete(option)
    await db.commit()
