import time
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.role import Role as RoleModel
from app.models.permission import Permission
from app.models.role_permission import RolePermission
from app.models.module import Module
from app.schemas.role import (
    RoleCreate,
    RoleRead,
    RoleUpdate,
    PermissionCreate,
    PermissionRead,
    RolePermissionMatrix,
)
from app.schemas.common import Page
from app.pagination import paginate
from app.auth import require_role
from app.constants import Role

router = APIRouter(prefix="/api/roles", tags=["roles"])
permission_router = APIRouter(prefix="/api/permissions", tags=["permissions"])


# ── Role Endpoints ──────────────────────────────────────────────


@router.get("", response_model=Page[RoleRead])
async def list_roles(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    stmt = select(RoleModel).order_by(RoleModel.hierarchy_level, RoleModel.name)
    items, total, pages = await paginate(db, stmt, page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page, pages=pages)


@router.get("/all", response_model=list[RoleRead])
async def list_all_roles(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    stmt = select(RoleModel).where(RoleModel.is_active == True).order_by(RoleModel.hierarchy_level)
    result = await db.execute(stmt)
    roles = result.scalars().all()

    role_reads = []
    for role in roles:
        role_data = RoleRead.model_validate(role)

        perm_stmt = (
            select(Permission)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .where(RolePermission.role_id == role.id)
        )
        perm_result = await db.execute(perm_stmt)
        role_data.permissions = [PermissionRead.model_validate(p) for p in perm_result.scalars().all()]
        role_reads.append(role_data)

    return role_reads


@router.get("/{role_id}", response_model=RoleRead)
async def get_role(
    role_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    result = await db.execute(select(RoleModel).where(RoleModel.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(404, detail="Role not found")

    role_data = RoleRead.model_validate(role)

    perm_stmt = (
        select(Permission)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .where(RolePermission.role_id == role.id)
    )
    perm_result = await db.execute(perm_stmt)
    role_data.permissions = [PermissionRead.model_validate(p) for p in perm_result.scalars().all()]

    return role_data


@router.post("", response_model=RoleRead, status_code=201)
async def create_role(
    data: RoleCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    existing = await db.execute(select(RoleModel).where(RoleModel.slug == data.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(400, detail="Role with this slug already exists")

    role_id = f"ROL-{int(time.time() * 1000)}"
    role = RoleModel(
        id=role_id,
        name=data.name,
        slug=data.slug,
        description=data.description,
        hierarchy_level=data.hierarchy_level,
    )
    db.add(role)
    await db.flush()

    for perm_id in data.permission_ids:
        rp = RolePermission(
            id=f"RP-{int(time.time() * 1000)}-{perm_id[:8]}",
            role_id=role_id,
            permission_id=perm_id,
        )
        db.add(rp)

    await db.commit()
    await db.refresh(role)

    role_data = RoleRead.model_validate(role)
    perm_stmt = (
        select(Permission)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .where(RolePermission.role_id == role_id)
    )
    perm_result = await db.execute(perm_stmt)
    role_data.permissions = [PermissionRead.model_validate(p) for p in perm_result.scalars().all()]

    return role_data


@router.put("/{role_id}", response_model=RoleRead)
async def update_role(
    role_id: str,
    data: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(RoleModel).where(RoleModel.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(404, detail="Role not found")
    if role.is_system:
        raise HTTPException(400, detail="Cannot modify system role")

    if data.name is not None:
        role.name = data.name
    if data.slug is not None:
        existing = await db.execute(
            select(RoleModel).where(RoleModel.slug == data.slug, RoleModel.id != role_id)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(400, detail="Role with this slug already exists")
        role.slug = data.slug
    if data.description is not None:
        role.description = data.description
    if data.hierarchy_level is not None:
        role.hierarchy_level = data.hierarchy_level
    if data.is_active is not None:
        role.is_active = data.is_active

    if data.permission_ids is not None:
        await db.execute(delete(RolePermission).where(RolePermission.role_id == role_id))
        for perm_id in data.permission_ids:
            rp = RolePermission(
                id=f"RP-{int(time.time() * 1000)}-{perm_id[:8]}",
                role_id=role_id,
                permission_id=perm_id,
            )
            db.add(rp)

    await db.commit()
    await db.refresh(role)

    role_data = RoleRead.model_validate(role)
    perm_stmt = (
        select(Permission)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .where(RolePermission.role_id == role_id)
    )
    perm_result = await db.execute(perm_stmt)
    role_data.permissions = [PermissionRead.model_validate(p) for p in perm_result.scalars().all()]

    return role_data


@router.delete("/{role_id}", status_code=204)
async def delete_role(
    role_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(RoleModel).where(RoleModel.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(404, detail="Role not found")
    if role.is_system:
        raise HTTPException(400, detail="Cannot delete system role")
    await db.execute(delete(RolePermission).where(RolePermission.role_id == role_id))
    await db.delete(role)
    await db.commit()


# ── Permission Endpoints ────────────────────────────────────────


@permission_router.get("", response_model=list[PermissionRead])
async def list_permissions(
    module_id: str = "",
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    stmt = select(Permission)
    if module_id:
        stmt = stmt.where(Permission.module_id == module_id)
    stmt = stmt.order_by(Permission.module_id, Permission.action)
    result = await db.execute(stmt)
    permissions = result.scalars().all()

    perm_reads = []
    for perm in permissions:
        perm_data = PermissionRead.model_validate(perm)
        module_result = await db.execute(select(Module).where(Module.id == perm.module_id))
        module = module_result.scalar_one_or_none()
        if module:
            perm_data.module_name = module.name
        perm_reads.append(perm_data)

    return perm_reads


@permission_router.get("/matrix", response_model=RolePermissionMatrix)
async def get_permission_matrix(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN, Role.MANAGER)),
):
    modules_result = await db.execute(select(Module).where(Module.is_active == True).order_by(Module.name))
    modules = modules_result.scalars().all()

    actions = ["view", "create", "edit", "delete", "export"]

    matrix = {}
    for module in modules:
        matrix[module.slug] = {action: False for action in actions}

    return RolePermissionMatrix(
        modules=[{"id": m.id, "name": m.name, "slug": m.slug} for m in modules],
        actions=actions,
        matrix=matrix,
    )


@permission_router.post("", response_model=PermissionRead, status_code=201)
async def create_permission(
    data: PermissionCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    perm_id = f"PERM-{int(time.time() * 1000)}"
    permission = Permission(id=perm_id, **data.model_dump())
    db.add(permission)
    await db.commit()
    await db.refresh(permission)
    return permission


@permission_router.delete("/{permission_id}", status_code=204)
async def delete_permission(
    permission_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(Role.ADMIN)),
):
    result = await db.execute(select(Permission).where(Permission.id == permission_id))
    permission = result.scalar_one_or_none()
    if not permission:
        raise HTTPException(404, detail="Permission not found")
    await db.execute(delete(RolePermission).where(RolePermission.permission_id == permission_id))
    await db.delete(permission)
    await db.commit()
