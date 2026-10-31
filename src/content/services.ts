import type { Route } from "next";
import type { StaticImageData } from "next/image";

import almuharramiLegalDesktop from "@/assets/client-work/almuharrami-legal-desktop.jpg";
import almuharramiLegalMobile from "@/assets/client-work/almuharrami-legal-mobile.jpg";
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
  title: "Call" | "Build" | "Test" | "Launch";
  summary: string;
};

export type FixSectionProblem = { title: string; body: string };

export type FixSectionContent = {
  /** Small mono section label (the RuledSection heading). */
  title: string;
  /** Small mono line on the right of the section rule. */
  meta: string;
  headline: string;
  /** Phrase inside `headline` rendered in the accent colour. */
  accent: string;
  lead: string;
  problems: readonly FixSectionProblem[];
  ctaLead: string;
  cta: { label: string; href: Route };
};

export type ServiceFaqItem = { question: string; answer: string };

type ClientWorkBase = {
  name: "Madar Wears" | "La Glosse" | "Nexo" | "Loverboy Studio" | "Almuharrami Legal";
  /** Small mono eyebrow above the client name. */
  sector: string;
  kind: "Shopify storefront" | "Creative studio site" | "Law firm website";
  /** One paragraph: what they needed, what I built, what it does now. */
  contribution: string;
  url: `https://${string}`;
  trackingId: "madar-wears" | "la-glosse" | "nexo" | "loverboy-studio" | "almuharrami-legal";
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
    | {
        presentation: "captured";
        mediaKey: "madar-wears" | "la-glosse" | "loverboy-studio" | "almuharrami-legal";
      }
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
      "Looks premium, so people trust you with their card",
      "Fewer steps to buy, so fewer people leave without paying",
      "Brings back shoppers who left their cart, so lost sales come back",
      "Suggests related products, so every order is worth more",
    ],
    index: "01",
    label: "Ecommerce",
    summary:
      "Getting people to your store is only half the job. The other half is getting them to buy. I build Shopify ecommerce stores that look like a real brand, make ordering effortless, and feel right on a phone, so the visitors you already have turn into orders.",
    title: "Shopify stores that bring in more orders.",
  },
  {
    capabilities: [
      "Designed around your business, so you stand out from competitors",
      "Says what you do in seconds, so people don't leave confused",
      "Shows your work, so the site does the selling for you",
      "Every page leads to one thing: contacting you",
    ],
    index: "02",
    label: "Custom websites",
    summary:
      "Whatever your business does, people check your website before they call, book, or buy. If it looks cheap or confusing, they move on to a competitor. I design and build custom websites that make you the obvious choice, so more of those visits turn into calls and messages.",
    title: "Websites that bring you new clients.",
  },
] as const satisfies readonly ServiceOffer[];

export const FIX_SECTION = {
  accent: "More customers",
  cta: { href: "/#contact", label: "Send me the link" },
  ctaLead: "I'll look at it and tell you what's costing you money and what it takes to fix it.",
  headline: "Same website. More customers.",
  lead: "You don't need to start over. Whether it's a Shopify store or a custom website, if it's slow, looks dated, or gets visits but no orders or messages, something specific is costing you money. I find it, fix it, and leave what works alone.",
  meta: "Fixes - Redesigns - Speed-ups",
  problems: [
    {
      body: "Every slow second sends people back to Instagram. I speed up your website, so visitors stay long enough to buy.",
      title: "It's slow",
    },
    {
      body: "A dated site makes people doubt the business. I redesign it to match your brand today, so visitors trust you enough to pay.",
      title: "It looks dated",
    },
    {
      body: "People come, look, and leave. Usually it's confusing pages, hidden costs, or too many steps. I fix those, and your visitors start turning into customers.",
      title: "Visitors, but no customers",
    },
    {
      body: "A dead button, a broken page, a form that never sends. Each one is a lost customer. I find them and fix them.",
      title: "Something's broken",
    },
  ],
  title: "Already have a website?",
} as const satisfies FixSectionContent;

export const PROJECT_INCLUDES = [
  "One person, start to finish. No account managers, no handoffs.",
  "Works on every phone. That's where your customers are.",
  "Fast, because a slow site is an empty one.",
  "Your own domain, connected and secure.",
  "A walkthrough, so you can update it yourself.",
  "You own everything: the site, the design, every login.",
] as const satisfies readonly string[];

export const SERVICE_PROCESS = [
  {
    index: "01",
    summary:
      "You tell me what you sell, who buys it, and what you want the site to do. I tell you what's realistic, how long it takes, and what it costs.",
    title: "Call",
  },
  {
    index: "02",
    summary:
      "I send you a private link and you watch the site take shape. You give feedback along the way, so there are no surprises at the end.",
    title: "Build",
  },
  {
    index: "03",
    summary:
      "I test it the way your customers will use it. On a phone, on slow internet, from finding a product to paying for it.",
    title: "Test",
  },
  {
    index: "04",
    summary: "Your site goes live. You get every login and full ownership. It's yours to run.",
    title: "Launch",
  },
] as const satisfies readonly ProcessStep[];

export const SERVICE_FAQ = [
  {
    answer: "No. I set it up with you, in your name, so it's yours from day one.",
    question: "Do I need a Shopify account first?",
  },
  {
    answer: "Most stores go live three to five weeks after our first call. Fixes are faster.",
    question: "How long does it take?",
  },
  {
    answer:
      "Every project is quoted after the first call, based on what you actually need. One fixed price, no hourly billing, no surprises.",
    question: "How much does it cost?",
  },
  {
    answer:
      "Yes. Products, prices, photos and text are all yours to change, and I show you how before I hand it over. For bigger changes or ongoing upkeep, I'm one message away.",
    question: "Can I update it myself after launch?",
  },
  {
    answer:
      "You bring the product photos and details. I tell you exactly what I need up front and handle everything else.",
    question: "Do you write the text and take the photos?",
  },
  {
    answer:
      "Yes, and often that's the smarter move. Send me the link and I'll tell you what's worth fixing.",
    question: "I already have a website. Can you fix it instead of rebuilding?",
  },
  {
    answer: "Yes. I'm in Cairo and work with clients anywhere over email and calls.",
    question: "Do you work with clients outside Egypt?",
  },
] as const satisfies readonly ServiceFaqItem[];

export const START_PROJECT_INTRO =
  "Tell me what you sell and what's not working. I'll tell you if I can help.";

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
    contribution:
      "Saeed Almuharrami Advocates & Legal Consultants needed a site that feels as trustworthy as the counsel it sells. I designed and built it end to end: the Dubai skyline hero, the sectors and practice-area pages, an enquiry form sorted by area of law, and consent-first analytics that respect UAE data law.",
    kind: "Law firm website",
    mediaKey: "almuharrami-legal",
    name: "Almuharrami Legal",
    presentation: "captured",
    sector: "Legal",
    trackingId: "almuharrami-legal",
    url: "https://www.almuharramilegal.com/",
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
  Record<"madar-wears" | "la-glosse" | "loverboy-studio" | "almuharrami-legal", ClientWorkMediaSet>
> = {
  "almuharrami-legal": {
    desktop: { alt: "Almuharrami Legal desktop site", src: almuharramiLegalDesktop },
    mobile: { alt: "Almuharrami Legal mobile site", src: almuharramiLegalMobile },
    recording: {
      description:
        "Muted walkthrough of the Almuharrami Legal site: the homepage and its practice areas, the Financial Institutions sector opened on the Experience page, then the firm's story and partners.",
      src: "/media/client-work/almuharrami-legal.webm",
    },
  },
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
