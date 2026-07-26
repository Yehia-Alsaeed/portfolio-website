"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Route } from "next";

import { consumeRateLimit } from "@/db/queries/rate-limit";
import { classifyRequest } from "@/features/analytics/request-facts";
import { createRateLimitKey } from "@/features/analytics/privacy";
import { readAdminUserId, readAnalyticsSalt } from "@/lib/env/server";

import type { LoginState } from "./model";
import { auth } from "./server";
import { authenticateAdminLogin } from "./login";

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const requestHeaders = await headers();
  const facts = classifyRequest(requestHeaders);
  const salt = readAnalyticsSalt();

  const result = await authenticateAdminLogin(formData, {
    now: () => new Date(),
    rateLimitKey: () => createRateLimitKey(facts, salt),
    consume: consumeRateLimit,
    signInEmail: (input) => auth.signIn.email(input),
    signOut: () => auth.signOut(),
    readAdminUserId,
  });

  if (result.status === "idle") redirect("/admin" as Route);

  return result;
}

export async function logoutAction(): Promise<never> {
  await auth.signOut();
  redirect("/admin/login?reason=signed-out");
}
