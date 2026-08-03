"""create configurable tables

Revision ID: 0005
Revises: 0004
Create Date: 2026-08-03
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def _has_table(conn, table_name):
    inspector = sa.inspect(conn)
    return table_name in inspector.get_table_names()


def upgrade():
    conn = op.get_bind()

    # Modules table
    if not _has_table(conn, "modules"):
        op.create_table(
            "modules",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("slug", sa.String(), nullable=False, unique=True),
            sa.Column("description", sa.String(), default=""),
            sa.Column("is_active", sa.Boolean(), default=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    # Roles table
    if not _has_table(conn, "roles"):
        op.create_table(
            "roles",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("slug", sa.String(), nullable=False, unique=True),
            sa.Column("description", sa.String(), default=""),
            sa.Column("hierarchy_level", sa.Integer(), default=0),
            sa.Column("is_system", sa.Boolean(), default=False),
            sa.Column("is_active", sa.Boolean(), default=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        )

    # Permissions table
    if not _has_table(conn, "permissions"):
        op.create_table(
            "permissions",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("module_id", sa.String(), nullable=False),
            sa.Column("action", sa.String(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("description", sa.String(), default=""),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    # Role-Permission mapping table
    if not _has_table(conn, "role_permissions"):
        op.create_table(
            "role_permissions",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("role_id", sa.String(), nullable=False),
            sa.Column("permission_id", sa.String(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.UniqueConstraint("role_id", "permission_id", name="uq_role_permission"),
        )

    # Forms table
    if not _has_table(conn, "forms"):
        op.create_table(
            "forms",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("entity_type", sa.String(), nullable=False),
            sa.Column("description", sa.String(), default=""),
            sa.Column("is_active", sa.Boolean(), default=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        )

    # Form Sections table
    if not _has_table(conn, "form_sections"):
        op.create_table(
            "form_sections",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("form_id", sa.String(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("description", sa.String(), default=""),
            sa.Column("sort_order", sa.Integer(), default=0),
            sa.Column("is_active", sa.Boolean(), default=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    # Form Fields table
    if not _has_table(conn, "form_fields"):
        op.create_table(
            "form_fields",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("section_id", sa.String(), nullable=False),
            sa.Column("field_type", sa.String(), nullable=False),
            sa.Column("label", sa.String(), nullable=False),
            sa.Column("placeholder", sa.String(), default=""),
            sa.Column("help_text", sa.String(), default=""),
            sa.Column("default_value", sa.String(), default=""),
            sa.Column("is_required", sa.Boolean(), default=False),
            sa.Column("is_read_only", sa.Boolean(), default=False),
            sa.Column("is_hidden", sa.Boolean(), default=False),
            sa.Column("sort_order", sa.Integer(), default=0),
            sa.Column("validation_rules", postgresql.JSONB(), default=dict),
            sa.Column("metadata", postgresql.JSONB(), default=dict),
            sa.Column("is_active", sa.Boolean(), default=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    # Field Options table
    if not _has_table(conn, "field_options"):
        op.create_table(
            "field_options",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("field_id", sa.String(), nullable=False),
            sa.Column("label", sa.String(), nullable=False),
            sa.Column("value", sa.String(), nullable=False),
            sa.Column("sort_order", sa.Integer(), default=0),
            sa.Column("is_active", sa.Boolean(), default=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    # Companies table
    if not _has_table(conn, "companies"):
        op.create_table(
            "companies",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("logo", sa.String(), default=""),
            sa.Column("email", sa.String(), default=""),
            sa.Column("phone", sa.String(), default=""),
            sa.Column("address", sa.String(), default=""),
            sa.Column("gst_number", sa.String(), default=""),
            sa.Column("currency", sa.String(), default="INR"),
            sa.Column("timezone", sa.String(), default="Asia/Kolkata"),
            sa.Column("working_hours", sa.String(), default="9:00 AM - 6:00 PM"),
            sa.Column("settings", postgresql.JSONB(), default=dict),
            sa.Column("is_active", sa.Boolean(), default=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        )


def downgrade():
    op.drop_table("companies")
    op.drop_table("field_options")
    op.drop_table("form_fields")
    op.drop_table("form_sections")
    op.drop_table("forms")
    op.drop_table("role_permissions")
    op.drop_table("permissions")
    op.drop_table("roles")
    op.drop_table("modules")
