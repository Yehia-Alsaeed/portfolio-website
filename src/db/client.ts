import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import { readDatabaseUrl } from "@/lib/env/server";

import * as schema from "./schema";

let database: NeonHttpDatabase<typeof schema> | undefined;

export function getDatabase(): NeonHttpDatabase<typeof schema> {
  database ??= drizzle(readDatabaseUrl(), { schema });

  return database;
}
