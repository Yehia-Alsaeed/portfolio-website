import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { getCategoryLabel, type Project } from "@/features/projects/model";

export type ProjectCardProps = { project: Project };

const actionClassName =
  "inline-flex min-h-11 items-center gap-1 font-bold no-underline hover:underline focus-visible:underline";

export function ProjectCard({ project }: ProjectCardProps) {
  const {
    category,
    description,
    isFlagship,
    language,
    liveUrl,
    name,
    repoUrl,
    slug,
    stars,
    topics,
  } = project;

  return (
    <article className="border-line flex flex-col gap-4 border p-5" data-category={category}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 font-mono text-[0.6875rem] tracking-[0.08em] uppercase">
        <span className="text-dim">
          {getCategoryLabel(category)}
          {language ? ` · ${language}` : ""}
        </span>
        {isFlagship ? <span className="text-accent-text font-bold">★ Flagship</span> : null}
      </div>

      <h3 className="text-[clamp(1.25rem,2.2vw,1.625rem)] leading-tight font-[680] font-stretch-[105%]">
        {name}
      </h3>

      <p className="text-dim text-sm leading-relaxed">{description}</p>

      {topics.length > 0 ? (
        <p className="text-dim mt-auto font-mono text-[0.6875rem] tracking-[0.06em]">
          {topics.join(" · ")}
        </p>
      ) : null}

      <div className="border-line flex flex-wrap items-center justify-between gap-3 border-t pt-4 font-mono text-[0.6875rem] tracking-[0.08em] uppercase">
        <span aria-label={`${stars} GitHub stars`} className="text-dim">
          ★ {stars}
        </span>
        <div className="flex flex-wrap items-center gap-4">
          {isFlagship ? (
            <Link
              aria-label={`Read the ${name} case study`}
              className={`${actionClassName} text-accent-text`}
              href={`/projects/${slug}`}
            >
              Case study →
            </Link>
          ) : (
            <a
              aria-label={`View ${name} on GitHub`}
              className={actionClassName}
              href={repoUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub <ExternalLink aria-hidden="true" className="size-3" />
            </a>
          )}
          {liveUrl ? (
            <a
              aria-label={`Open the ${name} live site`}
              className={actionClassName}
              href={liveUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Live <ExternalLink aria-hidden="true" className="size-3" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
