import type { Metadata } from "next";

import { ServicesPage } from "@/features/services/services-page";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildServicesJsonLd } from "@/lib/seo/services-json-ld";

export const metadata: Metadata = {
  alternates: { canonical: "/services" },
  description:
    "Shopify store builds, full-stack web development, and applied AI services by Yehia Alsaeed. Available for select freelance projects.",
  title: "Services | Yehia Alsaeed",
};

export default function Page() {
  return (
    <>
      <JsonLd data={buildServicesJsonLd()} />
      <ServicesPage />
    </>
  );
}
