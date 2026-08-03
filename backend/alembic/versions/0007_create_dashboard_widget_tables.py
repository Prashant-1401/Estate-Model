"""create dashboard widget tables

Revision ID: 0007
Revises: 0006
Create Date: 2026-08-03
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def _has_table(conn, table_name):
    inspector = sa.inspect(conn)
    return table_name in inspector.get_table_names()


def upgrade():
    conn = op.get_bind()

    # Dashboard Widgets table
    if not _has_table(conn, "dashboard_widgets"):
        op.create_table(
            "dashboard_widgets",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("widget_type", sa.String(), nullable=False),
            sa.Column("description", sa.String(), default=""),
            sa.Column("config", postgresql.JSONB(), default=dict),
            sa.Column("sort_order", sa.Integer(), default=0),
            sa.Column("is_active", sa.Boolean(), default=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        )

    # User Dashboards table
    if not _has_table(conn, "user_dashboards"):
        op.create_table(
            "user_dashboards",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("user_id", sa.String(), nullable=False),
            sa.Column("widgets", postgresql.JSONB(), default=list),
            sa.Column("layout", postgresql.JSONB(), default=dict),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        )


def downgrade():
    op.drop_table("user_dashboards")
    op.drop_table("dashboard_widgets")
