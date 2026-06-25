# Tiny Flame: Clicker Game

Tap the spark, light up the dark!

Idle/incremental tap clicker with a campfire theme. Built with **Expo SDK 54** (React Native) and **FastAPI** + **SQLAlchemy**.

## Project structure

```
mobile/     Expo React Native app
backend/    FastAPI REST API
release/    Local .aab build output (gitignored)
docs/       Build instructions
```

## Quick start

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs

### Mobile

```bash
cd mobile
npm install
npx expo start
```

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` (see `mobile/.env.example`). For a physical device on the same Wi‑Fi, use your PC's LAN IP or leave unset to auto-detect from Expo Go.

### Android release build

See [docs/BUILD_ANDROID.md](docs/BUILD_ANDROID.md). Run this only when you are ready to produce a signed `.aab` for Play Store upload.

## Features

- Tap campfire to earn Embers and fuel the flame
- Buy fuel upgrades (Paper, Twigs, Planks, Logs, Bonfire Bundle)
- Flame intensity meter with passive drain and rain events
- Anonymous session-based progress (no login)
- Backend persistence via device session id
