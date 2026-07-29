from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadRead, LeadUpdate

router = APIRouter(prefix="/api/leads", tags=["leads"])


@router.get("", response_model=list[LeadRead])
async def list_leads(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).order_by(Lead.created_at.desc()))
    return result.scalars().all()


@router.get("/{lead_id}", response_model=LeadRead)
async def get_lead(lead_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(404, detail="Lead not found")
    return lead


@router.post("", response_model=LeadRead, status_code=201)
async def create_lead(data: LeadCreate, db: AsyncSession = Depends(get_db)):
    lead_id = f"LD-{__import__('time').time():.6f}".replace(".", "").upper()[:12]
    lead = Lead(id=lead_id, **data.model_dump())
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return lead


@router.put("/{lead_id}", response_model=LeadRead)
async def update_lead(lead_id: str, data: LeadUpdate, db: AsyncSession = Depends(get_db)):
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
async def delete_lead(lead_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(404, detail="Lead not found")
    await db.delete(lead)
    await db.commit()
