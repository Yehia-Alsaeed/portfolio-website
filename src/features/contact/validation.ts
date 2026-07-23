import { INQUIRY_TYPES, type InquiryType } from "@/db/schema";

import type { ContactDraft, ContactField } from "./model";

export type ContactValidationSuccess = {
  ok: true;
  honeypotFilled: boolean;
  values: {
    inquiryType: InquiryType;
    name: string;
    email: string;
    message: string;
  };
};

export type ContactValidationFailure = {
  ok: false;
  fieldErrors: Partial<Record<ContactField, string>>;
  values: ContactDraft;
};

export type ContactValidationResult = ContactValidationSuccess | ContactValidationFailure;

const EMAIL_PATTERN = /^[^\s@]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
const MESSAGE_ALLOWED_CONTROL_CHARS: ReadonlySet<string> = new Set(["\n", "\r", "\t"]);
const NO_ALLOWED_CONTROL_CHARS: ReadonlySet<string> = new Set();

function hasDisallowedControlChars(value: string, allowed: ReadonlySet<string>): boolean {
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    const isControlChar = code <= 31 || code === 127;

    if (isControlChar && !allowed.has(char)) return true;
  }

  return false;
}

function readSingleString(formData: FormData, name: string): string | undefined {
  const values = formData.getAll(name);

  if (values.length !== 1) return undefined;

  const [value] = values;

  return typeof value === "string" ? value : undefined;
}

function normalizeEmail(raw: string): string {
  const trimmed = raw.trim();
  const at = trimmed.lastIndexOf("@");

  if (at === -1) return trimmed;

  return `${trimmed.slice(0, at)}@${trimmed.slice(at + 1).toLowerCase()}`;
}

function isInquiryType(value: string): value is InquiryType {
  return (INQUIRY_TYPES as readonly string[]).includes(value);
}

export function readHoneypot(formData: FormData): boolean {
  const values = formData.getAll("website");

  if (values.length === 0) return false;
  if (values.length > 1) return true;

  const [value] = values;

  if (typeof value !== "string") return true;

  return value.trim().length > 0;
}

export function validateContactSubmission(formData: FormData): ContactValidationResult {
  const rawInquiryType = readSingleString(formData, "inquiryType") ?? "";
  const rawName = readSingleString(formData, "name") ?? "";
  const rawEmail = readSingleString(formData, "email") ?? "";
  const rawMessage = readSingleString(formData, "message") ?? "";

  const inquiryType = rawInquiryType.trim();
  const name = rawName.trim();
  const email = normalizeEmail(rawEmail);
  const message = rawMessage.trim();

  const fieldErrors: Partial<Record<ContactField, string>> = {};

  if (!isInquiryType(inquiryType)) {
    fieldErrors.inquiryType = "Select an inquiry type.";
  }

  if (name.length === 0) {
    fieldErrors.name = "Enter your name.";
  } else if (hasDisallowedControlChars(name, NO_ALLOWED_CONTROL_CHARS)) {
    fieldErrors.name = "Name contains characters that are not allowed.";
  } else if (name.length > 100) {
    fieldErrors.name = "Name must be 100 characters or fewer.";
  }

  if (email.length === 0) {
    fieldErrors.email = "Enter your email address.";
  } else if (hasDisallowedControlChars(email, NO_ALLOWED_CONTROL_CHARS)) {
    fieldErrors.email = "Email contains characters that are not allowed.";
  } else if (email.length > 254) {
    fieldErrors.email = "Email must be 254 characters or fewer.";
  } else if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (message.length === 0) {
    fieldErrors.message = "Enter a message.";
  } else if (hasDisallowedControlChars(message, MESSAGE_ALLOWED_CONTROL_CHARS)) {
    fieldErrors.message = "Message contains characters that are not allowed.";
  } else if (message.length > 5000) {
    fieldErrors.message = "Message must be 5,000 characters or fewer.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, values: { inquiryType, name, email, message } };
  }

  return {
    ok: true,
    honeypotFilled: readHoneypot(formData),
    values: { inquiryType: inquiryType as InquiryType, name, email, message },
  };
}
