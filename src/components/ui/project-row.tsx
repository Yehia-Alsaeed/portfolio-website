import type { Route } from "next";
import Link from "next/link";

export type ProjectRowProps = { index: string; name: string; category: string; year: string; href: Route };

export function ProjectRow({ category, href, index, name, year }: ProjectRowProps) {
  return (
    <Link
      className="group grid min-h-11 grid-cols-[44px_1fr_24px] items-baseline gap-[18px] border-b border-line px-1 py-5 no-underline transition-colors hover:bg-ink hover:text-paper min-[821px]:grid-cols-[64px_1.5fr_1fr_120px_28px]"
      href={href}
    >
      <span aria-hidden="true" className="font-mono text-xs text-dim group-hover:text-paper/70">
        {index}
      </span>
      <span className="text-[clamp(1.25rem,2.6vw,2rem)] font-[680] font-stretch-[105%] leading-tight">
        {name}
      </span>
      <span
        aria-hidden="true"
        className="hidden font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-dim group-hover:text-paper/70 min-[821px]:block"
      >
        {category}
      </span>
      <span
        aria-hidden="true"
        className="hidden text-right font-mono text-xs text-dim group-hover:text-paper/70 min-[821px]:block"
      >
        {year}
      </span>
      <span className="sr-only">
        {category}, {year}
      </span>
      <span
        aria-hidden="true"
        className="-translate-x-1.5 opacity-0 transition-all group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100"
      >
        →
      </span>
    </Link>
  );
}
