import { randomUUID, timingSafeEqual } from "node:crypto";

import type { MaintenanceResult } from "@/db/queries/maintenance";

import { safeLog } from "./safe-log";

export type { MaintenanceResult };

export type MaintenanceDependencies = {
  now: () => Date;
  run: (now: Date) => Promise<MaintenanceResult>;
  readSecret: () => string;
};

function noStoreResponse(body: string | null, status: number): Response {
  return new Response(body, {
    status,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      "cache-control": "no-store",
    },
  });
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) return false;

  return timingSafeEqual(bufferA, bufferB);
}

export async function handleMaintenanceRequest(
  request: Request,
  dependencies: MaintenanceDependencies,
): Promise<Response> {
  let secret: string;

  try {
    secret = dependencies.readSecret();
  } catch {
    return noStoreResponse(null, 401);
  }

  const authorization = request.headers.get("authorization") ?? "";

  if (!timingSafeEqualStrings(authorization, `Bearer ${secret}`)) {
    return noStoreResponse(null, 401);
  }

  try {
    const result = await dependencies.run(dependencies.now());

    return noStoreResponse(JSON.stringify(result), 200);
  } catch (error) {
    // TEMPORARY debug-only diagnostic, to be reverted before merge.
    console.error("TEMP_DEBUG_MAINTENANCE_FAILURE", error instanceof Error ? error.stack : error);
    safeLog("MAINTENANCE_FAILED", randomUUID());

    return noStoreResponse(null, 500);
  }
}
