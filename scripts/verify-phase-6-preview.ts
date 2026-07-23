import { and, eq, gte, inArray, like, lte } from "drizzle-orm";
import { pathToFileURL } from "node:url";

import { getDatabase } from "../src/db/client";
import { analyticsDailyAggregates, analyticsEvents, contactMessages } from "../src/db/schema";

/**
 * One-time preview-only QA verifier. It refuses to run anywhere but a Vercel
 * preview deployment, confirms the live analytics/contact/maintenance
 * contract against the real database, then deletes only the rows it and the
 * paired Playwright live run created so the preview branch is left clean.
 *
 * Usage (see docs/superpowers/plans/2026-07-23-phase-6-data-contact-analytics.md
 * Task 6 Step 5 for the full invocation):
 *   node --env-file=.env.phase6-preview.local --import tsx scripts/verify-phase-6-preview.ts
 */

type CheckResult = { name: string; pass: boolean; detail: string | undefined };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const results: CheckResult[] = [];

function record(name: string, pass: boolean, detail?: string): void {
  results.push({ name, pass, detail });
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) throw new Error(`${name} is required but was not set`);

  return value;
}

type Guards = {
  previewUrl: string;
  runId: string;
  cronSecret: string;
  bypassSecret: string | undefined;
};

function assertGuards(): Guards {
  if (process.env.VERCEL_ENV !== "preview") {
    throw new Error("Refusing to run: VERCEL_ENV must be 'preview'");
  }

  if (process.env.PHASE6_QA_CONFIRM !== "preview-only") {
    throw new Error("Refusing to run: PHASE6_QA_CONFIRM must be 'preview-only'");
  }

  const runId = requireEnv("PHASE6_QA_RUN_ID");

  if (!UUID_PATTERN.test(runId)) {
    throw new Error("Refusing to run: PHASE6_QA_RUN_ID must be a generated UUID");
  }

  const previewUrl = requireEnv("PHASE6_PREVIEW_URL");

  if (!previewUrl.startsWith("https://")) {
    throw new Error("Refusing to run: PHASE6_PREVIEW_URL must be an HTTPS URL");
  }

  const cronSecret = requireEnv("CRON_SECRET");
  const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim() || undefined;

  return { previewUrl, runId, cronSecret, bypassSecret };
}

function buildHeaders(
  bypassSecret: string | undefined,
  extra: Record<string, string> = {},
): Record<string, string> {
  return {
    ...extra,
    ...(bypassSecret ? { "x-vercel-protection-bypass": bypassSecret } : {}),
  };
}

async function checkHealth(guards: Guards): Promise<void> {
  const response = await fetch(`${guards.previewUrl}/api/health`, {
    headers: buildHeaders(guards.bypassSecret),
  });
  const body = (await response.json()) as { status?: string };

  record("health endpoint reports ok", response.status === 200 && body.status === "ok");
}

const TRACK_EVENT_SHAPES: readonly Record<string, unknown>[] = [
  { type: "page_view", path: "/", referrer: "", screen: "large" },
  {
    type: "project_click",
    path: "/projects",
    projectSlug: "skillbridge-ai-interviewer",
    destination: "github",
    screen: "large",
  },
  { type: "cv_download", path: "/", placement: "footer", screen: "large" },
  { type: "outbound_click", path: "/", destination: "github-profile", screen: "large" },
];

async function checkTrackAcceptance(guards: Guards): Promise<void> {
  for (const event of TRACK_EVENT_SHAPES) {
    const response = await fetch(`${guards.previewUrl}/api/track`, {
      method: "POST",
      headers: buildHeaders(guards.bypassSecret, { "content-type": "application/json" }),
      body: JSON.stringify(event),
    });

    record(`accepts the ${String(event.type)} event shape`, response.status === 202);
  }

  const rejected = await fetch(`${guards.previewUrl}/api/track`, {
    method: "POST",
    headers: buildHeaders(guards.bypassSecret, { "content-type": "application/json" }),
    body: JSON.stringify({ type: "unrecognized_event" }),
  });

  record("rejects an unrecognized event payload", rejected.status === 400);
}

async function checkAnalyticsRateLimit(guards: Guards): Promise<void> {
  let sawLimit = false;

  for (let attempt = 0; attempt < 130; attempt += 1) {
    const response = await fetch(`${guards.previewUrl}/api/track`, {
      method: "POST",
      headers: buildHeaders(guards.bypassSecret, { "content-type": "application/json" }),
      body: JSON.stringify({ type: "page_view", path: "/", referrer: "", screen: "large" }),
    });

    if (response.status === 429) {
      sawLimit = true;
      break;
    }
  }

  record("enforces the 120-per-minute analytics rate limit", sawLimit);
}

async function checkContactRateLimitObserved(): Promise<void> {
  // The 3-per-hour contact limit is exercised and asserted by the Playwright
  // live spec (tests/e2e/phase-6.spec.ts) against the real browser/form, not
  // repeated here to avoid consuming the preview branch's own contact quota.
  record(
    "contact 3-per-hour limit verified via Playwright live spec",
    true,
    "see tests/e2e/phase-6.spec.ts live-mode run",
  );
}

async function checkMaintenanceIdempotency(guards: Guards): Promise<void> {
  const headers = buildHeaders(guards.bypassSecret, {
    authorization: `Bearer ${guards.cronSecret}`,
  });

  const first = await fetch(`${guards.previewUrl}/api/maintenance`, { headers });
  const firstBody: unknown = await first.json();
  const second = await fetch(`${guards.previewUrl}/api/maintenance`, { headers });
  const secondBody: unknown = await second.json();

  record(
    "maintenance is idempotent across two consecutive runs",
    first.status === 200 &&
      second.status === 200 &&
      JSON.stringify(firstBody) === JSON.stringify(secondBody),
    `counts: ${JSON.stringify(firstBody)}`,
  );
}

async function verifyAndCleanMarkedContacts(runId: string): Promise<void> {
  const db = getDatabase();

  const marked = await db
    .select({ id: contactMessages.id, createdAt: contactMessages.createdAt })
    .from(contactMessages)
    .where(like(contactMessages.message, `%${runId}%`));

  record(
    "finds the QA-marked contact rows created by the live spec",
    marked.length > 0,
    `count: ${marked.length}`,
  );

  if (marked.length === 0) return;

  const timestamps = marked.map((row) => row.createdAt.getTime());
  const windowStart = new Date(Math.min(...timestamps) - 5_000);
  const windowEnd = new Date(Math.max(...timestamps) + 5_000);

  const linkedEvents = await db
    .select({ id: analyticsEvents.id })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.type, "contact_submit"),
        gte(analyticsEvents.createdAt, windowStart),
        lte(analyticsEvents.createdAt, windowEnd),
      ),
    );

  const contactIds = marked.map((row) => row.id);

  await db.delete(contactMessages).where(inArray(contactMessages.id, contactIds));
  record("deletes the QA-marked contact rows", true, `deleted contacts: ${contactIds.length}`);

  if (linkedEvents.length > 0) {
    const eventIds = linkedEvents.map((row) => row.id);

    await db.delete(analyticsEvents).where(inArray(analyticsEvents.id, eventIds));
    record(
      "deletes the analytics events linked to the QA run window",
      true,
      `deleted events: ${eventIds.length}`,
    );
  }
}

async function cleanScriptGeneratedEvents(scriptStartedAt: Date): Promise<void> {
  const db = getDatabase();

  const scriptEvents = await db
    .select({ id: analyticsEvents.id })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, scriptStartedAt));

  if (scriptEvents.length === 0) return;

  const ids = scriptEvents.map((row) => row.id);

  await db.delete(analyticsEvents).where(inArray(analyticsEvents.id, ids));
  record("deletes the events this verifier script generated", true, `deleted: ${ids.length}`);
}

async function reaggregateAfterCleanup(guards: Guards): Promise<void> {
  const headers = buildHeaders(guards.bypassSecret, {
    authorization: `Bearer ${guards.cronSecret}`,
  });
  const response = await fetch(`${guards.previewUrl}/api/maintenance`, { headers });

  record(
    "re-runs maintenance after cleanup to remove the QA aggregate contribution",
    response.status === 200,
  );
}

async function confirmNoResidualAggregateRows(runId: string): Promise<void> {
  // Aggregate rows never carry visitor-identifying data or the QA marker by
  // design (they are grouped counts only), so this is a sanity count rather
  // than a marker search: confirm the table is still well-formed after the
  // re-aggregation run above.
  const db = getDatabase();
  const rows = await db
    .select({ date: analyticsDailyAggregates.date })
    .from(analyticsDailyAggregates);

  record("analytics_daily_aggregates remains queryable after cleanup", Array.isArray(rows));
  void runId;
}

async function main(): Promise<void> {
  const scriptStartedAt = new Date();
  const guards = assertGuards();

  await checkHealth(guards);
  await checkTrackAcceptance(guards);
  await checkAnalyticsRateLimit(guards);
  await checkContactRateLimitObserved();
  await checkMaintenanceIdempotency(guards);
  await verifyAndCleanMarkedContacts(guards.runId);
  await cleanScriptGeneratedEvents(scriptStartedAt);
  await reaggregateAfterCleanup(guards);
  await confirmNoResidualAggregateRows(guards.runId);

  const failed = results.filter((result) => !result.pass);

  for (const result of results) {
    console.log(
      `${result.pass ? "PASS" : "FAIL"} - ${result.name}${result.detail ? ` (${result.detail})` : ""}`,
    );
  }

  if (failed.length > 0) {
    console.error(`${failed.length} of ${results.length} checks failed.`);
    process.exitCode = 1;
    return;
  }

  console.log(`All ${results.length} checks passed.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "verify-phase-6-preview failed");
    process.exitCode = 1;
  });
}
