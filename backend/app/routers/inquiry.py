from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.inquiry import Inquiry
from app.schemas.inquiry import InquiryCreate, InquiryRead, InquiryUpdate

router = APIRouter(prefix="/api/inquiries", tags=["inquiries"])


@router.get("", response_model=list[InquiryRead])
async def list_inquiries(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Inquiry).order_by(Inquiry.created_at.desc()))
    return result.scalars().all()


@router.get("/{inquiry_id}", response_model=InquiryRead)
async def get_inquiry(inquiry_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Inquiry).where(Inquiry.id == inquiry_id))
    inquiry = result.scalar_one_or_none()
    if not inquiry:
        raise HTTPException(404, detail="Inquiry not found")
    return inquiry


@router.post("", response_model=InquiryRead, status_code=201)
async def create_inquiry(data: InquiryCreate, db: AsyncSession = Depends(get_db)):
    inq_id = f"IQ-{__import__('time').time():.6f}".replace(".", "").upper()[:12]
    inquiry = Inquiry(id=inq_id, **data.model_dump())
    db.add(inquiry)
    await db.commit()
    await db.refresh(inquiry)
    return inquiry


@router.put("/{inquiry_id}", response_model=InquiryRead)
async def update_inquiry(inquiry_id: str, data: InquiryUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Inquiry).where(Inquiry.id == inquiry_id))
    inquiry = result.scalar_one_or_none()
    if not inquiry:
        raise HTTPException(404, detail="Inquiry not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(inquiry, field, value)
    await db.commit()
    await db.refresh(inquiry)
    return inquiry


@router.delete("/{inquiry_id}", status_code=204)
async def delete_inquiry(inquiry_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Inquiry).where(Inquiry.id == inquiry_id))
    inquiry = result.scalar_one_or_none()
    if not inquiry:
        raise HTTPException(404, detail="Inquiry not found")
    await db.delete(inquiry)
    await db.commit()
