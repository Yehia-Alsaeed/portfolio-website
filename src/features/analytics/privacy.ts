import { createHmac } from "node:crypto";

import type { RequestFacts } from "./model";

function utcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function createVisitorHash(facts: RequestFacts, now: Date, salt: string): string {
  const message = `visitor\0${utcDateString(now)}\0${facts.address}\0${facts.userAgent}`;

  return createHmac("sha256", salt).update(message).digest("hex");
}

export function createRateLimitKey(facts: RequestFacts, salt: string): string {
  const message = `rate-limit\0${facts.address}\0${facts.userAgent}`;

  return createHmac("sha256", salt).update(message).digest("hex");
}
