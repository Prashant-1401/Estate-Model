from datetime import datetime
from pydantic import BaseModel


class PermissionBase(BaseModel):
    module_id: str
    action: str
    name: str
    description: str = ""


class PermissionCreate(PermissionBase):
    pass


class PermissionRead(PermissionBase):
    id: str
    module_name: str = ""
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class RoleBase(BaseModel):
    name: str
    description: str = ""
    hierarchy_level: int = 0


class RoleCreate(RoleBase):
    slug: str
    permission_ids: list[str] = []


class RoleUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    hierarchy_level: int | None = None
    is_active: bool | None = None
    permission_ids: list[str] | None = None


class RoleRead(RoleBase):
    id: str
    slug: str
    is_system: bool = False
    is_active: bool = True
    permissions: list[PermissionRead] = []
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class RolePermissionMatrix(BaseModel):
    modules: list[dict]
    actions: list[str]
    matrix: dict[str, dict[str, bool]]
