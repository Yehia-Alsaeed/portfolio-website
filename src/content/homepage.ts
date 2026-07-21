export type HomeSectionId =
  "monogram" | "positioning" | "stats" | "work" | "experience" | "services" | "contact";

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

export const HOME_SECTION_ORDER = [
  "monogram",
  "positioning",
  "stats",
  "work",
  "experience",
  "services",
  "contact",
] as const satisfies readonly HomeSectionId[];

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
    category: "Full-stack - Live on Vercel",
    href: "/projects/prestige-motors-showroom",
    index: "05",
    name: "Prestige Motors Showroom",
    year: "2026",
  },
] as const satisfies readonly FeaturedProject[];

export const TIMELINE_ENTRIES = [
  {
    meta: "Summer Academy Intern - 160+ hours",
    period: "Aug-Sep 2025",
    summary:
      "Co-built and pitched a four-module AI career platform through agile sprints, demos, job shadowing, and solution-architecture work.",
    title: "Dell Technologies",
  },
  {
    meta: "Shopify - Full-stack - Independent",
    period: "2025-2026",
    summary:
      "Built and launched Shopify stores and full-stack client websites with conversion, performance, SEO, and handover in mind.",
    title: "Freelance Web Developer",
  },
  {
    meta: "AI major - British University in Egypt",
    period: "Graduated 2026",
    summary:
      "BSc (Hons) Informatics and Computer Science covering artificial intelligence, machine learning, data, algorithms, databases, and software engineering.",
    title: "BSc (Hons) Informatics and Computer Science",
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

export const SERVICE_TEASERS = [
  {
    capabilities: [
      "Custom themes and sections",
      "Speed and SEO optimization",
      "Launch to first sale",
    ],
    index: "01",
    label: "E-commerce",
    summary:
      "Complete Shopify builds with Liquid customization, conversion-focused layouts, and technical SEO baked in.",
    title: "Shopify, built to convert.",
  },
  {
    capabilities: ["React / Node / MongoDB", "LLM and CV integrations", "Admin panels and auth"],
    index: "02",
    label: "Web and AI",
    summary:
      "Full-stack platforms and applied-AI features designed, built, and deployed as complete products.",
    title: "Full-stack, end to end.",
  },
] as const satisfies readonly ServiceTeaser[];
