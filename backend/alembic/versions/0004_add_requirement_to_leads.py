"""add requirement to leads

Revision ID: 0004
Revises: 0003
Create Date: 2026-08-03
"""

from alembic import op
import sqlalchemy as sa

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("leads", sa.Column("requirement", sa.String(), nullable=True))


def downgrade():
    op.drop_column("leads", "requirement")
