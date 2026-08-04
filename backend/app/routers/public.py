import time
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.database import get_db
from app.models.lead import Lead
from app.models.user import User
from app.schemas.lead import LeadRead, PublicLeadCreate
from app.schemas.user import UserRead
from app.auth import hash_password

router = APIRouter(prefix="/api/public", tags=["public"])


# ── Agent Self-Registration ──────────────────────────────────────


class AgentRegisterRequest(BaseModel):
    name: str
    email: str
    phone: str = ""
    password: str
    confirm_password: str


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


@router.post("/register", response_model=UserRead, status_code=201)
async def register_agent(
    data: AgentRegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    if data.password != data.confirm_password:
        raise HTTPException(422, detail="Passwords do not match")
    if len(data.password) < 8:
        raise HTTPException(422, detail="Password must be at least 8 characters")

    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(409, detail="An account with this email already exists")

    user_id = f"UR-{time.time():.6f}".replace(".", "").upper()[:12]
    user = User(
        id=user_id,
        name=data.name,
        email=data.email,
        phone=data.phone,
        role="agent",
        status="Pending",          # admin must approve before login is allowed
        created=_display_date(date.today()),
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
