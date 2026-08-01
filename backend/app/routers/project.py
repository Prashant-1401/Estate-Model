from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from app.schemas.common import Page
from app.pagination import paginate
from app.auth import require_role
from app.constants import Role

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=Page[ProjectRead])
async def list_projects(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: str = "",
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER, Role.AGENT)),
):
    stmt = select(Project).order_by(Project.created_at.desc())
    if search:
        like = f"%{search}%"
        stmt = stmt.where(
            or_(Project.name.ilike(like), Project.developer.ilike(like), Project.location.ilike(like))
        )
    items, total, pages = await paginate(db, stmt, page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page, pages=pages)


@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER, Role.AGENT)),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, detail="Project not found")
    return project


@router.post("", response_model=ProjectRead, status_code=201)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    project_id = f"PJ-{__import__('time').time():.6f}".replace(".", "").upper()[:12]
    project = Project(id=project_id, **data.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@router.put("/{project_id}", response_model=ProjectRead)
async def update_project(
    project_id: str,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, detail="Project not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    await db.commit()
    await db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, detail="Project not found")
    await db.delete(project)
    await db.commit()
