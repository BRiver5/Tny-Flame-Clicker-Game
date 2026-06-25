export const COLORS = {
  SKY: '#0B1D35',
  SKY_LIGHT: '#122845',
  TREES: '#051324',
  MOON: '#E6E7E8',
  FLAME_CORE: '#FFF200',
  FLAME_MID: '#F7941D',
  FLAME_EDGE: '#ED1C24',
  WOOD: '#603913',
  WOOD_DARK: '#42210B',
  TEXT: '#FFFFFF',
  TEXT_DIM: 'rgba(255,255,255,0.75)',
  PANEL: '#152743',
  ACCENT: '#F7941D',
} as const;

export const SESSION_KEY = 'tiny_flame_session_id';
export const SOUND_KEY = 'tiny_flame_sound_enabled';
export const SYNC_INTERVAL_MS = 5000;
export const LOCAL_TICK_MS = 250;
export const UI_PUBLISH_MS = 400;
export const TAP_FLUSH_MS = 350;
export const MAX_TAP_BURST = 40;
export const MAX_KINDLING_POPUPS = 6;
export const LOW_INTENSITY_THRESHOLD = 25;
export const HIGH_INTENSITY_THRESHOLD = 70;

/** Embers gained per tap (mirrors backend). */
export const TAP_EMBERS_GAIN = 1;
/** Kindling / flame intensity gained per tap (mirrors backend). */
export const TAP_INTENSITY_GAIN = 1;
