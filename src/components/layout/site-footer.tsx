export function SiteFooter() {
  return (
    <footer
      className="mt-14 border-t-2 border-line pb-8 pt-4 font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
      id="contact"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <a
          className="inline-flex min-h-11 items-center normal-case text-ink no-underline transition-colors hover:text-accent"
          href="mailto:yehias3eed11@gmail.com"
        >
          yehias3eed11@gmail.com
        </a>
        <ul className="flex list-none flex-wrap items-center gap-x-5 p-0">
          <li>
            <a
              className="inline-flex min-h-11 items-center text-dim no-underline transition-colors hover:text-ink"
              href="https://github.com/Yehia-Alsaeed"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              className="inline-flex min-h-11 items-center text-dim no-underline transition-colors hover:text-ink"
              href="https://www.linkedin.com/in/yehia-alsaeed"
              rel="noopener noreferrer"
              target="_blank"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              className="inline-flex min-h-11 items-center text-dim no-underline transition-colors hover:text-ink"
              download
              href="/cv/Yehia_Alsaeed_CV_AI.pdf"
            >
              Download CV
            </a>
          </li>
        </ul>
        <p className="inline-flex min-h-11 items-center text-dim">2026 - Yehia Alsaeed</p>
      </div>
    </footer>
  );
}
