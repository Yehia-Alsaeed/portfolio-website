"use server";

import { headers } from "next/headers";
import { after } from "next/server";

import { saveContactAndEvent } from "@/db/queries/contact";
import { consumeRateLimit } from "@/db/queries/rate-limit";
import { classifyRequest } from "@/features/analytics/request-facts";

import type { ContactFormState } from "./model";
import { sendContactNotification } from "./notify";
import { processContactSubmission } from "./submit-contact";

export async function submitContact(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const requestHeaders = await headers();
  const facts = classifyRequest(requestHeaders);

  return processContactSubmission(formData, facts, {
    now: () => new Date(),
    consume: consumeRateLimit,
    save: saveContactAndEvent,
    scheduleNotification: (message) => {
      after(() => sendContactNotification(message));
    },
  });
}
