import time
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.notification_template import NotificationTemplate
from app.models.notification_rule import NotificationRule
from app.schemas.notification import (
    NotificationTemplateCreate,
    NotificationTemplateRead,
    NotificationTemplateUpdate,
    NotificationRuleCreate,
    NotificationRuleRead,
    NotificationRuleUpdate,
)
from app.schemas.common import Page
from app.pagination import paginate
from app.auth import require_role
from app.constants import Role

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


# ── Template Endpoints ──────────────────────────────────────────


@router.get("/templates", response_model=Page[NotificationTemplateRead])
async def list_templates(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    stmt = select(NotificationTemplate).order_by(NotificationTemplate.name)
    items, total, pages = await paginate(db, stmt, page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page, pages=pages)


@router.get("/templates/{template_id}", response_model=NotificationTemplateRead)
async def get_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    result = await db.execute(select(NotificationTemplate).where(NotificationTemplate.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(404, detail="Template not found")
    return template


@router.post("/templates", response_model=NotificationTemplateRead, status_code=201)
async def create_template(
    data: NotificationTemplateCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    template_id = f"NTF-{int(time.time() * 1000)}"
    template = NotificationTemplate(id=template_id, **data.model_dump())
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return template


@router.put("/templates/{template_id}", response_model=NotificationTemplateRead)
async def update_template(
    template_id: str,
    data: NotificationTemplateUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(NotificationTemplate).where(NotificationTemplate.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(404, detail="Template not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(template, field, value)

    await db.commit()
    await db.refresh(template)
    return template


@router.delete("/templates/{template_id}", status_code=204)
async def delete_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(NotificationTemplate).where(NotificationTemplate.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(404, detail="Template not found")
    await db.delete(template)
    await db.commit()


# ── Rule Endpoints ──────────────────────────────────────────────


@router.get("/rules", response_model=Page[NotificationRuleRead])
async def list_rules(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    stmt = select(NotificationRule).order_by(NotificationRule.name)
    items, total, pages = await paginate(db, stmt, page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page, pages=pages)


@router.get("/rules/{rule_id}", response_model=NotificationRuleRead)
async def get_rule(
    rule_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    result = await db.execute(select(NotificationRule).where(NotificationRule.id == rule_id))
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(404, detail="Rule not found")
    return rule


@router.post("/rules", response_model=NotificationRuleRead, status_code=201)
async def create_rule(
    data: NotificationRuleCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    rule_id = f"NTR-{int(time.time() * 1000)}"
    rule = NotificationRule(id=rule_id, **data.model_dump())
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return rule


@router.put("/rules/{rule_id}", response_model=NotificationRuleRead)
async def update_rule(
    rule_id: str,
    data: NotificationRuleUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(NotificationRule).where(NotificationRule.id == rule_id))
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(404, detail="Rule not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(rule, field, value)

    await db.commit()
    await db.refresh(rule)
    return rule


@router.delete("/rules/{rule_id}", status_code=204)
async def delete_rule(
    rule_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(NotificationRule).where(NotificationRule.id == rule_id))
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(404, detail="Rule not found")
    await db.delete(rule)
    await db.commit()
