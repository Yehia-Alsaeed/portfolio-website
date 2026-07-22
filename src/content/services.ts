export type ServiceOffer = {
  index: "01" | "02";
  label: string;
  title: string;
  summary: string;
  capabilities: readonly string[];
};

export type ProcessStep = {
  index: "01" | "02" | "03" | "04";
  title: "Discovery" | "Build" | "Verification" | "Launch and handover";
  summary: string;
};

type ClientWorkBase = {
  name: "Madar Wears" | "La Glosse" | "Nexo";
  kind: "Shopify storefront";
  contribution: string;
  url: `https://${string}`;
};

export type ClientWork = ClientWorkBase &
  (
    | { presentation: "captured"; mediaKey: "madar-wears" | "la-glosse" }
    | { presentation: "text-only" }
  );

export type Testimonial = { quote: string; attribution: string };

export const SERVICE_OFFERS = [
  {
    capabilities: [
      "Custom themes and sections",
      "Speed and SEO optimization",
      "Launch to first sale",
    ],
    index: "01",
    label: "Shopify",
    summary:
      "Complete Shopify builds with Liquid customization, checkout-ready layouts, and technical SEO baked in from brief through launch.",
    title: "Shopify stores, brief to first sale.",
  },
  {
    capabilities: ["React / Node / MongoDB", "LLM and CV integrations", "Admin panels and auth"],
    index: "02",
    label: "Web and AI",
    summary:
      "Full-stack platforms and applied-AI features designed, built, and deployed as complete products.",
    title: "Full-stack products, end to end.",
  },
] as const satisfies readonly ServiceOffer[];

export const SERVICE_PROCESS = [
  {
    index: "01",
    summary:
      "Establish audience, scope, constraints, budget range, deadline, and definition of done.",
    title: "Discovery",
  },
  {
    index: "02",
    summary: "Deliver visible increments through a staging environment.",
    title: "Build",
  },
  {
    index: "03",
    summary:
      "Test critical journeys, responsive behavior, accessibility, performance, and failure states.",
    title: "Verification",
  },
  {
    index: "04",
    summary: "Deploy, complete final QA, and hand over documentation and access.",
    title: "Launch and handover",
  },
] as const satisfies readonly ProcessStep[];

export const CLIENT_WORK = [
  {
    contribution:
      "Designed and built the Shopify theme, product and collection templates, and a checkout-ready storefront experience.",
    kind: "Shopify storefront",
    mediaKey: "madar-wears",
    name: "Madar Wears",
    presentation: "captured",
    url: "https://www.madarwears.com/",
  },
  {
    contribution:
      "Designed and built the Shopify theme, responsive product pages, and a checkout-ready storefront experience.",
    kind: "Shopify storefront",
    mediaKey: "la-glosse",
    name: "La Glosse",
    presentation: "captured",
    url: "https://la-glosse.com/",
  },
  {
    contribution: "Designed and built the Shopify theme and storefront experience.",
    kind: "Shopify storefront",
    name: "Nexo",
    presentation: "text-only",
    url: "https://bh9d1w-16.myshopify.com/",
  },
] as const satisfies readonly ClientWork[];

export const TESTIMONIALS = [] as const satisfies readonly Testimonial[];
