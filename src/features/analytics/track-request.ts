import { randomUUID } from "node:crypto";

import type { insertAnalyticsEvent } from "@/db/queries/analytics";
import type { consumeRateLimit } from "@/db/queries/rate-limit";
import { safeLog } from "@/features/operations/safe-log";
import { readAnalyticsSalt } from "@/lib/env/server";

import type { AnalyticsEventInsert } from "./model";
import { createRateLimitKey, createVisitorHash } from "./privacy";
import { classifyRequest } from "./request-facts";
import { parseTrackPayload, type TrackEventInput } from "./validation";

export type TrackRouteDependencies = {
  now: () => Date;
  consume: typeof consumeRateLimit;
  insert: typeof insertAnalyticsEvent;
};

const MAX_BODY_BYTES = 2048;
const RATE_LIMIT_SCOPE = "analytics" as const;
const RATE_LIMIT_WINDOW_SECONDS = 60 as const;
const RATE_LIMIT_MAX_ATTEMPTS = 120;

function emptyResponse(status: number): Response {
  return new Response(null, { status, headers: { "cache-control": "no-store" } });
}

function reduceReferrerToDomain(referrer: string, requestUrl: string): string {
  if (!referrer) return "direct";

  try {
    const referrerUrl = new URL(referrer);
    const originUrl = new URL(requestUrl);

    return referrerUrl.origin === originUrl.origin ? "direct" : referrerUrl.hostname;
  } catch {
    return "direct";
  }
}

function buildMetadata(payload: TrackEventInput): Record<string, string> {
  if (payload.type === "project_click") {
    return { projectSlug: payload.projectSlug, destination: payload.destination };
  }

  if (payload.type === "cv_download") {
    return { placement: payload.placement };
  }

  if (payload.type === "outbound_click") {
    return { destination: payload.destination };
  }

  return {};
}

export async function handleTrackRequest(
  request: Request,
  dependencies: TrackRouteDependencies,
): Promise<Response> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return emptyResponse(415);
  }

  const contentLengthHeader = request.headers.get("content-length");

  if (contentLengthHeader !== null) {
    const contentLength = Number(contentLengthHeader);

    if (!Number.isFinite(contentLength) || contentLength > MAX_BODY_BYTES) {
      return emptyResponse(413);
    }
  }

  const rawBody = await request.text();

  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return emptyResponse(413);
  }

  let parsedBody: unknown;

  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return emptyResponse(400);
  }

  const payload = parseTrackPayload(parsedBody);

  if (!payload) {
    return emptyResponse(400);
  }

  const facts = classifyRequest(request.headers);

  if (facts.isBot || payload.path.startsWith("/admin")) {
    return emptyResponse(204);
  }

  const salt = readAnalyticsSalt();
  const now = dependencies.now();
  const rateLimitKey = createRateLimitKey(facts, salt);

  const decision = await dependencies.consume({
    scope: RATE_LIMIT_SCOPE,
    keyHash: rateLimitKey,
    limit: RATE_LIMIT_MAX_ATTEMPTS,
    windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
    now,
  });

  if (!decision.allowed) {
    return emptyResponse(429);
  }

  const referrerDomain =
    payload.type === "page_view"
      ? reduceReferrerToDomain(payload.referrer, request.url)
      : "direct";

  const event: AnalyticsEventInsert = {
    type: payload.type,
    path: payload.path,
    referrerDomain,
    country: facts.country,
    device: facts.device,
    browser: facts.browser,
    os: facts.os,
    screen: payload.screen,
    visitorHash: createVisitorHash(facts, now, salt),
    metadata: buildMetadata(payload),
    createdAt: now,
  };

  try {
    await dependencies.insert(event);
  } catch {
    safeLog("ANALYTICS_DB_FAILED", randomUUID());
  }

  return emptyResponse(202);
}
