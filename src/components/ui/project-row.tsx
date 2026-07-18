import type { Route } from "next";
import Link from "next/link";

export type ProjectRowProps = {
  index: string;
  name: string;
  category: string;
  year: string;
  href: Route;
};

export function ProjectRow({ category, href, index, name, year }: ProjectRowProps) {
  return (
    <Link
      className="group border-line hover:bg-ink hover:text-paper grid min-h-11 grid-cols-[44px_1fr_24px] items-baseline gap-[18px] border-b px-1 py-5 no-underline transition-colors min-[821px]:grid-cols-[64px_1.5fr_1fr_120px_28px]"
      href={href}
    >
      <span aria-hidden="true" className="text-dim group-hover:text-paper/70 font-mono text-xs">
        {index}
      </span>
      <span className="text-[clamp(1.25rem,2.6vw,2rem)] leading-tight font-[680] font-stretch-[105%]">
        {name}
      </span>
      <span
        aria-hidden="true"
        className="text-dim group-hover:text-paper/70 hidden font-mono text-[0.6875rem] tracking-[0.08em] uppercase min-[821px]:block"
      >
        {category}
      </span>
      <span
        aria-hidden="true"
        className="text-dim group-hover:text-paper/70 hidden text-right font-mono text-xs min-[821px]:block"
      >
        {year}
      </span>
      <span className="sr-only">
        {category}, {year}
      </span>
      <span
        aria-hidden="true"
        className="group-hover:text-accent-text -translate-x-1.5 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
      >
        →
      </span>
    </Link>
  );
}
