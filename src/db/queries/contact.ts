import { randomUUID } from "node:crypto";

import { getDatabase } from "@/db/client";
import { analyticsEvents, contactMessages } from "@/db/schema";
import type { AnalyticsEventInsert, PersistedContactInput } from "@/features/analytics/model";

export async function saveContactAndEvent(input: {
  contact: PersistedContactInput;
  event: AnalyticsEventInsert;
}): Promise<{ id: string }> {
  const id = randomUUID();

  await getDatabase().batch([
    getDatabase().insert(contactMessages).values({ id, ...input.contact }),
    getDatabase().insert(analyticsEvents).values(input.event),
  ]);

  return { id };
}
