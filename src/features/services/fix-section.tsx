import Link from "next/link";

import { Button } from "@/components/ui/button";
import { RuledSection } from "@/components/ui/ruled-section";
import type { FixSectionContent } from "@/content/services";

export type FixSectionProps = { content: FixSectionContent };

function renderAccentedHeadline(headline: string, accent: string) {
  const start = headline.indexOf(accent);
  if (start === -1) {
    return headline;
  }
  return (
    <>
      {headline.slice(0, start)}
      <span className="text-accent-text">{accent}</span>
      {headline.slice(start + accent.length)}
    </>
  );
}

/**
 * The way in for owners who already have a site: a headline, a short lead,
 * the four problems they recognise in their own site, and one button. The
 * problem grid reuses the process grid's rules so the section reads as part
 * of the same page, not a bolted-on banner.
 *
 * The grid is two across on phones (01 02 / 03 04) and four across from
 * 1024px; there is no single-column state. The closing line and button sit in
 * a ruled band directly under the grid so they read as its last row, not as
 * loose text floating below it.
 */
export function FixSection({ content }: FixSectionProps) {
  return (
    <RuledSection id="fix" meta={content.meta} title={content.title}>
      <h3 className="text-[clamp(2rem,5.5vw,4.5rem)] leading-[1.02] font-extrabold tracking-tight font-stretch-[110%]">
        {renderAccentedHeadline(content.headline, content.accent)}
      </h3>
      <p className="text-dim mt-5 max-w-[60ch] text-[0.9375rem] leading-relaxed min-[1024px]:max-w-[50%]">
        {content.lead}
      </p>

      <ol className="border-line mt-8 grid grid-cols-2 border-t border-l min-[1024px]:grid-cols-4">
        {content.problems.map((problem, position) => (
          <li className="border-line border-r border-b p-4 min-[560px]:p-6" key={problem.title}>
            <p className="text-accent-text font-mono text-[0.625rem] font-bold tracking-[0.14em] uppercase">
              {String(position + 1).padStart(2, "0")}
            </p>
            <h4 className="mt-2 text-base font-bold min-[560px]:text-lg">{problem.title}</h4>
            <p className="text-dim mt-2 text-[0.8125rem] leading-relaxed min-[560px]:text-sm">
              {problem.body}
            </p>
          </li>
        ))}
      </ol>

      <div className="border-line bg-soft flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-r border-b border-l p-4 min-[560px]:px-6 min-[560px]:py-5">
        {/* `text-balance` splits the sentence into two even lines instead of
            leaving the last couple of words orphaned on their own line. */}
        <p className="max-w-[52ch] min-w-0 flex-1 basis-[16rem] text-[0.9375rem] leading-relaxed text-balance">
          {content.ctaLead}
        </p>
        {/* Full-width and centred on phones, where the button drops under the
            line; back to its own width on the right from 560px. */}
        <div className="flex w-full justify-center min-[560px]:w-auto">
          <Button asChild variant="primary">
            <Link href={content.cta.href}>{content.cta.label}</Link>
          </Button>
        </div>
      </div>
    </RuledSection>
  );
}
