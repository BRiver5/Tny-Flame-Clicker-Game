from datetime import datetime

from pydantic import BaseModel, Field


class SessionResponse(BaseModel):
    session_id: str


class UpgradeOwned(BaseModel):
    slug: str
    name: str
    owned_count: int
    next_cost: float
    eps: float
    intensity_per_sec: float


class UpgradeDefinition(BaseModel):
    slug: str
    name: str
    base_cost: float
    cost_multiplier: float
    eps: float
    intensity_per_sec: float
    sort_order: int


class PlayerState(BaseModel):
    session_id: str
    embers: float
    flame_intensity: float
    embers_per_second: float
    intensity_per_second: float
    drain_per_second: float
    rain_warning: bool
    rain_active: bool
    rain_warning_seconds_left: float = 0
    rain_active_seconds_left: float = 0
    upgrades: list[UpgradeOwned]
    last_sync_at: datetime


class TapRequest(BaseModel):
    count: int = Field(default=1, ge=1, le=50)


class BuyRequest(BaseModel):
    upgrade_slug: str = Field(min_length=1)


class BuyResponse(BaseModel):
    success: bool
    message: str
    state: PlayerState | None = None
