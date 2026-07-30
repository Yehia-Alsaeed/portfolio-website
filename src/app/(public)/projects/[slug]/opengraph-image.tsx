import { CASE_STUDIES } from "@/content/projects/case-studies";
import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE, renderOgImage } from "@/lib/og/render-og-image";

type CaseStudyRouteParams = { slug: string };

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Case study | Yehia Alsaeed";

export function generateStaticParams(): CaseStudyRouteParams[] {
  return CASE_STUDIES.map((study) => ({ slug: study.slug }));
}

// Mirrors the route's own page.tsx: only the five generated slugs render an
// image, any other slug 404s instead of rendering a generic fallback image.
export const dynamicParams = false;

export default async function Image({ params }: { params: Promise<CaseStudyRouteParams> }) {
  const { slug } = await params;
  const study = CASE_STUDIES.find((candidate) => candidate.slug === slug);
  if (!study) return renderOgImage({ eyebrow: "Case study", title: "Not found" });

  return renderOgImage({
    eyebrow: study.type,
    subtitle: study.summary,
    title: study.title,
  });
}
