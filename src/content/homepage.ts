export type HomeSectionId =
  "monogram" | "positioning" | "client-work" | "services" | "work" | "experience" | "contact";

export type HomeStat = { value: string; label: string; detail?: string };
export type FeaturedProject = {
  index: string;
  name: string;
  category: string;
  year: string;
  href: `/projects/${string}`;
};
export type TimelineEntry = { period: string; title: string; meta: string; summary: string };
export type SkillGroup = { label: string; skills: readonly string[] };
export type ServiceTeaser = {
  index: string;
  label: string;
  title: string;
  summary: string;
  capabilities: readonly string[];
};

// Client-first: statement, proof, offer, then the recruiter half (AI
// projects, experience, skills).
export const HOME_SECTION_ORDER = [
  "monogram",
  "positioning",
  "client-work",
  "services",
  "work",
  "experience",
  "contact",
] as const satisfies readonly HomeSectionId[];

// No longer shown on the homepage: the stats strip was removed on
// 2026-09-19 because small counts read as "new" to clients. Poster Mode
// (poster-mode-dialog.tsx) still reads the first two figures.
export const HOME_STATS = [
  { label: "Projects on GitHub", value: "17" },
  { detail: "HRNet segmentation", label: "mIoU", value: "0.93" },
  { detail: "Llama QLoRA", label: "Exact match", value: "+0.66" },
  { detail: "Shopify + web", label: "Freelance", value: "1+ yr" },
] as const satisfies readonly HomeStat[];

export const FEATURED_PROJECTS = [
  {
    category: "Multimodal ML - Grad project",
    href: "/projects/skillbridge-ai-interviewer",
    index: "01",
    name: "SkillBridge AI Interviewer",
    year: "2026",
  },
  {
    category: "LLM fine-tuning",
    href: "/projects/llama-qlora-education-qa",
    index: "02",
    name: "Llama QLoRA Education QA",
    year: "2026",
  },
  {
    category: "Multi-agent systems",
    href: "/projects/ai-study-planner-agents",
    index: "03",
    name: "AI Study Planner Agents",
    year: "2026",
  },
  {
    category: "Computer vision",
    href: "/projects/oxford-pet-binary-segmentation",
    index: "04",
    name: "Oxford Pet Segmentation",
    year: "2026",
  },
  {
    category: "Full-stack - Live demo",
    href: "/projects/prestige-motors-showroom",
    index: "05",
    name: "Prestige Motors Showroom",
    year: "2026",
  },
] as const satisfies readonly FeaturedProject[];

export const TIMELINE_ENTRIES = [
  {
    meta: "Shopify - Custom websites - Independent",
    period: "2025-2026",
    summary:
      "Shopify stores and custom websites for brands in Egypt and abroad, built to bring in orders and clients.",
    title: "Freelance Web Developer",
  },
  {
    meta: "Summer Academy Intern - 160+ hours",
    period: "Aug-Sep 2025",
    summary:
      "Co-built and pitched a four-module AI career platform through agile sprints, demos, job shadowing, and solution-architecture work.",
    title: "Dell Technologies",
  },
  {
    meta: "AI major - British University in Egypt",
    period: "Graduated 2026",
    summary:
      "BSc Informatics and Computer Science covering artificial intelligence, machine learning, data, algorithms, databases, and software engineering.",
    title: "BSc Informatics and Computer Science",
  },
] as const satisfies readonly TimelineEntry[];

export const SKILL_GROUPS = [
  { label: "Languages", skills: ["Python", "C++", "Java", "C#", "TypeScript/JavaScript", "SQL"] },
  {
    label: "AI / ML",
    skills: [
      "PyTorch",
      "LLM fine-tuning (QLoRA, PEFT)",
      "CrewAI",
      "Hugging Face",
      "OpenAI APIs",
      "computer vision",
      "NLP",
      "scikit-learn",
    ],
  },
  {
    label: "Web and tools",
    skills: [
      "React",
      "Node.js",
      "FastAPI",
      "Express",
      "MongoDB",
      "REST APIs",
      "Shopify/Liquid",
      "Git",
    ],
  },
] as const satisfies readonly SkillGroup[];

/**
 * Mirrors SERVICE_OFFERS in `@/content/services` exactly, kept as a copy on
 * purpose. This module is imported by a client component (the poster-mode
 * dialog), and importing the services module here would pull its client-work
 * screenshot imports into that browser bundle. A unit test asserts the two
 * lists are deep-equal, so edit both together.
 */
export const SERVICE_TEASERS = [
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
] as const satisfies readonly ServiceTeaser[];
