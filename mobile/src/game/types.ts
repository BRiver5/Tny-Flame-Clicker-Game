export type UpgradeOwned = {
  slug: string;
  name: string;
  owned_count: number;
  next_cost: number;
  eps: number;
  intensity_per_sec: number;
};

export type PlayerState = {
  session_id: string;
  embers: number;
  flame_intensity: number;
  embers_per_second: number;
  intensity_per_second: number;
  drain_per_second: number;
  rain_warning: boolean;
  rain_active: boolean;
  rain_warning_seconds_left: number;
  rain_active_seconds_left: number;
  upgrades: UpgradeOwned[];
  last_sync_at: string;
};

export type BuyResponse = {
  success: boolean;
  message: string;
  state: PlayerState | null;
};

export type UpgradeDefinition = {
  slug: string;
  name: string;
  base_cost: number;
  cost_multiplier: number;
  eps: number;
  intensity_per_sec: number;
  sort_order: number;
};

export type SessionResponse = {
  session_id: string;
};
