import Link from "next/link";

import { archivoWide } from "@/app/fonts";
import { CommandPalette } from "@/features/command-palette/command-palette";

const NAVIGATION_LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/#contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-line flex flex-wrap items-center justify-between gap-x-4 border-b-2 py-2.5 font-mono text-[0.6875rem] tracking-[0.08em] uppercase">
      <Link
        aria-label="Yehia Alsaeed home"
        className={`${archivoWide.className} inline-flex min-h-11 items-center text-[1.625rem] font-black tracking-normal normal-case font-stretch-[125%] no-underline`}
        href="/"
      >
        YA<span className="text-accent-text">.</span>
      </Link>
      <div className="flex flex-wrap items-center gap-x-4 max-[767px]:w-full max-[767px]:justify-between">
        <nav aria-label="Primary">
          <ul className="flex list-none flex-wrap items-center gap-x-4 p-0">
            {NAVIGATION_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  className="text-dim hover:text-ink focus-visible:text-ink inline-flex min-h-11 items-center no-underline transition-colors"
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
