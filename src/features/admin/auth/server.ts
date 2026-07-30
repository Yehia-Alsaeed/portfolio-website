import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { readNeonAuthBaseUrl, readNeonAuthCookieSecret } from "@/lib/env/server";

import type { AuthSessionResult, AuthSignInResult } from "./model";

export const AUTH_SIGNUP_BLOCK_STATUS = 404;

// Every prefix here was confirmed against the installed
// @neondatabase/auth package's own route surface (its type declarations
// enumerate every path the underlying handler can proxy to Neon Auth), not
// guessed - see docs/implementation/phase-8-report.md Stage 5 for the audit
// that found sign-up/social/magic-link/email-otp/organization already
// covered, but token/anonymous (creates an unauthenticated session/account
// without going through the blocked sign-up flow), the entire admin/*
// plugin namespace (a different, more dangerous RBAC surface than this
// app's own ADMIN_USER_ID check - includes impersonate-user), and the
// email-otp/* and magic-link/* sub-paths (distinct prefixes from the
// already-blocked sign-in/email-otp and sign-in/magic-link entry points)
// were not.
const BLOCKED_AUTH_PREFIXES = [
  "/api/auth/sign-up",
  "/api/auth/sign-up/email",
  "/api/auth/sign-in/social",
  "/api/auth/sign-in/magic-link",
  "/api/auth/sign-in/email-otp",
  "/api/auth/magic-link",
  "/api/auth/email-otp",
  "/api/auth/token/anonymous",
  "/api/auth/admin",
  "/api/auth/request-password-reset",
  "/api/auth/reset-password",
  "/api/auth/organization",
];

type NeonAuthInstance = {
  getSession: () => Promise<AuthSessionResult>;
  signIn: {
    email: (input: { email: string; password: string }) => Promise<AuthSignInResult>;
  };
  signOut: () => Promise<unknown>;
  handler: () => {
    GET: (request: Request, context: { params: Promise<{ path: string[] }> }) => Promise<Response>;
    POST: (request: Request, context: { params: Promise<{ path: string[] }> }) => Promise<Response>;
  };
  middleware: (config: {
    loginUrl: string;
  }) => (request: NextRequest) => NextResponse | Promise<NextResponse>;
};

let authInstance: Promise<NeonAuthInstance> | undefined;

async function getAuth(): Promise<NeonAuthInstance> {
  authInstance ??= import("@neondatabase/auth/next/server").then(
    ({ createNeonAuth }) =>
      createNeonAuth({
        baseUrl: readNeonAuthBaseUrl(),
        cookies: { secret: readNeonAuthCookieSecret() },
        logLevel: "silent",
      }) as unknown as NeonAuthInstance,
  );

  return authInstance;
}

export const auth = {
  getSession: async () => (await getAuth()).getSession(),
  signIn: {
    email: async (input: { email: string; password: string }) =>
      (await getAuth()).signIn.email(input),
  },
  signOut: async () => (await getAuth()).signOut(),
  handler: async () => (await getAuth()).handler(),
};

export function isBlockedAuthPath(pathname: string): boolean {
  return BLOCKED_AUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function blockSignupResponse(): NextResponse {
  return NextResponse.json({ error: "Not found" }, { status: AUTH_SIGNUP_BLOCK_STATUS });
}

export function isAnonymousAdminPath(pathname: string): boolean {
  return pathname === "/admin/login";
}

export function isProtectedAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin" || (pathname.startsWith("/admin/") && !isAnonymousAdminPath(pathname))
  );
}

export async function protectAdminRequest(request: NextRequest): Promise<NextResponse> {
  if (isAnonymousAdminPath(request.nextUrl.pathname)) return NextResponse.next();

  return (await getAuth()).middleware({ loginUrl: "/admin/login" })(request);
}
