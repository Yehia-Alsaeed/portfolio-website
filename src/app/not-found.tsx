import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="border-b-2 border-line pb-12 pt-12">
      <h1 className="text-[clamp(6rem,22vw,17.5rem)] font-black font-stretch-[125%] leading-[0.78] tracking-normal">
        4<span className="text-accent">0</span>4
      </h1>
      <p className="mt-6 font-mono text-xs uppercase tracking-[0.1em] text-dim">Page not found</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/projects">Projects</Link>
        </Button>
      </div>
    </div>
  );
}
