import type { DisplayMode } from "@/features/display-mode/model";

export type PaletteCommand =
  | {
      id: string;
      group: "Navigate";
      label: string;
      keywords: readonly string[];
      kind: "navigate";
      href:
        | "/"
        | "/projects"
        | "/services"
        | "/design-system"
        | "/#work"
        | "/#experience"
        | "/#services"
        | "/#contact";
    }
  | {
      id: string;
      group: "Display";
      label: string;
      keywords: readonly string[];
      kind: "display-mode";
      mode: DisplayMode;
    }
  | {
      id: string;
      group: "Actions";
      label: string;
      keywords: readonly string[];
      kind: "copy-email" | "download-cv" | "poster-mode";
    };

export const SITE_COMMANDS: readonly PaletteCommand[] = [
  {
    group: "Navigate",
    href: "/",
    id: "navigate-home",
    keywords: ["home", "start", "index"],
    kind: "navigate",
    label: "Home",
  },
  {
    group: "Navigate",
    href: "/projects",
    id: "navigate-projects",
    keywords: ["projects", "work", "portfolio"],
    kind: "navigate",
    label: "Projects",
  },
  {
    group: "Navigate",
    href: "/services",
    id: "navigate-services",
    keywords: ["services", "freelance", "clients"],
    kind: "navigate",
    label: "Services",
  },
  {
    group: "Navigate",
    href: "/design-system",
    id: "navigate-design-system",
    keywords: ["design", "system", "gallery", "components"],
    kind: "navigate",
    label: "Design system",
  },
  {
    group: "Navigate",
    href: "/#work",
    id: "navigate-work",
    keywords: ["work", "projects", "ai", "machine learning"],
    kind: "navigate",
    label: "Jump to selected work",
  },
  {
    group: "Navigate",
    href: "/#experience",
    id: "navigate-experience",
    keywords: ["experience", "education", "skills"],
    kind: "navigate",
    label: "Jump to experience",
  },
  {
    group: "Navigate",
    href: "/#services",
    id: "navigate-home-services",
    keywords: ["services", "shopify", "freelance"],
    kind: "navigate",
    label: "Jump to services",
  },
  {
    group: "Navigate",
    href: "/#contact",
    id: "navigate-contact",
    keywords: ["contact", "email", "hire"],
    kind: "navigate",
    label: "Jump to contact",
  },
  {
    group: "Display",
    id: "display-paper",
    keywords: ["paper", "light", "theme", "mode"],
    kind: "display-mode",
    label: "Use Paper mode",
    mode: "paper",
  },
  {
    group: "Display",
    id: "display-night",
    keywords: ["night", "dark", "theme", "mode"],
    kind: "display-mode",
    label: "Use Night mode",
    mode: "night",
  },
  {
    group: "Display",
    id: "display-mono",
    keywords: ["mono", "monochrome", "theme", "mode"],
    kind: "display-mode",
    label: "Use Mono mode",
    mode: "mono",
  },
  {
    group: "Actions",
    id: "action-copy-email",
    keywords: ["copy", "email", "contact"],
    kind: "copy-email",
    label: "Copy email address",
  },
  {
    group: "Actions",
    id: "action-download-cv",
    keywords: ["cv", "resume", "download"],
    kind: "download-cv",
    label: "Download CV",
  },
  {
    group: "Actions",
    id: "action-poster-mode",
    keywords: ["poster", "remix", "visual"],
    kind: "poster-mode",
    label: "Open Poster Mode",
  },
];

export const COMMAND_GROUPS = ["Navigate", "Display", "Actions"] as const;
