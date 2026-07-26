import type { ReactNode } from "react";

import { AdminShell } from "@/features/admin/admin-shell";
import { requireAdmin } from "@/features/admin/auth/authorize";

export const dynamic = "force-dynamic";

export default async function PrivateAdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  await requireAdmin();

  return <AdminShell>{children}</AdminShell>;
}
