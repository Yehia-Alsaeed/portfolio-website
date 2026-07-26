import type { Metadata } from "next";

import { LoginForm } from "@/features/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
    nocache: true,
  },
  title: "Admin Login | Yehia Alsaeed",
};

function messageForReason(reason: string | string[] | undefined): string {
  if (reason === "expired") return "Your admin session expired. Sign in again.";
  if (reason === "unauthorized") return "That account cannot access the admin area.";
  if (reason === "signed-out") return "You have been signed out.";
  return "";
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string | string[] }>;
}) {
  const params = await searchParams;
  const reasonMessage = messageForReason(params.reason);

  return (
    <section className="site-frame grid min-h-[70svh] place-items-center py-16">
      <div className="grid w-full max-w-[440px] gap-8 border-2 border-line bg-paper p-6 sm:p-8">
        <header className="grid gap-2">
          <p className="font-mono text-xs font-bold tracking-[0.16em] text-dim uppercase">
            Private operations
          </p>
          <h1 className="text-3xl leading-none font-black tracking-normal text-ink">Admin login</h1>
        </header>
        {reasonMessage ? (
          <p className="border-2 border-line bg-soft p-4 font-mono text-sm text-dim" role="status">
            {reasonMessage}
          </p>
        ) : null}
        <LoginForm />
      </div>
    </section>
  );
}
