import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { TrackedAnchor } from "@/features/analytics/tracked-anchor";
import { isProjectSlug } from "@/features/analytics/validation";
import { getCategoryLabel, type Project } from "@/features/projects/model";
import { cn } from "@/lib/utils";

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
    outcome,
    repoUrl,
    slug,
    stack,
  } = project;

  const tracked = isProjectSlug(slug);

  return (
    <article
      className={cn(
        // Flagships are marked by an accent top edge alone. A full accent
        // frame on all five at once flooded a wide grid with blue; the top
        // edge still reads at a glance without competing with the content.
        "border-line flex flex-col gap-3 border p-5",
        isFlagship && "border-t-accent border-t-[6px]",
      )}
      data-category={category}
      data-flagship={isFlagship}
    >
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

      {/* The headline fact, given its own block rather than buried in the
          sentence above - it is the thing a reader should take away if they
          read nothing else on the card. `mt-auto` pins it to the bottom so it
          lines up across a row of uneven descriptions. */}
      <div className="border-line mt-auto border-t pt-3">
        <p
          className={cn(
            "text-[1.375rem] leading-none font-black font-stretch-[105%]",
            isFlagship ? "text-accent-text" : "text-ink",
          )}
        >
          {outcome.value}
        </p>
        <p className="text-dim mt-1 font-mono text-[0.6875rem] tracking-[0.06em] uppercase">
          {outcome.label}
        </p>
      </div>

      {stack.length > 0 ? (
        <p className="text-dim font-mono text-[0.6875rem] tracking-[0.06em]">{stack.join(" · ")}</p>
      ) : null}

      {/* Three fixed slots rather than a flowing row: the case study sits
          left, a live deployment is centred, and the repository link always
          lands bottom-right so it is in the same place on all seventeen
          cards. The outer columns are equal fractions, so the middle slot is
          genuinely centred rather than wherever the flow left it. */}
      <div className="border-line grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-t pt-3 font-mono text-[0.6875rem] tracking-[0.08em] uppercase">
        <div className="justify-self-start">
          {isFlagship ? (
            <Link
              aria-label={`Read the ${name} case study`}
              className={`${actionClassName} text-accent-text`}
              href={`/projects/${slug}`}
            >
              Case study →
            </Link>
          ) : null}
        </div>

        <div className="justify-self-center">
          {liveUrl && tracked ? (
            <TrackedAnchor
              aria-label={`Open the ${name} live site`}
              className={actionClassName}
              href={liveUrl}
              rel="noopener noreferrer"
              target="_blank"
              tracking={{ type: "project_click", projectSlug: slug, destination: "live-demo" }}
            >
              Live <ExternalLink aria-hidden="true" className="size-3" />
            </TrackedAnchor>
          ) : liveUrl ? (
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

        {/* Every card reaches the code, flagships included - they previously
            offered only the case study, which left the strongest five with no
            route to the source. */}
        <div className="justify-self-end">
          {tracked ? (
            <TrackedAnchor
              aria-label={`View ${name} on GitHub`}
              className={actionClassName}
              href={repoUrl}
              rel="noopener noreferrer"
              target="_blank"
              tracking={{ type: "project_click", projectSlug: slug, destination: "github" }}
            >
              GitHub <ExternalLink aria-hidden="true" className="size-3" />
            </TrackedAnchor>
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
        </div>
      </div>
    </article>
  );
}
