import { SKILL_GROUPS } from "@/content/homepage";
import { PROFILE } from "@/content/profile";
import { publicEnv } from "@/lib/env/public";

/**
 * Sourced only from PROFILE and SKILL_GROUPS - no employer, credential,
 * rating, award, image, or social account beyond GitHub/LinkedIn, per the
 * Phase 8 design (only evidence-backed facts already published elsewhere
 * on the site).
 */
export function buildPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    address: PROFILE.location,
    jobTitle: PROFILE.role,
    knowsAbout: SKILL_GROUPS.flatMap((group) => group.skills),
    name: PROFILE.name,
    sameAs: [PROFILE.githubUrl, PROFILE.linkedinUrl],
    url: `${publicEnv.siteUrl.origin}/`,
  } as const;
}
