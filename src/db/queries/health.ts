import { sql } from "drizzle-orm";

import { getDatabase } from "@/db/client";

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await getDatabase().execute(sql`select 1`);

    return true;
  } catch {
    return false;
  }
}
