import type { StaticImageData } from "next/image";

import laGlosseDesktop from "@/assets/client-work/la-glosse-desktop.jpg";
import laGlosseMobile from "@/assets/client-work/la-glosse-mobile.jpg";
import madarWearsDesktop from "@/assets/client-work/madar-wears-desktop.jpg";
import madarWearsMobile from "@/assets/client-work/madar-wears-mobile.jpg";

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
  /** Small mono eyebrow above the client name. */
  sector: string;
  kind: "Shopify storefront";
  /** One paragraph: what they needed, what I built, what it does now. */
  contribution: string;
  url: `https://${string}`;
  trackingId: "madar-wears" | "la-glosse" | "nexo";
};

export type ClientWork = ClientWorkBase &
  (
    | { presentation: "captured"; mediaKey: "madar-wears" | "la-glosse" }
    | { presentation: "text-only" }
  );

export type Testimonial = { quote: string; attribution: string };

export type ClientWorkMediaSet = {
  desktop: { src: StaticImageData; alt: string };
  mobile: { src: StaticImageData; alt: string };
  recording: { src: `/media/client-work/${string}.webm`; description: string };
};

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
      "Madar Wears needed a storefront that could carry a growing catalogue without slowing down. I built a custom Shopify theme with responsive product and collection templates, tuned image delivery, and a checkout-ready path from first tap to order.",
    kind: "Shopify storefront",
    mediaKey: "madar-wears",
    name: "Madar Wears",
    presentation: "captured",
    sector: "Apparel",
    trackingId: "madar-wears",
    url: "https://www.madarwears.com/",
  },
  {
    contribution:
      "La Glosse wanted a storefront that felt as considered as the products in it. I built a custom Shopify theme with responsive product pages, deliberate typography, and a checkout-ready path that holds up on a phone.",
    kind: "Shopify storefront",
    mediaKey: "la-glosse",
    name: "La Glosse",
    presentation: "captured",
    sector: "Beauty",
    trackingId: "la-glosse",
    url: "https://la-glosse.com/",
  },
  {
    contribution:
      "Nexo needed a storefront built from a blank slate. I designed and built the Shopify theme end to end, from the layout system and section structure through to a checkout-ready storefront experience.",
    kind: "Shopify storefront",
    name: "Nexo",
    presentation: "text-only",
    sector: "Retail",
    trackingId: "nexo",
    url: "https://bh9d1w-16.myshopify.com/",
  },
] as const satisfies readonly ClientWork[];

export const CLIENT_WORK_MEDIA: Readonly<Record<"madar-wears" | "la-glosse", ClientWorkMediaSet>> =
  {
    "la-glosse": {
      desktop: { alt: "La Glosse desktop storefront", src: laGlosseDesktop },
      mobile: { alt: "La Glosse mobile storefront", src: laGlosseMobile },
      recording: {
        description:
          "Muted walkthrough of the La Glosse storefront: the homepage, the catalogue, and a product page with its description and add-to-cart controls.",
        src: "/media/client-work/la-glosse.webm",
      },
    },
    "madar-wears": {
      desktop: { alt: "Madar Wears desktop storefront", src: madarWearsDesktop },
      mobile: { alt: "Madar Wears mobile storefront", src: madarWearsMobile },
      recording: {
        description:
          "Muted walkthrough of the Madar Wears storefront: the homepage, the catalogue, and a product page with its size options and add-to-cart controls.",
        src: "/media/client-work/madar-wears.webm",
      },
    },
  };

export const TESTIMONIALS = [] as const satisfies readonly Testimonial[];
