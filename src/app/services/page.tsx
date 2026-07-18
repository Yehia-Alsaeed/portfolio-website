import type { Metadata } from "next";

import { PageTitle } from "@/components/ui/page-title";
import { RuledSection } from "@/components/ui/ruled-section";

export const metadata: Metadata = {
  title: "Services | Yehia Alsaeed",
  description:
    "Shopify store builds, full-stack web development, and applied AI services by Yehia Alsaeed.",
};

export default function ServicesPage() {
  return (
    <>
      <PageTitle subtitle="Shopify, full-stack web, and applied AI development" title="Services" />
      <RuledSection title="Client services">
        <p className="text-dim max-w-[62ch] text-base leading-relaxed">
          Shopify store builds, full-stack web applications, and applied AI development for client
          projects. Reach out through the contact email to discuss scope.
        </p>
      </RuledSection>
    </>
  );
}
