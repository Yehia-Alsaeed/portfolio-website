import { describe, expect, it } from "vitest";

import { PROFILE } from "@/content/profile";
import { SERVICE_OFFERS } from "@/content/services";
import { buildServicesJsonLd } from "@/lib/seo/services-json-ld";

describe("buildServicesJsonLd", () => {
  it("emits an OfferCatalog with exactly the two published offers", () => {
    const result = buildServicesJsonLd();

    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("OfferCatalog");
    expect(result.url).toBe("http://localhost:3000/services");
    expect(result.itemListElement).toHaveLength(SERVICE_OFFERS.length);

    result.itemListElement.forEach((entry, index) => {
      expect(entry["@type"]).toBe("Offer");
      expect(entry.itemOffered["@type"]).toBe("Service");
      expect(entry.itemOffered.name).toBe(SERVICE_OFFERS[index]?.title);
      expect(entry.itemOffered.description).toBe(SERVICE_OFFERS[index]?.summary);
      expect(entry.itemOffered.provider).toEqual({
        "@type": "Person",
        email: PROFILE.email,
        name: PROFILE.name,
        url: "http://localhost:3000/",
      });
    });
  });

  it("never includes a price, rating, or availability claim", () => {
    const result = buildServicesJsonLd();
    const json = JSON.stringify(result);

    for (const forbidden of ["price", "aggregateRating", "availability", "priceRange"]) {
      expect(json.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });
});
