import type { saveContactAndEvent } from "@/db/queries/contact";
import type { consumeRateLimit } from "@/db/queries/rate-limit";
import type { PersistedContactInput } from "@/features/analytics/model";

export type ContactField = "inquiryType" | "name" | "email" | "message";
export type ContactDraft = Record<ContactField, string>;

export type ContactFormState = {
  status: "idle" | "invalid" | "success" | "rate-limited" | "unavailable";
  message: string;
  fieldErrors: Partial<Record<ContactField, string>>;
  values?: ContactDraft;
};

export const INITIAL_CONTACT_STATE: ContactFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

export type ContactDependencies = {
  now: () => Date;
  consume: typeof consumeRateLimit;
  save: typeof saveContactAndEvent;
  scheduleNotification: (message: PersistedContactInput & { id: string }) => void;
};
