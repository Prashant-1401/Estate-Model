from sqlalchemy import Column, String, DateTime, func, UniqueConstraint

from app.database import Base


class RolePermission(Base):
    __tablename__ = "role_permissions"

    id = Column(String, primary_key=True)
    role_id = Column(String, nullable=False)
    permission_id = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("role_id", "permission_id", name="uq_role_permission"),
    )
