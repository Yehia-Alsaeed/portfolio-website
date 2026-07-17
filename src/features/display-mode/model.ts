export const DISPLAY_MODES = ["paper", "night", "mono"] as const;
export type DisplayMode = (typeof DISPLAY_MODES)[number];
export const DISPLAY_MODE_STORAGE_KEY = "ya-display-mode:v1";

export function parseDisplayMode(value: string | null | undefined): DisplayMode {
  return DISPLAY_MODES.find((mode) => mode === value) ?? "paper";
}

export function nextDisplayMode(mode: DisplayMode): DisplayMode {
  return DISPLAY_MODES[(DISPLAY_MODES.indexOf(mode) + 1) % DISPLAY_MODES.length] ?? "paper";
}
