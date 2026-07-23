import { insertAnalyticsEvent } from "@/db/queries/analytics";
import { consumeRateLimit } from "@/db/queries/rate-limit";
import { handleTrackRequest } from "@/features/analytics/track-request";

export async function POST(request: Request): Promise<Response> {
  return handleTrackRequest(request, {
    now: () => new Date(),
    consume: consumeRateLimit,
    insert: insertAnalyticsEvent,
  });
}
