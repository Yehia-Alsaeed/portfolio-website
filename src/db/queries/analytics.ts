import { getDatabase } from "@/db/client";
import { analyticsEvents } from "@/db/schema";
import type { AnalyticsEventInsert } from "@/features/analytics/model";

export async function insertAnalyticsEvent(input: AnalyticsEventInsert): Promise<void> {
  await getDatabase().insert(analyticsEvents).values(input);
}
