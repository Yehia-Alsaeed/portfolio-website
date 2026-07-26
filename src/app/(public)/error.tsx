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
    <div className="border-line border-b-2 pt-12 pb-12" role="alert">
      <p className="text-accent-text mb-4 font-mono text-[0.6875rem] font-bold tracking-[0.14em] uppercase">
        Error
      </p>
      <h1 className="text-[clamp(2rem,5vw,3.5rem)] leading-[0.98] font-black font-stretch-[115%]">
        Something went wrong
      </h1>
      <p className="text-dim mt-4 max-w-[52ch] font-mono text-xs tracking-[0.08em] uppercase">
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
