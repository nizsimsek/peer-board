export const CANVAS_DIMENSIONS = {
  width: 5000,
  height: 5000,
} as const;

export const SCALE_LIMITS = {
  min: 0.1,
  max: 5,
} as const;

export const GRID_DIMENSIONS = {
  small: 100,
  large: 500,
} as const;

export const GRID_COLORS = {
  light: "#374151",
  dark: "#E5E7EB",
} as const;

export const DRAW_DEFAULTS = {
  strokeWidth: 6,
  fontSize: 48,
  hitThreshold: 16,
} as const;
