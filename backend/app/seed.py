from sqlalchemy.orm import Session

from app.models import Upgrade

UPGRADE_SEED = [
    {
        "slug": "paper",
        "name": "Paper",
        "base_cost": 15,
        "cost_multiplier": 1.15,
        "eps": 0.1,
        "intensity_per_sec": 0.0,
        "sort_order": 1,
    },
    {
        "slug": "twigs",
        "name": "Twigs",
        "base_cost": 100,
        "cost_multiplier": 1.15,
        "eps": 1.0,
        "intensity_per_sec": 0.0,
        "sort_order": 2,
    },
    {
        "slug": "planks",
        "name": "Planks",
        "base_cost": 500,
        "cost_multiplier": 1.15,
        "eps": 4.0,
        "intensity_per_sec": 0.0,
        "sort_order": 3,
    },
    {
        "slug": "logs",
        "name": "Logs",
        "base_cost": 3000,
        "cost_multiplier": 1.15,
        "eps": 15.0,
        "intensity_per_sec": 0.0,
        "sort_order": 4,
    },
    {
        "slug": "bonfire_bundle",
        "name": "Bonfire Bundle",
        "base_cost": 15000,
        "cost_multiplier": 1.15,
        "eps": 60.0,
        "intensity_per_sec": 0.0,
        "sort_order": 5,
    },
]


def seed_upgrades(db: Session) -> None:
    existing = db.query(Upgrade).count()
    if existing:
        sync_upgrade_definitions(db)
        return
    for item in UPGRADE_SEED:
        db.add(Upgrade(**item))
    db.commit()


def sync_upgrade_definitions(db: Session) -> None:
    for item in UPGRADE_SEED:
        row = db.query(Upgrade).filter(Upgrade.slug == item["slug"]).first()
        if row:
            row.name = item["name"]
            row.base_cost = item["base_cost"]
            row.cost_multiplier = item["cost_multiplier"]
            row.eps = item["eps"]
            row.intensity_per_sec = 0.0
            row.sort_order = item["sort_order"]
        else:
            db.add(Upgrade(**item))
    db.commit()
