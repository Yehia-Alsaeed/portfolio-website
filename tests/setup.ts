import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest runs without injected globals, so Testing Library cannot register its
// own afterEach auto-cleanup; without this, trees from earlier tests stay
// mounted and their document-level listeners leak into later tests.
afterEach(() => {
  cleanup();
});
