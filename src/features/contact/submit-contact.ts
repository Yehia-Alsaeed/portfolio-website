import { randomUUID } from "node:crypto";

import type { AnalyticsEventInsert, RequestFacts } from "@/features/analytics/model";
import { createRateLimitKey, createVisitorHash } from "@/features/analytics/privacy";
import { safeLog } from "@/features/operations/safe-log";
import { readAnalyticsSalt } from "@/lib/env/server";

import type { ContactDependencies, ContactFormState } from "./model";
import { validateContactSubmission } from "./validation";

const RATE_LIMIT_SCOPE = "contact" as const;
const RATE_LIMIT_WINDOW_SECONDS = 3600 as const;
const RATE_LIMIT_MAX_ATTEMPTS = 3;

export async function processContactSubmission(
  formData: FormData,
  facts: RequestFacts,
  dependencies: ContactDependencies,
): Promise<ContactFormState> {
  const validation = validateContactSubmission(formData);

  if (!validation.ok) {
    return {
      status: "invalid",
      message: "Complete every field with a valid email address.",
      fieldErrors: validation.fieldErrors,
      values: validation.values,
    };
  }

  const requestId = randomUUID();

  try {
    const salt = readAnalyticsSalt();
    const now = dependencies.now();
    const rateLimitKey = createRateLimitKey(facts, salt);

    const decision = await dependencies.consume({
      scope: RATE_LIMIT_SCOPE,
      keyHash: rateLimitKey,
      limit: RATE_LIMIT_MAX_ATTEMPTS,
      windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
      now,
    });

    if (!decision.allowed) {
      return {
        status: "rate-limited",
        message: "Too many messages sent recently. Try again later, or email directly.",
        fieldErrors: {},
        values: validation.values,
      };
    }

    if (validation.honeypotFilled) {
      return { status: "success", message: "Message saved.", fieldErrors: {} };
    }

    const event: AnalyticsEventInsert = {
      type: "contact_submit",
      path: "/",
      referrerDomain: "direct",
      country: facts.country,
      device: facts.device,
      browser: facts.browser,
      os: facts.os,
      screen: "unknown",
      visitorHash: createVisitorHash(facts, now, salt),
      metadata: {},
      createdAt: now,
    };

    const saved = await dependencies.save({ contact: validation.values, event });

    try {
      dependencies.scheduleNotification({ ...validation.values, id: saved.id });
    } catch {
      // Notification-scheduling failures never change a successful contact result.
    }

    return { status: "success", message: "Message saved.", fieldErrors: {} };
  } catch {
    safeLog("CONTACT_DB_FAILED", requestId);

    return {
      status: "unavailable",
      message: "Your message could not be saved. Email directly instead.",
      fieldErrors: {},
      values: validation.values,
    };
  }
}
