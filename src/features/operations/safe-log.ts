export type SafeLogCode =
  | "CONTACT_DB_FAILED"
  | "ANALYTICS_DB_FAILED"
  | "MAINTENANCE_FAILED"
  | "RESEND_FAILED"
  | "HEALTH_DB_FAILED";

export function safeLog(code: SafeLogCode, requestId: string): void {
  console.error(JSON.stringify({ code, requestId, timestamp: new Date().toISOString() }));
}
