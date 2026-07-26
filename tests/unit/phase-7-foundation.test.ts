import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import { analyticsDailyAggregates, contactMessages } from "@/db/schema";
import { readAdminUserId, readNeonAuthBaseUrl, readNeonAuthCookieSecret } from "@/lib/env/server";

function indexColumns(table: Parameters<typeof getTableConfig>[0], name: string): string[] {
  const index = getTableConfig(table).indexes.find((entry) => entry.config.name === name);

  return (
    index?.config.columns.map((column) => {
      if ("name" in column && typeof column.name === "string") return column.name;

      throw new Error(`Unexpected non-column expression in ${name}`);
    }) ?? []
  );
}

describe("Phase 7 admin foundation environment contract", () => {
  it("requires Neon Auth and admin variables with fixed missing-variable messages", () => {
    expect(() => readNeonAuthBaseUrl({})).toThrow("NEON_AUTH_BASE_URL is required but was not set");
    expect(() => readNeonAuthCookieSecret({})).toThrow(
      "NEON_AUTH_COOKIE_SECRET is required but was not set",
    );
    expect(() => readAdminUserId({})).toThrow("ADMIN_USER_ID is required but was not set");
  });

  it("rejects short Neon Auth cookie secrets without echoing supplied values", () => {
    const weakSecret = "short-secret-value";

    expect(() => readNeonAuthCookieSecret({ NEON_AUTH_COOKIE_SECRET: weakSecret })).toThrow(
      "NEON_AUTH_COOKIE_SECRET must be at least 32 characters",
    );

    try {
      readNeonAuthCookieSecret({ NEON_AUTH_COOKIE_SECRET: weakSecret });
      throw new Error("expected readNeonAuthCookieSecret to throw");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      expect(message).not.toContain(weakSecret);
    }
  });

  it("never echoes supplied Neon Auth or admin values in errors", () => {
    const supplied = {
      NEON_AUTH_BASE_URL: "",
      NEON_AUTH_COOKIE_SECRET: "x".repeat(31),
      ADMIN_USER_ID: "admin_user_secret_value",
    };

    for (const read of [readNeonAuthBaseUrl, readNeonAuthCookieSecret, readAdminUserId]) {
      try {
        read(supplied);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        expect(message).not.toContain("admin_user_secret_value");
        expect(message).not.toContain("x".repeat(31));
      }
    }
  });

  it("does not validate process env at module evaluation time", async () => {
    const original = {
      NEON_AUTH_BASE_URL: process.env.NEON_AUTH_BASE_URL,
      NEON_AUTH_COOKIE_SECRET: process.env.NEON_AUTH_COOKIE_SECRET,
      ADMIN_USER_ID: process.env.ADMIN_USER_ID,
    };

    delete process.env.NEON_AUTH_BASE_URL;
    delete process.env.NEON_AUTH_COOKIE_SECRET;
    delete process.env.ADMIN_USER_ID;

    try {
      await import("@/lib/env/server");
    } finally {
      for (const [name, value] of Object.entries(original)) {
        if (value === undefined) {
          delete process.env[name];
        } else {
          process.env[name] = value;
        }
      }
    }
  });
});

describe("Phase 7 admin foundation schema contract", () => {
  it("adds the bounded contact inbox read-state index", () => {
    expect(indexColumns(contactMessages, "contact_messages_is_read_created_at_id_idx")).toEqual([
      "isRead",
      "createdAt",
      "id",
    ]);
  });

  it("adds the aggregate breakdown lookup index", () => {
    expect(
      indexColumns(
        analyticsDailyAggregates,
        "analytics_daily_aggregates_dimension_event_type_date_value_idx",
      ),
    ).toEqual(["dimension", "eventType", "date", "dimensionValue"]);
  });
});
