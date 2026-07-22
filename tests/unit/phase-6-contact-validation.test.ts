import { describe, expect, it } from "vitest";

import { readHoneypot, validateContactSubmission } from "@/features/contact/validation";

function buildFormData(fields: Record<string, string | string[] | File>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      for (const entry of value) formData.append(key, entry);
    } else {
      formData.append(key, value);
    }
  }

  return formData;
}

const validFields = {
  inquiryType: "Freelance project",
  name: "Ada Lovelace",
  email: "  Ada@Example.COM  ",
  message: "Hello there, I would like to discuss a project.",
  website: "",
};

describe("Phase 6 contact validation", () => {
  it("accepts a well-formed submission, trims fields, and lowercases only the email domain", () => {
    const result = validateContactSubmission(buildFormData(validFields));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.values).toEqual({
      inquiryType: "Freelance project",
      name: "Ada Lovelace",
      email: "Ada@example.com",
      message: "Hello there, I would like to discuss a project.",
    });
    expect(result.honeypotFilled).toBe(false);
  });

  it("accepts only the four approved inquiry types", () => {
    const result = validateContactSubmission(
      buildFormData({ ...validFields, inquiryType: "Something else" }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.fieldErrors.inquiryType).toBeTruthy();
  });

  it("rejects duplicate FormData keys", () => {
    const result = validateContactSubmission(
      buildFormData({ ...validFields, name: ["Ada", "Eve"] }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.fieldErrors.name).toBeTruthy();
  });

  it("rejects a File value in a text field", () => {
    const formData = buildFormData(validFields);

    formData.set("name", new File(["x"], "x.txt"));
    const result = validateContactSubmission(formData);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.fieldErrors.name).toBeTruthy();
  });

  it("fails empty required fields with field-specific messages", () => {
    const result = validateContactSubmission(
      buildFormData({ inquiryType: "", name: "", email: "", message: "", website: "" }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.fieldErrors.inquiryType).toBeTruthy();
    expect(result.fieldErrors.name).toBeTruthy();
    expect(result.fieldErrors.email).toBeTruthy();
    expect(result.fieldErrors.message).toBeTruthy();
  });

  it("rejects values over their maximum length", () => {
    const result = validateContactSubmission(
      buildFormData({
        ...validFields,
        name: "a".repeat(101),
        email: `${"a".repeat(250)}@example.com`,
        message: "a".repeat(5001),
      }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.fieldErrors.name).toBeTruthy();
    expect(result.fieldErrors.email).toBeTruthy();
    expect(result.fieldErrors.message).toBeTruthy();
  });

  it("rejects an invalid email shape", () => {
    const result = validateContactSubmission(
      buildFormData({ ...validFields, email: "not-an-email" }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.fieldErrors.email).toBeTruthy();
  });

  it("preserves ordinary line breaks in the message", () => {
    const result = validateContactSubmission(
      buildFormData({ ...validFields, message: "Line one\nLine two" }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.values.message).toBe("Line one\nLine two");
  });

  it("detects a populated honeypot without a field error", () => {
    const result = validateContactSubmission(buildFormData({ ...validFields, website: "spam" }));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.honeypotFilled).toBe(true);
  });

  it("treats a duplicated or file-valued honeypot as populated", () => {
    expect(readHoneypot(buildFormData({ website: ["a", "b"] }))).toBe(true);
    expect(readHoneypot(buildFormData({ website: new File(["x"], "x.txt") }))).toBe(true);
    expect(readHoneypot(buildFormData({}))).toBe(false);
  });
});
