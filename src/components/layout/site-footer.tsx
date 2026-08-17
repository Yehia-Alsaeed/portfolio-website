import { TrackedAnchor } from "@/features/analytics/tracked-anchor";

export function SiteFooter() {
  return (
    <footer className="border-line mt-14 border-t-2 pt-4 pb-8 font-mono text-[0.6875rem] tracking-[0.08em] uppercase">
      {/* Two groups instead of three (the CV link is gone), so `justify-between`
          now centres the profile links on one row from 640px up. Below that the
          same rule left the links shoved flush-right beside the email with the
          copyright orphaned underneath, so phones stack left-aligned instead.
          640px is the site's existing mobile breakpoint (globals.css). */}
      <div className="flex flex-col items-start gap-x-6 gap-y-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <a
          className="text-ink hover:text-accent-text inline-flex min-h-11 items-center normal-case no-underline transition-colors"
          href="mailto:yehias3eed11@gmail.com"
        >
          yehias3eed11@gmail.com
        </a>
        <ul className="flex list-none flex-wrap items-center gap-x-5 p-0">
          <li>
            <TrackedAnchor
              className="text-dim hover:text-ink inline-flex min-h-11 items-center no-underline transition-colors"
              href="https://github.com/Yehia-Alsaeed"
              rel="noopener noreferrer"
              target="_blank"
              tracking={{ type: "outbound_click", destination: "github-profile" }}
            >
              GitHub
            </TrackedAnchor>
          </li>
          <li>
            <TrackedAnchor
              className="text-dim hover:text-ink inline-flex min-h-11 items-center no-underline transition-colors"
              href="https://www.linkedin.com/in/yehia-alsaeed"
              rel="noopener noreferrer"
              target="_blank"
              tracking={{ type: "outbound_click", destination: "linkedin" }}
            >
              LinkedIn
            </TrackedAnchor>
          </li>
        </ul>
        <p className="text-dim inline-flex min-h-11 items-center">2026 - Yehia Alsaeed</p>
      </div>
    </footer>
  );
}
