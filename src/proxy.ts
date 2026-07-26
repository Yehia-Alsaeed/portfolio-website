import type { NextRequest } from "next/server";

import { protectAdminRequest } from "@/features/admin/auth/server";

export function proxy(request: NextRequest) {
  return protectAdminRequest(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
