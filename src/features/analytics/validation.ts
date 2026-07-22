import { FALLBACK_PROJECTS } from "@/content/projects/fallback";
import { CLIENT_WORK } from "@/content/services";

import type { ScreenClass } from "./model";

export type ProjectSlug = (typeof FALLBACK_PROJECTS)[number]["slug"];
export type ClientWorkSlug = (typeof CLIENT_WORK)[number]["trackingId"];

const PROJECT_SLUGS: ReadonlySet<string> = new Set(FALLBACK_PROJECTS.map((project) => project.slug));
const CLIENT_WORK_SLUGS: ReadonlySet<string> = new Set(
  CLIENT_WORK.map((entry) => entry.trackingId),
);
const SCREEN_CLASSES: ReadonlySet<string> = new Set<ScreenClass>([
  "small",
  "medium",
  "large",
  "wide",
]);

export type TrackEventInput =
  | { type: "page_view"; path: string; referrer: string; screen: ScreenClass }
  | {
      type: "project_click";
      path: string;
      projectSlug: ProjectSlug;
      destination: "github" | "live-demo";
      screen: ScreenClass;
    }
  | {
      type: "cv_download";
      path: string;
      placement: "footer" | "command-palette";
      screen: ScreenClass;
    }
  | {
      type: "outbound_click";
      path: string;
      destination: "github-profile" | "linkedin" | ClientWorkSlug;
      screen: ScreenClass;
    };

export function normalizePath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (value.length === 0 || value.length > 512) return undefined;
  if (!value.startsWith("/")) return undefined;
  if (value.includes("?") || value.includes("#")) return undefined;

  return value;
}

function isScreenClass(value: unknown): value is ScreenClass {
  return typeof value === "string" && SCREEN_CLASSES.has(value);
}

function hasExactKeys(record: Record<string, unknown>, keys: readonly string[]): boolean {
  const recordKeys = Object.keys(record);

  if (recordKeys.length !== keys.length) return false;

  return keys.every((key) => Object.prototype.hasOwnProperty.call(record, key));
}

export function parseTrackPayload(value: unknown): TrackEventInput | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;

  const record = value as Record<string, unknown>;
  const { type } = record;

  if (type === "page_view") {
    if (!hasExactKeys(record, ["type", "path", "referrer", "screen"])) return undefined;

    const path = normalizePath(record.path);
    const { referrer, screen } = record;

    if (
      !path ||
      typeof referrer !== "string" ||
      referrer.length > 2048 ||
      !isScreenClass(screen)
    ) {
      return undefined;
    }

    return { type: "page_view", path, referrer, screen };
  }

  if (type === "project_click") {
    if (!hasExactKeys(record, ["type", "path", "projectSlug", "destination", "screen"])) {
      return undefined;
    }

    const path = normalizePath(record.path);
    const { projectSlug, destination, screen } = record;

    if (
      !path ||
      typeof projectSlug !== "string" ||
      !PROJECT_SLUGS.has(projectSlug) ||
      (destination !== "github" && destination !== "live-demo") ||
      !isScreenClass(screen)
    ) {
      return undefined;
    }

    return {
      type: "project_click",
      path,
      projectSlug: projectSlug as ProjectSlug,
      destination,
      screen,
    };
  }

  if (type === "cv_download") {
    if (!hasExactKeys(record, ["type", "path", "placement", "screen"])) return undefined;

    const path = normalizePath(record.path);
    const { placement, screen } = record;

    if (
      !path ||
      (placement !== "footer" && placement !== "command-palette") ||
      !isScreenClass(screen)
    ) {
      return undefined;
    }

    return { type: "cv_download", path, placement, screen };
  }

  if (type === "outbound_click") {
    if (!hasExactKeys(record, ["type", "path", "destination", "screen"])) return undefined;

    const path = normalizePath(record.path);
    const { destination, screen } = record;
    const isKnownDestination =
      destination === "github-profile" ||
      destination === "linkedin" ||
      (typeof destination === "string" && CLIENT_WORK_SLUGS.has(destination));

    if (!path || !isKnownDestination || !isScreenClass(screen)) return undefined;

    return {
      type: "outbound_click",
      path,
      destination: destination as "github-profile" | "linkedin" | ClientWorkSlug,
      screen,
    };
  }

  return undefined;
}
