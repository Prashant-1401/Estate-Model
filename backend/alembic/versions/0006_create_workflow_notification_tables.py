"""create workflow, notification, status, and lead source tables

Revision ID: 0006
Revises: 0005
Create Date: 2026-08-03
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def _has_table(conn, table_name):
    inspector = sa.inspect(conn)
    return table_name in inspector.get_table_names()


def upgrade():
    conn = op.get_bind()

    # Workflows table
    if not _has_table(conn, "workflows"):
        op.create_table(
            "workflows",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("entity_type", sa.String(), nullable=False),
            sa.Column("description", sa.String(), default=""),
            sa.Column("trigger_event", sa.String(), nullable=False),
            sa.Column("is_active", sa.Boolean(), default=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        )

    # Workflow Steps table
    if not _has_table(conn, "workflow_steps"):
        op.create_table(
            "workflow_steps",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("workflow_id", sa.String(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("step_type", sa.String(), nullable=False),
            sa.Column("action", sa.String(), nullable=False),
            sa.Column("config", postgresql.JSONB(), default=dict),
            sa.Column("sort_order", sa.Integer(), default=0),
            sa.Column("is_active", sa.Boolean(), default=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    # Notification Templates table
    if not _has_table(conn, "notification_templates"):
        op.create_table(
            "notification_templates",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("channel", sa.String(), nullable=False),
            sa.Column("subject", sa.String(), default=""),
            sa.Column("body", sa.String(), nullable=False),
            sa.Column("variables", postgresql.JSONB(), default=list),
            sa.Column("is_active", sa.Boolean(), default=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        )

    # Notification Rules table
    if not _has_table(conn, "notification_rules"):
        op.create_table(
            "notification_rules",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("trigger_event", sa.String(), nullable=False),
            sa.Column("template_id", sa.String(), nullable=False),
            sa.Column("recipients", postgresql.JSONB(), default=list),
            sa.Column("conditions", postgresql.JSONB(), default=dict),
            sa.Column("is_active", sa.Boolean(), default=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        )

    # Statuses table
    if not _has_table(conn, "statuses"):
        op.create_table(
            "statuses",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("entity_type", sa.String(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("slug", sa.String(), nullable=False),
            sa.Column("color", sa.String(), default="#64748B"),
            sa.Column("sort_order", sa.Integer(), default=0),
            sa.Column("is_active", sa.Boolean(), default=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    # Lead Sources table
    if not _has_table(conn, "lead_sources"):
        op.create_table(
            "lead_sources",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("slug", sa.String(), nullable=False, unique=True),
            sa.Column("description", sa.String(), default=""),
            sa.Column("icon", sa.String(), default=""),
            sa.Column("is_active", sa.Boolean(), default=True),
            sa.Column("sort_order", sa.Integer(), default=0),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )


def downgrade():
    op.drop_table("lead_sources")
    op.drop_table("statuses")
    op.drop_table("notification_rules")
    op.drop_table("notification_templates")
    op.drop_table("workflow_steps")
    op.drop_table("workflows")
