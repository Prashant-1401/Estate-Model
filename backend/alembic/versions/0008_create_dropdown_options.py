"""create dropdown options table and reconcile missing activities table

Revision ID: 0008
Revises: 0007_bis
Create Date: 2026-08-04
"""

from alembic import op
import sqlalchemy as sa

revision = "0008"
down_revision = "0007_bis"
branch_labels = None
depends_on = None


def _has_table(conn, table_name):
    inspector = sa.inspect(conn)
    return table_name in inspector.get_table_names()


def upgrade():
    conn = op.get_bind()

    # The activities table was dropped from the migration chain when the
    # dashboard-widget migration collided with revision 0007. Recreate it so
    # the actively used lead-activity endpoints keep working.
    if not _has_table(conn, "activities"):
        op.create_table(
            "activities",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("lead_id", sa.String(), nullable=False),
            sa.Column("type", sa.String(), nullable=False),
            sa.Column("description", sa.String(), nullable=True),
            sa.Column("note", sa.String(), nullable=True),
            sa.Column("performed_by", sa.String(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        )

    if not _has_table(conn, "dropdown_options"):
        op.create_table(
            "dropdown_options",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("category", sa.String(), nullable=False),
            sa.Column("label", sa.String(), nullable=False),
            sa.Column("value", sa.String(), nullable=False),
            sa.Column("color", sa.String(), default=""),
            sa.Column("sort_order", sa.Integer(), default=0),
            sa.Column("is_active", sa.Boolean(), default=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_dropdown_options_category", "dropdown_options", ["category"])


def downgrade():
    op.drop_table("dropdown_options")
    op.drop_table("activities")
