import { sql } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { rateLimitBuckets } from "@/db/schema";
import type { RateLimitDecision } from "@/features/analytics/model";

export async function consumeRateLimit(input: {
  scope: "contact" | "analytics";
  keyHash: string;
  limit: number;
  windowSeconds: 60 | 3600;
  now: Date;
}): Promise<RateLimitDecision> {
  const windowMs = input.windowSeconds * 1000;
  const windowStartMs = Math.floor(input.now.getTime() / windowMs) * windowMs;
  const windowStart = new Date(windowStartMs);
  const expiresAt = new Date(windowStartMs + windowMs * 2);

  const [row] = await getDatabase()
    .insert(rateLimitBuckets)
    .values({
      scope: input.scope,
      keyHash: input.keyHash,
      windowStart,
      requestCount: 1,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: [rateLimitBuckets.scope, rateLimitBuckets.keyHash, rateLimitBuckets.windowStart],
      set: { requestCount: sql`${rateLimitBuckets.requestCount} + 1` },
    })
    .returning({ requestCount: rateLimitBuckets.requestCount });

  const count = row?.requestCount ?? 1;
  const allowed = count <= input.limit;
  const retryAfterSeconds = allowed
    ? 0
    : Math.max(0, Math.ceil((windowStartMs + windowMs - input.now.getTime()) / 1000));

  return { allowed, count, retryAfterSeconds };
}
