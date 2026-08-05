"""add assigned agent to properties

Revision ID: 0010
Revises: 0009
Create Date: 2026-08-05
"""

from alembic import op
import sqlalchemy as sa

revision = "0010"
down_revision = "0009"
branch_labels = None
depends_on = None


def _has_column(conn, table_name, column_name):
    inspector = sa.inspect(conn)
    columns = [c["name"] for c in inspector.get_columns(table_name)]
    return column_name in columns


def upgrade():
    conn = op.get_bind()
    if not _has_column(conn, "properties", "agent_id"):
        op.add_column("properties", sa.Column("agent_id", sa.String(), nullable=True))
    if not _has_column(conn, "properties", "agent_name"):
        op.add_column("properties", sa.Column("agent_name", sa.String(), default="", nullable=False, server_default=""))


def downgrade():
    conn = op.get_bind()
    if _has_column(conn, "properties", "agent_name"):
        op.drop_column("properties", "agent_name")
    if _has_column(conn, "properties", "agent_id"):
        op.drop_column("properties", "agent_id")
