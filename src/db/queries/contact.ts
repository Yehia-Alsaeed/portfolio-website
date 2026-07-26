import { randomUUID } from "node:crypto";

import { getDatabase } from "@/db/client";
import { analyticsEvents, contactMessages } from "@/db/schema";
import type { AnalyticsEventInsert, PersistedContactInput } from "@/features/analytics/model";

export async function saveContactAndEvent(input: {
  contact: PersistedContactInput;
  event?: AnalyticsEventInsert;
}): Promise<{ id: string }> {
  const id = randomUUID();
  const db = getDatabase();

  if (input.event) {
    await db.batch([
      db.insert(contactMessages).values({ id, ...input.contact }),
      db.insert(analyticsEvents).values(input.event),
    ]);
  } else {
    await db.insert(contactMessages).values({ id, ...input.contact });
  }

  return { id };
}
