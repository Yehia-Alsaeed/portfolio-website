import type { Metadata } from "next";

import { ServicesPage } from "@/features/services/services-page";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildServicesJsonLd } from "@/lib/seo/services-json-ld";

export const metadata: Metadata = {
  alternates: { canonical: "/services" },
  description:
    "Freelance web developer in Egypt building Shopify stores and custom websites that bring in more orders and new clients. Yehia Alsaeed, Cairo.",
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
