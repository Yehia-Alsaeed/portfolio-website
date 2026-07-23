import { checkDatabaseHealth } from "@/db/queries/health";
import { handleHealthRequest } from "@/features/operations/health";

export async function GET(): Promise<Response> {
  return handleHealthRequest({ check: checkDatabaseHealth });
}
