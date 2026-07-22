import Link from "next/link";

import { Button } from "@/components/ui/button";
import { MetadataRow, type MetadataItem } from "@/components/ui/metadata-row";
import { PageTitle } from "@/components/ui/page-title";
import { RuledSection } from "@/components/ui/ruled-section";
import { StatCell } from "@/components/ui/stat-cell";
import type { CaseStudy } from "@/content/projects/case-studies";
import { CaseStudyProof } from "@/features/case-study/proof/case-study-proof";
import { ProjectImage } from "@/features/media/project-image";

export type CaseStudyPageProps = {
  study: CaseStudy;
  previous: CaseStudy;
  next: CaseStudy;
};

const proseClassName = "text-dim max-w-[62ch] text-base leading-relaxed";
const listClassName = "text-dim mt-4 flex max-w-[62ch] flex-col gap-2 text-base leading-relaxed";

export function CaseStudyPage({ next, previous, study }: CaseStudyPageProps) {
  const metadataItems: MetadataItem[] = [
    { label: "Role", value: study.role },
    ...(study.period ? [{ label: "Period", value: study.period }] : []),
    { label: "Type", value: study.type },
    { label: "Stack", value: study.stack.join(" · ") },
  ];

  return (
    <>
      <PageTitle eyebrow={study.type} subtitle={study.summary} title={study.title} />
      <MetadataRow ariaLabel={`${study.title} details`} items={metadataItems} />

      <RuledSection title="01 - The problem">
        <p className={proseClassName}>{study.problem}</p>
        <h3 className="text-dim mt-6 font-mono text-[0.6875rem] font-bold tracking-[0.1em] uppercase">
          Constraints
        </h3>
        <ul className={listClassName}>
          {study.constraints.map((constraint) => (
            <li key={constraint}>{constraint}</li>
          ))}
        </ul>
      </RuledSection>

      <RuledSection title="02 - Approach">
        <p className={proseClassName}>{study.approach}</p>
      </RuledSection>

      <RuledSection title="03 - Architecture and stack">
        <p className={proseClassName}>{study.architecture}</p>
        <CaseStudyProof slug={study.slug} />
      </RuledSection>

      <RuledSection title="04 - Results">
        <div className="border-line grid grid-cols-1 border-t border-l min-[560px]:grid-cols-2 min-[900px]:grid-cols-4">
          {study.results.map((result) => (
            <div className="border-line border-r border-b" key={result.label}>
              <StatCell
                label={result.label}
                value={result.value}
                {...(result.detail ? { detail: result.detail } : {})}
              />
            </div>
          ))}
        </div>
      </RuledSection>

      <RuledSection title="05 - Limitations">
        <ul className={listClassName}>
          {study.limitations.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
      </RuledSection>

      <RuledSection title="06 - Reproducibility">
        <p className={proseClassName}>{study.reproducibility}</p>
      </RuledSection>

      {study.media.length > 0 ? (
        <RuledSection title="07 - Evidence">
          <div className="grid grid-cols-1 gap-4 min-[700px]:grid-cols-2">
            {study.media.map((media) => (
              <ProjectImage
                alt={media.alt}
                key={media.publicId}
                publicId={media.publicId}
                sizes="(min-width: 700px) 50vw, 100vw"
              />
            ))}
          </div>
        </RuledSection>
      ) : null}

      <RuledSection title="Links">
        <div className="flex flex-wrap gap-4">
          <Button asChild variant="outline">
            <a href={study.repoUrl} rel="noopener noreferrer" target="_blank">
              View on GitHub ↗
            </a>
          </Button>
          {study.liveUrl ? (
            <Button asChild variant="outline">
              <a href={study.liveUrl} rel="noopener noreferrer" target="_blank">
                Live site ↗
              </a>
            </Button>
          ) : null}
        </div>
      </RuledSection>

      <nav
        aria-label="Case study navigation"
        className="border-line flex flex-wrap items-center justify-between gap-4 border-t-2 py-8 font-mono text-xs tracking-[0.08em] uppercase"
      >
        <Link
          className="text-dim hover:text-ink inline-flex min-h-11 items-center no-underline transition-colors"
          href={`/projects/${previous.slug}`}
        >
          ← {previous.title}
        </Link>
        <Link
          className="text-dim hover:text-ink inline-flex min-h-11 items-center no-underline transition-colors"
          href="/projects"
        >
          All projects
        </Link>
        <Link
          className="text-dim hover:text-ink inline-flex min-h-11 items-center no-underline transition-colors"
          href={`/projects/${next.slug}`}
        >
          {next.title} →
        </Link>
      </nav>
    </>
  );
}
