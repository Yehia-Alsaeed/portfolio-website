"use client";

import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="border-b-2 border-line pb-12 pt-12" role="alert">
      <p className="mb-4 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-accent">
        Error
      </p>
      <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black font-stretch-[115%] leading-[0.98]">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-[52ch] font-mono text-xs uppercase tracking-[0.08em] text-dim">
        The page failed to render. Try again, or return to the homepage.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
