"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-06-24
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "players",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("embers", sa.Float(), nullable=False),
        sa.Column("flame_intensity", sa.Float(), nullable=False),
        sa.Column("last_sync_at", sa.DateTime(), nullable=False),
        sa.Column("rain_warning_until", sa.DateTime(), nullable=True),
        sa.Column("rain_active_until", sa.DateTime(), nullable=True),
        sa.Column("next_rain_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "upgrades",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("slug", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("base_cost", sa.Float(), nullable=False),
        sa.Column("cost_multiplier", sa.Float(), nullable=False),
        sa.Column("eps", sa.Float(), nullable=False),
        sa.Column("intensity_per_sec", sa.Float(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_upgrades_slug"), "upgrades", ["slug"], unique=True)
    op.create_table(
        "player_upgrades",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("player_id", sa.String(length=36), nullable=False),
        sa.Column("upgrade_id", sa.Integer(), nullable=False),
        sa.Column("owned_count", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["player_id"], ["players.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["upgrade_id"], ["upgrades.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("player_id", "upgrade_id", name="uq_player_upgrade"),
    )


def downgrade() -> None:
    op.drop_table("player_upgrades")
    op.drop_index(op.f("ix_upgrades_slug"), table_name="upgrades")
    op.drop_table("upgrades")
    op.drop_table("players")
