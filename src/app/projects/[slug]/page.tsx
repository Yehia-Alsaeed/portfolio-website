import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CASE_STUDIES } from "@/content/projects/case-studies";
import { CaseStudyPage } from "@/features/case-study/case-study-page";

type CaseStudyRouteParams = { slug: string };
type CaseStudyRouteProps = { params: Promise<CaseStudyRouteParams> };

export function generateStaticParams(): CaseStudyRouteParams[] {
  return CASE_STUDIES.map((study) => ({ slug: study.slug }));
}

// Serves a real 404 status for any slug outside the five generated above,
// resolved at the routing layer before the page component runs. Without
// this, notFound() called after `await params` cannot retroactively change
// a response that has already started streaming with a 200 status.
export const dynamicParams = false;

function findStudy(slug: string) {
  return CASE_STUDIES.find((study) => study.slug === slug);
}

export async function generateMetadata({ params }: CaseStudyRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const study = findStudy(slug);
  if (!study) return {};

  const canonical = `/projects/${study.slug}`;

  return {
    alternates: { canonical },
    description: study.summary,
    openGraph: {
      description: study.summary,
      title: study.title,
      type: "article",
      url: canonical,
    },
    title: `${study.title} | Yehia Alsaeed`,
  };
}

export default async function ProjectCaseStudyPage({ params }: CaseStudyRouteProps) {
  const { slug } = await params;
  const study = findStudy(slug);
  if (!study) notFound();

  const previous = findStudy(study.previousSlug);
  const next = findStudy(study.nextSlug);
  if (!previous || !next) notFound();

  return <CaseStudyPage next={next} previous={previous} study={study} />;
}
