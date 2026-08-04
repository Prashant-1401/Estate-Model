import time
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.lead import Lead
from app.schemas.lead import LeadRead, PublicLeadCreate

router = APIRouter(prefix="/api/public", tags=["public"])


def _display_date(today: date) -> str:
    return f"{today.strftime('%b')} {today.day}, {today.year}"


@router.post("/leads", response_model=LeadRead, status_code=201)
async def create_public_lead(
    data: PublicLeadCreate,
    db: AsyncSession = Depends(get_db),
):
    lead_id = f"LD-{__import__('time').time():.6f}".replace(".", "").upper()[:12]
    lead = Lead(
        id=lead_id,
        name=data.name,
        phone=data.phone,
        email=data.email,
        budget=data.budget,
        area=data.area,
        type=data.type,
        source="Website",
        status="New",
        assigned="Unassigned",
        requirement=data.requirement,
        date=_display_date(date.today()),
    )
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return lead
