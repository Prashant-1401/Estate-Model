"""create initial tables

Revision ID: 0001
Revises:
Create Date: 2026-07-31
"""

from alembic import op
import sqlalchemy as sa


revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def _has_table(name: str) -> bool:
    bind = op.get_bind()
    try:
        return sa.inspect(bind).has_table(name)
    except (sa.exc.NoInspectionAvailable, NotImplementedError):
        return False


def _timestamp_columns():
    return (
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
    )


def upgrade():
    if not _has_table("users"):
        op.create_table(
            "users",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("email", sa.String(), nullable=False),
            sa.Column("phone", sa.String(), nullable=True),
            sa.Column("role", sa.String(), nullable=True),
            sa.Column("status", sa.String(), nullable=True),
            sa.Column("created", sa.String(), nullable=True),
            sa.Column("hashed_password", sa.String(), nullable=False),
            *_timestamp_columns(),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("email"),
        )

    if not _has_table("leads"):
        op.create_table(
            "leads",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("phone", sa.String(), nullable=False),
            sa.Column("budget", sa.String(), nullable=True),
            sa.Column("area", sa.String(), nullable=True),
            sa.Column("type", sa.String(), nullable=True),
            sa.Column("source", sa.String(), nullable=True),
            sa.Column("status", sa.String(), nullable=True),
            sa.Column("assigned", sa.String(), nullable=True),
            sa.Column("date", sa.String(), nullable=True),
            sa.Column("property_id", sa.String(), nullable=True),
            sa.Column("assigned_to", sa.String(), nullable=True),
            *_timestamp_columns(),
            sa.PrimaryKeyConstraint("id"),
        )

    if not _has_table("properties"):
        op.create_table(
            "properties",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("title", sa.String(), nullable=False),
            sa.Column("location", sa.String(), nullable=False),
            sa.Column("price", sa.String(), nullable=True),
            sa.Column("bedrooms", sa.Integer(), nullable=True),
            sa.Column("bathrooms", sa.Integer(), nullable=True),
            sa.Column("area", sa.String(), nullable=True),
            sa.Column("type", sa.String(), nullable=True),
            sa.Column("status", sa.String(), nullable=True),
            sa.Column("images", sa.JSON(), nullable=True),
            sa.Column("featured", sa.Boolean(), nullable=True),
            sa.Column("project_id", sa.String(), nullable=True),
            *_timestamp_columns(),
            sa.PrimaryKeyConstraint("id"),
        )

    if not _has_table("projects"):
        op.create_table(
            "projects",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("developer", sa.String(), nullable=True),
            sa.Column("location", sa.String(), nullable=True),
            sa.Column("status", sa.String(), nullable=True),
            sa.Column("total_units", sa.Integer(), nullable=True),
            sa.Column("units_sold", sa.Integer(), nullable=True),
            sa.Column("launch_date", sa.String(), nullable=True),
            sa.Column("completion_date", sa.String(), nullable=True),
            sa.Column("price_range", sa.String(), nullable=True),
            sa.Column("description", sa.String(), nullable=True),
            *_timestamp_columns(),
            sa.PrimaryKeyConstraint("id"),
        )

    if not _has_table("inquiries"):
        op.create_table(
            "inquiries",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("phone", sa.String(), nullable=False),
            sa.Column("email", sa.String(), nullable=True),
            sa.Column("property_type", sa.String(), nullable=True),
            sa.Column("area", sa.String(), nullable=True),
            sa.Column("budget", sa.String(), nullable=True),
            sa.Column("message", sa.String(), nullable=True),
            sa.Column("source", sa.String(), nullable=True),
            sa.Column("status", sa.String(), nullable=True),
            sa.Column("date", sa.String(), nullable=True),
            *_timestamp_columns(),
            sa.PrimaryKeyConstraint("id"),
        )


def downgrade():
    bind = op.get_bind()
    if sa.inspect(bind).has_table("inquiries"):
        op.drop_table("inquiries")
    if sa.inspect(bind).has_table("projects"):
        op.drop_table("projects")
    if sa.inspect(bind).has_table("properties"):
        op.drop_table("properties")
    if sa.inspect(bind).has_table("leads"):
        op.drop_table("leads")
    if sa.inspect(bind).has_table("users"):
        op.drop_table("users")
