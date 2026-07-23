import { randomUUID } from "node:crypto";

import { safeLog } from "./safe-log";

export type HealthDependencies = {
  check: () => Promise<boolean>;
};

function noStoreJson(status: number, body: { status: "ok" | "unavailable" }): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export async function handleHealthRequest(dependencies: HealthDependencies): Promise<Response> {
  let healthy: boolean;

  try {
    healthy = await dependencies.check();
  } catch {
    healthy = false;
  }

  if (!healthy) {
    safeLog("HEALTH_DB_FAILED", randomUUID());

    return noStoreJson(503, { status: "unavailable" });
  }

  return noStoreJson(200, { status: "ok" });
}
