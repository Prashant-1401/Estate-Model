import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyRead, CompanyUpdate
from app.auth import require_role
from app.constants import Role

router = APIRouter(prefix="/api/company", tags=["company"])


@router.get("", response_model=CompanyRead)
async def get_company(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Company).where(Company.is_active == True).limit(1))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(404, detail="Company not found")
    return company


@router.post("", response_model=CompanyRead, status_code=201)
async def create_company(
    data: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    existing = await db.execute(select(Company).where(Company.is_active == True).limit(1))
    if existing.scalar_one_or_none():
        raise HTTPException(400, detail="Company already exists")

    company_id = f"COM-{int(time.time() * 1000)}"
    company = Company(id=company_id, **data.model_dump())
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return company


@router.put("", response_model=CompanyRead)
async def update_company(
    data: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(Company).where(Company.is_active == True).limit(1))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(404, detail="Company not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(company, field):
            setattr(company, field, value)

    await db.commit()
    await db.refresh(company)
    return company
