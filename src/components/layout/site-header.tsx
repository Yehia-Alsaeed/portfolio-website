import Link from "next/link";

import { CommandPalette } from "@/features/command-palette/command-palette";

const NAVIGATION_LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/#contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 border-b-2 border-line py-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.08em]">
      <Link
        aria-label="Yehia Alsaeed home"
        className="inline-flex min-h-11 items-center font-sans text-[1.625rem] font-black normal-case tracking-normal no-underline font-stretch-[125%]"
        href="/"
      >
        YA<span className="text-accent">.</span>
      </Link>
      <div className="flex flex-wrap items-center gap-x-4 max-[767px]:w-full max-[767px]:justify-between">
        <nav aria-label="Primary">
          <ul className="flex list-none flex-wrap items-center gap-x-4 p-0">
            {NAVIGATION_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  className="inline-flex min-h-11 items-center text-dim no-underline transition-colors hover:text-ink focus-visible:text-ink"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <CommandPalette />
      </div>
    </header>
  );
}
