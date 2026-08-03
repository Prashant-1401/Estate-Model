import time
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.module import Module
from app.schemas.module import ModuleCreate, ModuleRead
from app.schemas.common import Page
from app.pagination import paginate
from app.auth import require_role
from app.constants import Role

router = APIRouter(prefix="/api/modules", tags=["modules"])


@router.get("", response_model=Page[ModuleRead])
async def list_modules(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    stmt = select(Module).order_by(Module.name)
    items, total, pages = await paginate(db, stmt, page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page, pages=pages)


@router.get("/{module_id}", response_model=ModuleRead)
async def get_module(
    module_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    result = await db.execute(select(Module).where(Module.id == module_id))
    module = result.scalar_one_or_none()
    if not module:
        raise HTTPException(404, detail="Module not found")
    return module


@router.post("", response_model=ModuleRead, status_code=201)
async def create_module(
    data: ModuleCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    module_id = f"MOD-{int(time.time() * 1000)}"
    module = Module(id=module_id, **data.model_dump())
    db.add(module)
    await db.commit()
    await db.refresh(module)
    return module


@router.put("/{module_id}", response_model=ModuleRead)
async def update_module(
    module_id: str,
    data: dict,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(Module).where(Module.id == module_id))
    module = result.scalar_one_or_none()
    if not module:
        raise HTTPException(404, detail="Module not found")
    for field, value in data.items():
        if hasattr(module, field):
            setattr(module, field, value)
    await db.commit()
    await db.refresh(module)
    return module


@router.delete("/{module_id}", status_code=204)
async def delete_module(
    module_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(Module).where(Module.id == module_id))
    module = result.scalar_one_or_none()
    if not module:
        raise HTTPException(404, detail="Module not found")
    await db.delete(module)
    await db.commit()
