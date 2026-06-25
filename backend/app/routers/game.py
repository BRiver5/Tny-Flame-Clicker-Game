from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.game_logic import build_player_state, purchase_upgrade, register_tap, schedule_initial_rain
from app.models import Player
from app.schemas import BuyRequest, BuyResponse, PlayerState, SessionResponse, TapRequest, UpgradeDefinition
from app.seed import UPGRADE_SEED

router = APIRouter()


@router.post("/session", response_model=SessionResponse)
def create_session(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    player = Player(last_sync_at=now)
    schedule_initial_rain(player, now)
    db.add(player)
    db.commit()
    db.refresh(player)
    return SessionResponse(session_id=player.id)


@router.get("/state/{session_id}", response_model=PlayerState)
def get_state(session_id: str, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == session_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Session not found")
    state = build_player_state(db, player)
    db.commit()
    return PlayerState(**state)


@router.post("/tap/{session_id}", response_model=PlayerState)
def tap(session_id: str, body: TapRequest | None = None, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == session_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Session not found")
    count = body.count if body else 1
    state = register_tap(db, player, count)
    return PlayerState(**state)


@router.post("/buy/{session_id}", response_model=BuyResponse)
def buy(session_id: str, body: BuyRequest, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == session_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Session not found")
    success, message, state = purchase_upgrade(db, player, body.upgrade_slug)
    return BuyResponse(
        success=success,
        message=message,
        state=PlayerState(**state) if state else None,
    )


@router.get("/upgrades", response_model=list[UpgradeDefinition])
def list_upgrades():
    return [UpgradeDefinition(**item) for item in UPGRADE_SEED]
