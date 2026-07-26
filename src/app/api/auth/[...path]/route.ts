import type { NextRequest } from "next/server";

import { auth, blockSignupResponse, isBlockedAuthPath } from "@/features/admin/auth/server";

export const dynamic = "force-dynamic";

type AuthRouteContext = { params: Promise<{ path: string[] }> };

function guardAuthRoute(
  request: NextRequest,
  context: AuthRouteContext,
  handler: (request: Request, context: AuthRouteContext) => Promise<Response>,
) {
  if (isBlockedAuthPath(request.nextUrl.pathname)) return blockSignupResponse();

  return handler(request, context);
}

export async function GET(request: NextRequest, context: AuthRouteContext) {
  const authHandlers = await auth.handler();
  return guardAuthRoute(request, context, authHandlers.GET);
}

export async function POST(request: NextRequest, context: AuthRouteContext) {
  const authHandlers = await auth.handler();
  return guardAuthRoute(request, context, authHandlers.POST);
}
