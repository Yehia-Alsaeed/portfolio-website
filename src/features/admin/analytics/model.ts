import type { AnalyticsEventType, InquiryType } from "@/db/schema";

export const ADMIN_RANGES = ["24h", "7d", "30d", "90d"] as const;
export type AdminRange = (typeof ADMIN_RANGES)[number];

export type BreakdownRow = {
  label: string;
  value: number;
  visitors: number;
};

export type RecentEvent = {
  id: number;
  type: Extract<AnalyticsEventType, "project_click" | "cv_download" | "contact_submit">;
  path: string;
  createdAt: string;
};

export type AdminOverview = {
  range: AdminRange;
  totals: {
    visitors: number;
    pageViews: number;
    contactSubmissions: number;
    cvDownloads: number;
  };
  trend: Array<{ bucket: string; pageViews: number; visitors: number }>;
  breakdowns: {
    pages: BreakdownRow[];
    sources: BreakdownRow[];
    countries: BreakdownRow[];
    devices: BreakdownRow[];
    browsers: BreakdownRow[];
  };
  recentEvents: RecentEvent[];
};

export type ContactCursor = { createdAt: string; id: string };

export type ContactMessageDto = {
  id: string;
  inquiryType: InquiryType;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type ContactPage = {
  rows: ContactMessageDto[];
  unreadCount: number;
  nextCursor?: string;
};
