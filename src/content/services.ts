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

export const CLIENT_WORK_MEDIA: Readonly<Record<"madar-wears" | "la-glosse", ClientWorkMediaSet>> =
  {
    "la-glosse": {
      desktop: { alt: "La Glosse desktop storefront", src: laGlosseDesktop },
      mobile: { alt: "La Glosse mobile storefront", src: laGlosseMobile },
      recording: {
        description: "Short muted walkthrough of the La Glosse storefront, scrolling the homepage.",
        src: "/media/client-work/la-glosse.webm",
      },
    },
    "madar-wears": {
      desktop: { alt: "Madar Wears desktop storefront", src: madarWearsDesktop },
      mobile: { alt: "Madar Wears mobile storefront", src: madarWearsMobile },
      recording: {
        description:
          "Short muted walkthrough of the Madar Wears storefront, scrolling the homepage.",
        src: "/media/client-work/madar-wears.webm",
      },
    },
  };

export const TESTIMONIALS = [] as const satisfies readonly Testimonial[];
