import type { Metadata } from "next";

import { readAdminOverview } from "@/db/queries/admin-analytics";
import { AdminShell } from "@/features/admin/admin-shell";
import { AdminDashboard } from "@/features/admin/analytics/dashboard";
import { parseAdminRange } from "@/features/admin/analytics/ranges";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Overview | Yehia Alsaeed",
};

export default async function AdminOverviewPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ range?: string | string[] }>;
}>) {
  const params = await searchParams;
  const range = parseAdminRange(params.range);
  const overview = await readAdminOverview({ range });

  return (
    <AdminShell active="overview">
      <AdminDashboard overview={overview} />
    </AdminShell>
  );
}
