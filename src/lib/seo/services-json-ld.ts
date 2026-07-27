import { PROFILE } from "@/content/profile";
import { SERVICE_OFFERS } from "@/content/services";
import { publicEnv } from "@/lib/env/public";

/**
 * Sourced only from SERVICE_OFFERS and PROFILE - the two published offers
 * and existing contact/provider facts, per the Phase 8 design. No pricing,
 * rating, or availability claim beyond what the page itself already states.
 */
export function buildServicesJsonLd() {
  const origin = publicEnv.siteUrl.origin;
  const provider = {
    "@type": "Person",
    email: PROFILE.email,
    name: PROFILE.name,
    url: `${origin}/`,
  } as const;

  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    itemListElement: SERVICE_OFFERS.map((offer) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        description: offer.summary,
        name: offer.title,
        provider,
      },
    })),
    name: `${PROFILE.name} services`,
    url: `${origin}/services`,
  } as const;
}
