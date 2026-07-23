import { TrackedAnchor } from "@/features/analytics/tracked-anchor";

export function SiteFooter() {
  return (
    <footer className="border-line mt-14 border-t-2 pt-4 pb-8 font-mono text-[0.6875rem] tracking-[0.08em] uppercase">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
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
          <li>
            <TrackedAnchor
              className="text-dim hover:text-ink inline-flex min-h-11 items-center no-underline transition-colors"
              download
              href="/cv/Yehia_Alsaeed_CV_AI.pdf"
              tracking={{ type: "cv_download", placement: "footer" }}
            >
              Download CV
            </TrackedAnchor>
          </li>
        </ul>
        <p className="text-dim inline-flex min-h-11 items-center">2026 - Yehia Alsaeed</p>
      </div>
    </footer>
  );
}
