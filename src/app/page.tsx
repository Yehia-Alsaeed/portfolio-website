import type { Metadata } from "next";

import { ContactSection } from "@/features/home/contact-section";
import { EvidenceStats } from "@/features/home/evidence-stats";
import { ExperienceSection } from "@/features/home/experience-section";
import { FeaturedWork } from "@/features/home/featured-work";
import { MonogramHero } from "@/features/home/monogram-hero";
import { PositioningSection } from "@/features/home/positioning-section";
import { ServicesTeaser } from "@/features/home/services-teaser";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  description:
    "Yehia Alsaeed is an AI/ML engineer and web developer building machine-learning systems, full-stack products, and Shopify experiences.",
  title: "Yehia Alsaeed | AI/ML Engineer and Web Developer",
};

export default function HomePage() {
  return (
    <>
      <MonogramHero />
      <PositioningSection />
      <EvidenceStats />
      <FeaturedWork />
      <ExperienceSection />
      <ServicesTeaser />
      <ContactSection />
    </>
  );
}
