import type { Metadata } from "next";

import { readContactPage } from "@/db/queries/admin-contact";
import { AdminShell } from "@/features/admin/admin-shell";
import { Inbox } from "@/features/admin/inbox/inbox";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Inbox | Yehia Alsaeed",
};

export default async function AdminInboxPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ cursor?: string | string[] }>;
}>) {
  const params = await searchParams;
  const page = await readContactPage(params.cursor ? { cursor: params.cursor } : {});

  return (
    <AdminShell active="inbox" unreadCount={page.unreadCount}>
      <Inbox page={page} />
    </AdminShell>
  );
}
