import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Player(Base):
    __tablename__ = "players"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    embers: Mapped[float] = mapped_column(Float, default=0.0)
    flame_intensity: Mapped[float] = mapped_column(Float, default=50.0)
    last_sync_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    rain_warning_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    rain_active_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    next_rain_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    upgrades: Mapped[list["PlayerUpgrade"]] = relationship(
        back_populates="player", cascade="all, delete-orphan"
    )


class Upgrade(Base):
    __tablename__ = "upgrades"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(128))
    base_cost: Mapped[float] = mapped_column(Float)
    cost_multiplier: Mapped[float] = mapped_column(Float, default=1.15)
    eps: Mapped[float] = mapped_column(Float)
    intensity_per_sec: Mapped[float] = mapped_column(Float)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    player_upgrades: Mapped[list["PlayerUpgrade"]] = relationship(back_populates="upgrade")


class PlayerUpgrade(Base):
    __tablename__ = "player_upgrades"
    __table_args__ = (UniqueConstraint("player_id", "upgrade_id", name="uq_player_upgrade"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    player_id: Mapped[str] = mapped_column(String(36), ForeignKey("players.id", ondelete="CASCADE"))
    upgrade_id: Mapped[int] = mapped_column(Integer, ForeignKey("upgrades.id"))
    owned_count: Mapped[int] = mapped_column(Integer, default=0)

    player: Mapped["Player"] = relationship(back_populates="upgrades")
    upgrade: Mapped["Upgrade"] = relationship(back_populates="player_upgrades")
