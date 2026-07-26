import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RequestFacts } from "@/features/analytics/model";
import { handleTrackRequest } from "@/features/analytics/track-request";
import type { ContactDependencies } from "@/features/contact/model";
import { processContactSubmission } from "@/features/contact/submit-contact";

const facts: RequestFacts = {
  address: "203.0.113.5",
  browser: "chrome",
  country: "US",
  device: "desktop",
  isBot: false,
  os: "windows",
  userAgent: "Mozilla/5.0 test-agent",
};

function buildTrackRequest(): Request {
  return new Request("https://example.com/api/track", {
    body: JSON.stringify({ type: "page_view", path: "/", referrer: "", screen: "large" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

function buildContactForm(): FormData {
  const formData = new FormData();
  formData.set("inquiryType", "Freelance project");
  formData.set("name", "Ada Lovelace");
  formData.set("email", "ada@example.com");
  formData.set("message", "Hello");
  formData.set("website", "");
  return formData;
}

function buildContactDependencies(overrides: Partial<ContactDependencies> = {}): ContactDependencies {
  return {
    now: () => new Date("2026-07-26T12:00:00Z"),
    consume: vi.fn().mockResolvedValue({ allowed: true, count: 1, retryAfterSeconds: 0 }),
    save: vi.fn().mockResolvedValue({ id: "2d6c56f8-11e9-4d88-b98a-57d8d01cf8f3" }),
    scheduleNotification: vi.fn(),
    isAdminSession: vi.fn().mockResolvedValue(false),
    ...overrides,
  };
}

beforeEach(() => {
  process.env.ANALYTICS_HASH_SALT = "unit-test-salt";
});

describe("Phase 7 admin analytics self-exclusion", () => {
  it("returns the same safe 202 for an admin tracking request without rate-limit or insert", async () => {
    const dependencies = {
      now: () => new Date("2026-07-26T12:00:00Z"),
      consume: vi.fn(),
      insert: vi.fn(),
      isAdminSession: vi.fn().mockResolvedValue(true),
    };

    const response = await handleTrackRequest(buildTrackRequest(), dependencies);

    expect(response.status).toBe(202);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(dependencies.consume).not.toHaveBeenCalled();
    expect(dependencies.insert).not.toHaveBeenCalled();
  });

  it("keeps anonymous tracking behavior unchanged", async () => {
    const dependencies = {
      now: () => new Date("2026-07-26T12:00:00Z"),
      consume: vi.fn().mockResolvedValue({ allowed: true, count: 1, retryAfterSeconds: 0 }),
      insert: vi.fn().mockResolvedValue(undefined),
      isAdminSession: vi.fn().mockResolvedValue(false),
    };

    const response = await handleTrackRequest(buildTrackRequest(), dependencies);

    expect(response.status).toBe(202);
    expect(dependencies.consume).toHaveBeenCalledTimes(1);
    expect(dependencies.insert).toHaveBeenCalledTimes(1);
  });

  it("persists admin contact messages but omits the contact_submit analytics event", async () => {
    const dependencies = buildContactDependencies({
      isAdminSession: vi.fn().mockResolvedValue(true),
    });

    const result = await processContactSubmission(buildContactForm(), facts, dependencies);

    expect(result.status).toBe("success");
    expect(dependencies.save).toHaveBeenCalledWith({
      contact: {
        inquiryType: "Freelance project",
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "Hello",
      },
    });
  });

  it("keeps anonymous contact persistence atomic with analytics event", async () => {
    const dependencies = buildContactDependencies();

    await processContactSubmission(buildContactForm(), facts, dependencies);

    expect(dependencies.save).toHaveBeenCalledWith({
      contact: expect.any(Object),
      event: expect.objectContaining({ type: "contact_submit" }),
    });
  });
});
