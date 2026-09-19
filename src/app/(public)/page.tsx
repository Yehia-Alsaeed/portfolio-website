import type { Metadata } from "next";

import { ClientWorkSection } from "@/features/home/client-work-section";
import { ContactSection } from "@/features/home/contact-section";
import { ExperienceSection } from "@/features/home/experience-section";
import { FeaturedWork } from "@/features/home/featured-work";
import { MonogramHero } from "@/features/home/monogram-hero";
import { PositioningSection } from "@/features/home/positioning-section";
import { ServicesTeaser } from "@/features/home/services-teaser";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildPersonJsonLd } from "@/lib/seo/person-json-ld";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  description:
    "Yehia Alsaeed is a freelance web developer in Egypt building Shopify stores and custom websites that bring businesses more customers. Also an AI/ML engineer. Based in Cairo, working with clients anywhere.",
  title: "Yehia Alsaeed | Freelance Web Developer in Egypt",
};

/**
 * Client-first order: statement, proof, offer, then the recruiter half (AI
 * projects, experience, skills). HOME_SECTION_ORDER in content/homepage.ts
 * mirrors this and the homepage e2e spec asserts it.
 */
export default function HomePage() {
  return (
    <>
      <JsonLd data={buildPersonJsonLd()} />
      <MonogramHero />
      <PositioningSection />
      <ClientWorkSection />
      <ServicesTeaser />
      <FeaturedWork />
      <ExperienceSection />
      <ContactSection />
    </>
  );
}
