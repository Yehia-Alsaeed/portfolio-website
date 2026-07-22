import { getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import {
  ANALYTICS_EVENT_TYPES,
  analyticsDailyAggregates,
  analyticsEvents,
  contactMessages,
  INQUIRY_TYPES,
  rateLimitBuckets,
} from "@/db/schema";
import {
  readAnalyticsSalt,
  readCronSecret,
  readDatabaseUrl,
  readResendConfig,
} from "@/lib/env/server";

describe("Phase 6 schema contract", () => {
  it("names the four application tables", () => {
    expect(getTableName(contactMessages)).toBe("contact_messages");
    expect(getTableName(analyticsEvents)).toBe("analytics_events");
    expect(getTableName(analyticsDailyAggregates)).toBe("analytics_daily_aggregates");
    expect(getTableName(rateLimitBuckets)).toBe("rate_limit_buckets");
  });

  it("locks the four approved inquiry types in order", () => {
    expect(INQUIRY_TYPES).toEqual([
      "Job opportunity",
      "Freelance project",
      "Collaboration",
      "Other",
    ]);
  });

  it("locks the five approved analytics event types in order", () => {
    expect(ANALYTICS_EVENT_TYPES).toEqual([
      "page_view",
      "project_click",
      "cv_download",
      "contact_submit",
      "outbound_click",
    ]);
  });

  it("never stores raw IP or user-agent columns on analytics_events", () => {
    expect(Object.keys(analyticsEvents)).not.toContain("ip");
    expect(Object.keys(analyticsEvents)).not.toContain("userAgent");
  });
});

describe("Phase 6 server environment contract", () => {
  it("throws a fixed message naming only the missing DATABASE_URL", () => {
    expect(() => readDatabaseUrl({})).toThrow(/DATABASE_URL/);
    expect(() => readDatabaseUrl({})).not.toThrow(/postgres:\/\//);
  });

  it("throws a fixed message naming only the missing ANALYTICS_HASH_SALT", () => {
    expect(() => readAnalyticsSalt({})).toThrow(/ANALYTICS_HASH_SALT/);
  });

  it("throws a fixed message naming only the missing CRON_SECRET", () => {
    expect(() => readCronSecret({})).toThrow(/CRON_SECRET/);
  });

  it("returns undefined Resend config when unset", () => {
    expect(readResendConfig({})).toBeUndefined();
  });

  it("throws without echoing a supplied value when Resend config is partial", () => {
    const partial = {
      RESEND_API_KEY: "re_super_secret_value",
      CONTACT_NOTIFICATION_FROM: "",
      CONTACT_NOTIFICATION_TO: "yehias3eed11@gmail.com",
    };

    let message = "";
    try {
      readResendConfig(partial);
      throw new Error("expected readResendConfig to throw");
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    expect(message).not.toContain("re_super_secret_value");
    expect(message).toMatch(/CONTACT_NOTIFICATION_FROM/);
  });
});
