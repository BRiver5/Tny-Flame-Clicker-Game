import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { api } from '@/src/api/client';
import {
  LOCAL_TICK_MS,
  MAX_TAP_BURST,
  SESSION_KEY,
  SYNC_INTERVAL_MS,
  TAP_EMBERS_GAIN,
  TAP_FLUSH_MS,
  TAP_INTENSITY_GAIN,
  UI_PUBLISH_MS,
} from '@/src/game/constants';
import type { PlayerState } from '@/src/game/types';

type GameContextValue = {
  loading: boolean;
  error: string | null;
  sessionId: string | null;
  state: PlayerState | null;
  displayEmbers: number;
  displayIntensity: number;
  tap: () => void;
  buy: (slug: string) => Promise<{ success: boolean; message: string }>;
  refresh: () => Promise<void>;
  resetProgress: () => Promise<void>;
};

const GameContext = createContext<GameContextValue | null>(null);

const BASE_DRAIN_PER_SEC = 2;
const RAIN_DRAIN_PER_SEC = 3;

function applyLocalTick(state: PlayerState, deltaSec: number): PlayerState {
  let rainWarning = state.rain_warning;
  let rainActive = state.rain_active;
  let warningLeft = state.rain_warning_seconds_left;
  let activeLeft = state.rain_active_seconds_left;

  if (rainWarning) {
    warningLeft = Math.max(0, warningLeft - deltaSec);
    if (warningLeft <= 0) {
      rainWarning = false;
    }
  }
  if (rainActive) {
    activeLeft = Math.max(0, activeLeft - deltaSec);
    if (activeLeft <= 0) {
      rainActive = false;
    }
  }

  const drainPerSecond = rainActive
    ? Math.max(state.drain_per_second, RAIN_DRAIN_PER_SEC)
    : state.drain_per_second > BASE_DRAIN_PER_SEC * 1.2
      ? BASE_DRAIN_PER_SEC
      : state.drain_per_second;

  const nextIntensity = Math.max(
    0,
    Math.min(100, state.flame_intensity - drainPerSecond * deltaSec),
  );
  const epsMultiplier = state.flame_intensity <= 0 ? 0.25 : 1;
  const nextEmbers = state.embers + state.embers_per_second * epsMultiplier * deltaSec;

  return {
    ...state,
    embers: nextEmbers,
    flame_intensity: nextIntensity,
    drain_per_second: drainPerSecond,
    rain_warning: rainWarning,
    rain_active: rainActive,
    rain_warning_seconds_left: warningLeft,
    rain_active_seconds_left: activeLeft,
  };
}

function applyOptimisticTap(state: PlayerState): PlayerState {
  return {
    ...state,
    embers: state.embers + TAP_EMBERS_GAIN,
    flame_intensity: Math.min(100, state.flame_intensity + TAP_INTENSITY_GAIN),
  };
}

function applyPendingOptimistic(state: PlayerState, pendingTaps: number): PlayerState {
  if (pendingTaps <= 0) {
    return state;
  }
  return {
    ...state,
    embers: state.embers + pendingTaps * TAP_EMBERS_GAIN,
    flame_intensity: Math.min(100, state.flame_intensity + pendingTaps * TAP_INTENSITY_GAIN),
  };
}

function snapshotState(state: PlayerState): PlayerState {
  return { ...state };
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [state, setState] = useState<PlayerState | null>(null);
  const stateRef = useRef<PlayerState | null>(null);
  const syncingRef = useRef(false);
  const pendingTapsRef = useRef(0);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushInFlightRef = useRef(false);

  const publishState = useCallback((next: PlayerState | null) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const publishSnapshot = useCallback(() => {
    if (!stateRef.current) {
      return;
    }
    setState(snapshotState(stateRef.current));
  }, []);

  const syncFromServer = useCallback(async (id: string) => {
    if (syncingRef.current) {
      return;
    }
    syncingRef.current = true;
    try {
      const remote = await api.getState(id);
      publishState(applyPendingOptimistic(remote, pendingTapsRef.current));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync');
    } finally {
      syncingRef.current = false;
    }
  }, [publishState]);

  const flushTaps = useCallback(async (id: string) => {
    if (flushInFlightRef.current) {
      return;
    }
    const count = Math.min(pendingTapsRef.current, MAX_TAP_BURST);
    if (count <= 0) {
      return;
    }
    pendingTapsRef.current -= count;
    flushInFlightRef.current = true;
    try {
      const remote = await api.tap(id, count);
      publishState(applyPendingOptimistic(remote, pendingTapsRef.current));
      setError(null);
    } catch (err) {
      pendingTapsRef.current = Math.min(
        pendingTapsRef.current + count,
        MAX_TAP_BURST * 2,
      );
      setError(err instanceof Error ? err.message : 'Tap failed');
    } finally {
      flushInFlightRef.current = false;
      if (pendingTapsRef.current > 0) {
        flushTimerRef.current = setTimeout(() => {
          void flushTaps(id);
        }, TAP_FLUSH_MS);
      }
    }
  }, [publishState]);

  const scheduleTapFlush = useCallback(
    (id: string) => {
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
      }
      flushTimerRef.current = setTimeout(() => {
        void flushTaps(id);
      }, TAP_FLUSH_MS);
    },
    [flushTaps],
  );

  const bootstrap = useCallback(async () => {
    setLoading(true);
    try {
      let id = await AsyncStorage.getItem(SESSION_KEY);
      if (!id) {
        const session = await api.createSession();
        id = session.session_id;
        await AsyncStorage.setItem(SESSION_KEY, id);
      }
      setSessionId(id);
      await syncFromServer(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize');
    } finally {
      setLoading(false);
    }
  }, [syncFromServer]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    const syncTimer = setInterval(() => {
      syncFromServer(sessionId);
    }, SYNC_INTERVAL_MS);
    return () => clearInterval(syncTimer);
  }, [sessionId, syncFromServer]);

  useEffect(() => {
    const simTimer = setInterval(() => {
      if (!stateRef.current) {
        return;
      }
      stateRef.current = applyLocalTick(stateRef.current, LOCAL_TICK_MS / 1000);
    }, LOCAL_TICK_MS);

    const uiTimer = setInterval(() => {
      publishSnapshot();
    }, UI_PUBLISH_MS);

    return () => {
      clearInterval(simTimer);
      clearInterval(uiTimer);
    };
  }, [publishSnapshot]);

  useEffect(
    () => () => {
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
      }
    },
    [],
  );

  const tap = useCallback(() => {
    if (!sessionId || !stateRef.current) {
      return;
    }
    pendingTapsRef.current = Math.min(pendingTapsRef.current + 1, MAX_TAP_BURST * 2);
    publishState(applyOptimisticTap(stateRef.current));
    scheduleTapFlush(sessionId);
  }, [publishState, scheduleTapFlush, sessionId]);

  const buy = useCallback(
    async (slug: string) => {
      if (!sessionId) {
        return { success: false, message: 'No session' };
      }
      try {
        const result = await api.buy(sessionId, slug);
        if (result.state) {
          publishState(applyPendingOptimistic(result.state, pendingTapsRef.current));
        }
        setError(null);
        return { success: result.success, message: result.message };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Purchase failed';
        setError(message);
        return { success: false, message };
      }
    },
    [publishState, sessionId],
  );

  const refresh = useCallback(async () => {
    if (!sessionId) {
      return;
    }
    await syncFromServer(sessionId);
  }, [sessionId, syncFromServer]);

  const resetProgress = useCallback(async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setSessionId(null);
    publishState(null);
    pendingTapsRef.current = 0;
    await bootstrap();
  }, [bootstrap, publishState]);

  const value = useMemo<GameContextValue>(
    () => ({
      loading,
      error,
      sessionId,
      state,
      displayEmbers: state?.embers ?? 0,
      displayIntensity: Math.min(100, state?.flame_intensity ?? 0),
      tap,
      buy,
      refresh,
      resetProgress,
    }),
    [loading, error, sessionId, state, tap, buy, refresh, resetProgress],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
