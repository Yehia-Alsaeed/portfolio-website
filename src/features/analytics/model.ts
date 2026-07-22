import type { AnalyticsEventType, InquiryType } from "@/db/schema";

export type ScreenClass = "small" | "medium" | "large" | "wide";
export type DeviceClass = "mobile" | "tablet" | "desktop" | "unknown";
export type BrowserClass = "chrome" | "edge" | "firefox" | "safari" | "other" | "unknown";
export type OsClass = "android" | "ios" | "linux" | "macos" | "windows" | "other" | "unknown";

export type RequestFacts = {
  address: string;
  userAgent: string;
  country: string;
  device: DeviceClass;
  browser: BrowserClass;
  os: OsClass;
  isBot: boolean;
};

export type RateLimitDecision = {
  allowed: boolean;
  count: number;
  retryAfterSeconds: number;
};

export type AnalyticsEventInsert = {
  type: AnalyticsEventType;
  path: string;
  referrerDomain: string;
  country: string;
  device: DeviceClass;
  browser: BrowserClass;
  os: OsClass;
  screen: ScreenClass | "unknown";
  visitorHash: string;
  metadata: Record<string, string>;
  createdAt: Date;
};

export type PersistedContactInput = {
  inquiryType: InquiryType;
  name: string;
  email: string;
  message: string;
};
