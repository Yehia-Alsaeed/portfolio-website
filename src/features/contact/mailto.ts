import { PROFILE } from "@/content/profile";

export type ContactDraft = {
  inquiryType: string;
  name: string;
  email: string;
  message: string;
};

export function buildContactMailto(draft: ContactDraft): `mailto:${string}` {
  const subject = `Portfolio inquiry: ${draft.inquiryType} - ${draft.name}`;
  const body = `Reply email: ${draft.email}\n\nMessage:\n${draft.message}`;

  return `mailto:${PROFILE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
