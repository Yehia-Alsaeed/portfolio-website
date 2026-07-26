import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="border-line border-b-2 pt-12 pb-12">
      <h1 className="text-[clamp(6rem,22vw,17.5rem)] leading-[0.78] font-black tracking-normal font-stretch-[125%]">
        4<span className="text-accent-text">0</span>4
      </h1>
      <p className="text-dim mt-6 font-mono text-xs tracking-[0.1em] uppercase">Page not found</p>
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
