import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Vitest runs without injected globals, so Testing Library cannot register its
// own afterEach auto-cleanup; without this, trees from earlier tests stay
// mounted and their document-level listeners leak into later tests.
afterEach(() => {
  cleanup();
});

// next/font/local's real runtime module is intentionally empty - the actual
// font loading happens in a Next.js build-time (webpack/Turbopack) loader
// that Vitest never runs, so importing it directly resolves to a module with
// no default export. Stand in with the shape every call site actually reads
// (className, variable) instead of the real font-loading behavior.
vi.mock("next/font/local", () => ({
  default: () => ({ className: "mock-font", style: {}, variable: "--mock-font" }),
}));
