"use client";

import * as React from "react";

import {
  DISPLAY_MODE_STORAGE_KEY,
  type DisplayMode,
  nextDisplayMode,
  parseDisplayMode,
} from "./model";

type DisplayModeContextValue = {
  mode: DisplayMode;
  setMode: (mode: DisplayMode) => void;
  cycleMode: () => void;
};

const DisplayModeContext = React.createContext<DisplayModeContextValue | null>(null);

// The <html data-mode> attribute is the source of truth: the boot script sets
// it before hydration and applyMode() keeps it current afterwards, so React
// reads it through an external-store subscription instead of duplicated state.
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readAppliedMode(): DisplayMode {
  return parseDisplayMode(document.documentElement.dataset.mode);
}

function readServerMode(): DisplayMode {
  return "paper";
}

function applyMode(mode: DisplayMode) {
  document.documentElement.dataset.mode = mode;
  document.documentElement.style.colorScheme = mode === "night" ? "dark" : "light";
  try {
    window.localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, mode);
  } catch {
    // Persistence is best-effort; the visual change above must still apply.
  }
  for (const listener of listeners) {
    listener();
  }
}

export function DisplayModeProvider({ children }: { children: React.ReactNode }) {
  const mode = React.useSyncExternalStore(subscribe, readAppliedMode, readServerMode);

  const setMode = React.useCallback((next: DisplayMode) => {
    applyMode(next);
  }, []);

  const cycleMode = React.useCallback(() => {
    applyMode(nextDisplayMode(mode));
  }, [mode]);

  const value = React.useMemo(() => ({ cycleMode, mode, setMode }), [cycleMode, mode, setMode]);

  return <DisplayModeContext.Provider value={value}>{children}</DisplayModeContext.Provider>;
}

export function useDisplayMode(): DisplayModeContextValue {
  const context = React.useContext(DisplayModeContext);
  if (!context) {
    throw new Error("useDisplayMode() must be used inside a DisplayModeProvider");
  }
  return context;
}
