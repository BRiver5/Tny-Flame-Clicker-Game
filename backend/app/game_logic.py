import math
import random
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models import Player, PlayerUpgrade, Upgrade

BASE_DRAIN_PER_SEC = 2.0
RAIN_DRAIN_MULTIPLIER = 1.5
LOW_INTENSITY_EPS_MULTIPLIER = 0.25
TAP_EMBERS = 1.0
TAP_INTENSITY = 1.0
MAX_INTENSITY = 100.0
RAIN_WARNING_SECONDS = 3.0
RAIN_DURATION_SECONDS = 18.0
RAIN_MIN_INTERVAL = 90.0
RAIN_MAX_INTERVAL = 180.0


def upgrade_cost(base_cost: float, multiplier: float, owned: int) -> float:
    return math.floor(base_cost * (multiplier ** owned))


def get_owned_map(db: Session, player: Player) -> dict[str, PlayerUpgrade]:
    rows = (
        db.query(PlayerUpgrade)
        .join(Upgrade)
        .filter(PlayerUpgrade.player_id == player.id)
        .all()
    )
    return {row.upgrade.slug: row for row in rows}


def compute_rates(db: Session, player: Player) -> tuple[float, float]:
    owned = get_owned_map(db, player)
    eps = sum(row.owned_count * row.upgrade.eps for row in owned.values())
    if player.flame_intensity <= 0:
        eps *= LOW_INTENSITY_EPS_MULTIPLIER
    return eps, 0.0


def is_rain_warning(now: datetime, player: Player) -> bool:
    return (
        player.rain_warning_until is not None
        and player.rain_active_until is not None
        and now < player.rain_active_until
        and now < player.rain_warning_until
    )


def is_rain_active(now: datetime, player: Player) -> bool:
    return (
        player.rain_active_until is not None
        and player.rain_warning_until is not None
        and now >= player.rain_warning_until
        and now < player.rain_active_until
    )


def drain_rate(now: datetime, player: Player) -> float:
    rate = BASE_DRAIN_PER_SEC
    if is_rain_active(now, player):
        rate *= RAIN_DRAIN_MULTIPLIER
    return rate


def schedule_initial_rain(player: Player, now: datetime) -> None:
    if player.next_rain_at is None:
        player.next_rain_at = now + timedelta(
            seconds=random.uniform(RAIN_MIN_INTERVAL, RAIN_MAX_INTERVAL)
        )


def maybe_start_rain(player: Player, now: datetime) -> None:
    schedule_initial_rain(player, now)
    if player.next_rain_at and now >= player.next_rain_at:
        rain_end = now + timedelta(seconds=RAIN_WARNING_SECONDS + RAIN_DURATION_SECONDS)
        player.rain_active_until = rain_end
        player.rain_warning_until = now + timedelta(seconds=RAIN_WARNING_SECONDS)
        player.next_rain_at = rain_end + timedelta(
            seconds=random.uniform(RAIN_MIN_INTERVAL, RAIN_MAX_INTERVAL)
        )


def apply_passive_progress(db: Session, player: Player, now: datetime) -> None:
    maybe_start_rain(player, now)
    elapsed = max(0.0, (now - player.last_sync_at).total_seconds())
    if elapsed <= 0:
        return

    eps, intensity_gain = compute_rates(db, player)
    player.embers += eps * elapsed
    net_intensity = intensity_gain - drain_rate(now, player)
    player.flame_intensity = max(0.0, min(MAX_INTENSITY, player.flame_intensity + net_intensity * elapsed))
    player.last_sync_at = now


def build_upgrade_owned(db: Session, player: Player) -> list[dict]:
    owned_map = get_owned_map(db, player)
    upgrades = db.query(Upgrade).order_by(Upgrade.sort_order).all()
    result = []
    for upgrade in upgrades:
        row = owned_map.get(upgrade.slug)
        owned_count = row.owned_count if row else 0
        result.append(
            {
                "slug": upgrade.slug,
                "name": upgrade.name,
                "owned_count": owned_count,
                "next_cost": upgrade_cost(upgrade.base_cost, upgrade.cost_multiplier, owned_count),
                "eps": upgrade.eps,
                "intensity_per_sec": upgrade.intensity_per_sec,
            }
        )
    return result


def build_player_state(db: Session, player: Player) -> dict:
    now = datetime.utcnow()
    apply_passive_progress(db, player, now)
    eps, intensity_gain = compute_rates(db, player)
    warning = is_rain_warning(now, player)
    active = is_rain_active(now, player)
    warning_left = 0.0
    active_left = 0.0
    if player.rain_active_until:
        if warning and player.rain_warning_until:
            warning_left = max(0.0, (player.rain_warning_until - now).total_seconds())
        if active:
            active_left = max(0.0, (player.rain_active_until - now).total_seconds())
    return {
        "session_id": player.id,
        "embers": player.embers,
        "flame_intensity": player.flame_intensity,
        "embers_per_second": eps,
        "intensity_per_second": intensity_gain,
        "drain_per_second": drain_rate(now, player),
        "rain_warning": warning,
        "rain_active": active,
        "rain_warning_seconds_left": warning_left,
        "rain_active_seconds_left": active_left,
        "upgrades": build_upgrade_owned(db, player),
        "last_sync_at": player.last_sync_at,
    }


def register_tap(db: Session, player: Player, count: int = 1) -> dict:
    now = datetime.utcnow()
    apply_passive_progress(db, player, now)
    taps = max(1, min(int(count), 50))
    player.embers += TAP_EMBERS * taps
    player.flame_intensity = min(MAX_INTENSITY, player.flame_intensity + TAP_INTENSITY * taps)
    player.last_sync_at = now
    db.commit()
    db.refresh(player)
    return build_player_state(db, player)


def purchase_upgrade(db: Session, player: Player, slug: str) -> tuple[bool, str, dict | None]:
    upgrade = db.query(Upgrade).filter(Upgrade.slug == slug).first()
    if not upgrade:
        return False, "Upgrade not found", None

    now = datetime.utcnow()
    apply_passive_progress(db, player, now)

    row = (
        db.query(PlayerUpgrade)
        .filter(PlayerUpgrade.player_id == player.id, PlayerUpgrade.upgrade_id == upgrade.id)
        .first()
    )
    owned = row.owned_count if row else 0
    cost = upgrade_cost(upgrade.base_cost, upgrade.cost_multiplier, owned)
    if player.embers < cost:
        return False, "Not enough Embers", None

    player.embers -= cost
    if row:
        row.owned_count += 1
    else:
        db.add(
            PlayerUpgrade(
                player_id=player.id,
                upgrade_id=upgrade.id,
                owned_count=1,
            )
        )
    player.last_sync_at = now
    db.commit()
    db.refresh(player)
    return True, "Purchased", build_player_state(db, player)
