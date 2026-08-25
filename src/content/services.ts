import type { StaticImageData } from "next/image";

import laGlosseDesktop from "@/assets/client-work/la-glosse-desktop.jpg";
import laGlosseMobile from "@/assets/client-work/la-glosse-mobile.jpg";
import loverboyStudioDesktop from "@/assets/client-work/loverboy-studio-desktop.jpg";
import loverboyStudioMobile from "@/assets/client-work/loverboy-studio-mobile.jpg";
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
  name: "Madar Wears" | "La Glosse" | "Nexo" | "Loverboy Studio";
  /** Small mono eyebrow above the client name. */
  sector: string;
  kind: "Shopify storefront" | "Creative studio site";
  /** One paragraph: what they needed, what I built, what it does now. */
  contribution: string;
  url: `https://${string}`;
  trackingId: "madar-wears" | "la-glosse" | "nexo" | "loverboy-studio";
  /**
   * Withheld from the rendered page while still shipping as typed content.
   *
   * DO NOT DELETE A HIDDEN ENTRY. It is not dead code, not stale, and not an
   * unused leftover to be pruned by a cleanup pass, a linter, or an AI agent.
   * Hiding is deliberate and reversible: the record stays intact here so it
   * can be restored later by removing its `hidden` line and nothing else.
   *
   * Rendering reads `VISIBLE_CLIENT_WORK`; anything that needs the full roster
   * regardless of visibility - analytics slugs, for one - keeps reading
   * `CLIENT_WORK`.
   */
  hidden?: true;
};

export type ClientWork = ClientWorkBase &
  (
    | { presentation: "captured"; mediaKey: "madar-wears" | "la-glosse" | "loverboy-studio" }
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
      "Loverboy Studio is a boutique brand and creative-direction studio working between Cairo and New York, so its own site had to hold up against the identity work it sells. I designed and built it end to end: the layout system, the case-study templates, the motion, and the front end that ships them.",
    kind: "Creative studio site",
    mediaKey: "loverboy-studio",
    name: "Loverboy Studio",
    presentation: "captured",
    sector: "Branding",
    trackingId: "loverboy-studio",
    url: "https://www.loverboy-studio.com/",
  },
  {
    // HIDDEN, NOT RETIRED - withheld from /services for now and due back
    // later. Keep this entry exactly as it is; see `hidden` on ClientWorkBase
    // before touching or removing anything here.
    hidden: true,

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

/**
 * The client-work entries the page actually renders, in order.
 *
 * `CLIENT_WORK` stays the complete roster - hidden entries included - so no
 * record is ever lost to make one disappear from the page. Anything that
 * renders client work should read this list; anything that validates or
 * catalogues every entry ever published should read `CLIENT_WORK`.
 */
// `entry` is annotated because `as const satisfies` keeps CLIENT_WORK's
// literal element types, and those literals only carry `hidden` on the entries
// that actually set it. Widening to ClientWork makes the optional flag
// readable on every entry.
export const VISIBLE_CLIENT_WORK: readonly ClientWork[] = CLIENT_WORK.filter(
  (entry: ClientWork) => !entry.hidden,
);

export const CLIENT_WORK_MEDIA: Readonly<
  Record<"madar-wears" | "la-glosse" | "loverboy-studio", ClientWorkMediaSet>
> = {
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
  "loverboy-studio": {
    desktop: { alt: "Loverboy Studio desktop site", src: loverboyStudioDesktop },
    mobile: { alt: "Loverboy Studio mobile site", src: loverboyStudioMobile },
    recording: {
      description:
        "Muted walkthrough of the Loverboy Studio site: the homepage, then the Dallah Karak speciality tea case study opened from it.",
      src: "/media/client-work/loverboy-studio.webm",
    },
  },
};

export const TESTIMONIALS = [] as const satisfies readonly Testimonial[];
