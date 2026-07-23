import type { PersistedContactInput } from "@/features/analytics/model";
import { safeLog } from "@/features/operations/safe-log";
import { readResendConfig } from "@/lib/env/server";

export async function sendContactNotification(
  message: PersistedContactInput & { id: string },
): Promise<void> {
  const config = readResendConfig();

  if (!config) return;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `contact/${message.id}`,
      },
      body: JSON.stringify({
        from: config.from,
        to: config.to,
        subject: `Portfolio inquiry: ${message.inquiryType} - ${message.name}`,
        text: `Reply email: ${message.email}\n\nMessage:\n${message.message}`,
      }),
    });

    if (!response.ok) {
      safeLog("RESEND_FAILED", message.id);
    }
  } catch {
    safeLog("RESEND_FAILED", message.id);
  }
}
