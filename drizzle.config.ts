import { defineConfig } from "drizzle-kit";

import { readMigrationUrl } from "@/lib/env/server";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: readMigrationUrl(),
  },
});
