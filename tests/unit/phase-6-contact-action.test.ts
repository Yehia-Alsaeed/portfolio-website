import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RequestFacts } from "@/features/analytics/model";
import type { ContactDependencies } from "@/features/contact/model";
import { processContactSubmission } from "@/features/contact/submit-contact";

const facts: RequestFacts = {
  address: "203.0.113.5",
  userAgent: "Mozilla/5.0 test-agent",
  country: "US",
  device: "desktop",
  browser: "chrome",
  os: "macos",
  isBot: false,
};

function buildFormData(overrides: Record<string, string> = {}): FormData {
  const fields: Record<string, string> = {
    inquiryType: "Freelance project",
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Hello there",
    website: "",
    ...overrides,
  };
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) formData.set(key, value);

  return formData;
}

function buildDependencies(overrides: Partial<ContactDependencies> = {}): ContactDependencies {
  return {
    now: () => new Date("2026-07-23T12:00:00Z"),
    consume: vi.fn().mockResolvedValue({ allowed: true, count: 1, retryAfterSeconds: 0 }),
    save: vi.fn().mockResolvedValue({ id: "11111111-1111-1111-1111-111111111111" }),
    scheduleNotification: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  process.env.ANALYTICS_HASH_SALT = "unit-test-salt";
});

describe("Phase 6 contact submission service", () => {
  it("never consults rate limiting or persistence for an invalid submission", async () => {
    const dependencies = buildDependencies();
    const result = await processContactSubmission(
      buildFormData({ name: "" }),
      facts,
      dependencies,
    );

    expect(result.status).toBe("invalid");
    expect(dependencies.consume).not.toHaveBeenCalled();
    expect(dependencies.save).not.toHaveBeenCalled();
  });

  it("treats a populated honeypot as success without saving or notifying", async () => {
    const dependencies = buildDependencies();
    const result = await processContactSubmission(
      buildFormData({ website: "http://spam.example" }),
      facts,
      dependencies,
    );

    expect(result).toEqual({ status: "success", message: "Message saved.", fieldErrors: {} });
    expect(dependencies.consume).toHaveBeenCalledTimes(1);
    expect(dependencies.save).not.toHaveBeenCalled();
    expect(dependencies.scheduleNotification).not.toHaveBeenCalled();
  });

  it("rate-limits the fourth contact attempt in an hour and preserves the draft", async () => {
    const dependencies = buildDependencies({
      consume: vi.fn().mockResolvedValue({ allowed: false, count: 4, retryAfterSeconds: 1800 }),
    });
    const result = await processContactSubmission(buildFormData(), facts, dependencies);

    expect(result.status).toBe("rate-limited");
    expect(result.values).toEqual({
      inquiryType: "Freelance project",
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Hello there",
    });
    expect(dependencies.save).not.toHaveBeenCalled();
  });

  it("returns unavailable with a preserved draft when persistence fails", async () => {
    const dependencies = buildDependencies({
      save: vi.fn().mockRejectedValue(new Error("connection reset")),
    });
    const result = await processContactSubmission(buildFormData(), facts, dependencies);

    expect(result.status).toBe("unavailable");
    expect(result.values).toEqual({
      inquiryType: "Freelance project",
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Hello there",
    });
    expect(dependencies.scheduleNotification).not.toHaveBeenCalled();
  });

  it("schedules notification only after persistence succeeds and clears the draft", async () => {
    const callOrder: string[] = [];
    const dependencies = buildDependencies({
      save: vi.fn().mockImplementation(async () => {
        callOrder.push("save");

        return { id: "22222222-2222-2222-2222-222222222222" };
      }),
      scheduleNotification: vi.fn().mockImplementation(() => {
        callOrder.push("notify");
      }),
    });

    const result = await processContactSubmission(buildFormData(), facts, dependencies);

    expect(result).toEqual({ status: "success", message: "Message saved.", fieldErrors: {} });
    expect(callOrder).toEqual(["save", "notify"]);
    expect(dependencies.scheduleNotification).toHaveBeenCalledWith({
      inquiryType: "Freelance project",
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Hello there",
      id: "22222222-2222-2222-2222-222222222222",
    });
  });

  it("never lets a notification-scheduling rejection change the successful result", async () => {
    const dependencies = buildDependencies({
      scheduleNotification: vi.fn().mockImplementation(() => {
        throw new Error("resend unavailable");
      }),
    });

    const result = await processContactSubmission(buildFormData(), facts, dependencies);

    expect(result).toEqual({ status: "success", message: "Message saved.", fieldErrors: {} });
  });
});
