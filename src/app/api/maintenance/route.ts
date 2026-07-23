import { runMaintenance } from "@/db/queries/maintenance";
import { handleMaintenanceRequest } from "@/features/operations/maintenance";
import { readCronSecret } from "@/lib/env/server";

export async function GET(request: Request): Promise<Response> {
  return handleMaintenanceRequest(request, {
    now: () => new Date(),
    run: runMaintenance,
    readSecret: () => readCronSecret(),
  });
}
