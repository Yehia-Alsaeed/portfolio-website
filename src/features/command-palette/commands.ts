import type { DisplayMode } from "@/features/display-mode/model";

export type PaletteCommand =
  | {
      id: string;
      group: "Navigate";
      label: string;
      keywords: readonly string[];
      kind: "navigate";
      href: "/" | "/projects" | "/services" | "/design-system";
    }
  | {
      id: string;
      group: "Display";
      label: string;
      keywords: readonly string[];
      kind: "display-mode";
      mode: DisplayMode;
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
];

export const COMMAND_GROUPS = ["Navigate", "Display"] as const;
