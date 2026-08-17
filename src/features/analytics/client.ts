import type { ScreenClass } from "./model";
import type { ClientWorkSlug, ProjectSlug } from "./validation";

export const ANALYTICS_EXCLUSION_KEY = "ya.analytics.excluded";

export type ClickTrackingIntent =
  | { type: "project_click"; projectSlug: ProjectSlug; destination: "github" | "live-demo" }
  // The footer link was removed, so the palette is the only thing that can
  // emit this. Historical rows in the database still carry placement "footer";
  // metadata is free-form there, so reading them is unaffected.
  | { type: "cv_download"; placement: "command-palette" }
  | { type: "outbound_click"; destination: "github-profile" | "linkedin" | ClientWorkSlug };

export type ClientTrackEvent =
  | (ClickTrackingIntent & { path: string; screen: ScreenClass })
  | { type: "page_view"; path: string; referrer: string; screen: ScreenClass };

export function getScreenClass(width: number): ScreenClass {
  if (width < 640) return "small";
  if (width < 1024) return "medium";
  if (width < 1440) return "large";

  return "wide";
}

function isExcluded(): boolean {
  try {
    return window.localStorage.getItem(ANALYTICS_EXCLUSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function trackEvent(event: ClientTrackEvent): void {
  if (isExcluded()) return;

  void fetch("/api/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(event),
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => undefined);
}
