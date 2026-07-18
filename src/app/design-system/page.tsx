import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { MetadataRow } from "@/components/ui/metadata-row";
import { PageTitle } from "@/components/ui/page-title";
import { ProjectRow } from "@/components/ui/project-row";
import { RuledSection } from "@/components/ui/ruled-section";
import { StatCell } from "@/components/ui/stat-cell";
import { ModeSwitcher } from "@/features/display-mode/mode-switcher";

export const metadata: Metadata = {
  title: "Design system | Yehia Alsaeed",
  description: "Internal review gallery for the portfolio design system primitives.",
};

const SPACING_STEPS = [4, 8, 12, 16, 24, 32, 48, 64] as const;

export default function DesignSystemPage() {
  return (
    <>
      <PageTitle
        eyebrow="Internal review"
        subtitle="Primitive and interaction specimens for direct review"
        title="Design system"
      />

      <RuledSection meta="Archivo + JetBrains Mono" title="Typography">
        <div className="flex flex-col gap-6">
          <p className="text-[clamp(3.5rem,10vw,8rem)] leading-[0.85] font-black font-stretch-[125%]">
            Aa Rr Gg
          </p>
          <p className="text-[clamp(2.75rem,8vw,6.875rem)] leading-[0.95] font-black font-stretch-[120%]">
            Heading one scale
          </p>
          <p className="text-[clamp(1.375rem,3vw,2rem)] font-extrabold font-stretch-[110%]">
            Heading two scale
          </p>
          <p className="max-w-[62ch] text-base leading-relaxed">
            Body text uses Archivo at a comfortable measure. It stays fully legible in Paper, Night,
            and Mono display modes without changing size or spacing.
          </p>
          <p className="text-dim font-mono text-[0.6875rem] tracking-[0.1em] uppercase">
            Mono metadata — labels, controls, and annotations
          </p>
        </div>
      </RuledSection>

      <RuledSection meta="Primary / outline / quiet / disabled / icon" title="Actions">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary action</Button>
          <Button variant="outline">Outline action</Button>
          <Button variant="quiet">Quiet action</Button>
          <Button disabled>Disabled action</Button>
          <Button aria-label="Icon action" size="icon" variant="outline">
            <span aria-hidden="true">→</span>
          </Button>
        </div>
      </RuledSection>

      <RuledSection meta="Specimens only — not a live form" title="Form controls">
        <div className="grid max-w-3xl grid-cols-1 gap-6 min-[821px]:grid-cols-2">
          <FormField id="specimen-name" label="Name">
            <input
              className="border-line text-ink min-h-11 border bg-transparent px-3 font-semibold outline-none"
              type="text"
            />
          </FormField>
          <FormField hint="Used only to reply to the inquiry" id="specimen-email" label="Email">
            <input
              className="border-line text-ink min-h-11 border bg-transparent px-3 font-semibold outline-none"
              type="email"
            />
          </FormField>
          <FormField id="specimen-inquiry" label="Inquiry type">
            <select className="border-line text-ink min-h-11 cursor-pointer appearance-none border bg-transparent px-3 font-semibold outline-none">
              <option>Job opportunity</option>
              <option>Freelance project</option>
              <option>Collaboration</option>
              <option>Other</option>
            </select>
          </FormField>
          <FormField id="specimen-message" label="Message">
            <textarea
              className="border-line text-ink min-h-24 resize-y border bg-transparent px-3 py-2 font-semibold outline-none"
              rows={3}
            />
          </FormField>
          <FormField
            error="This field shows the error state"
            id="specimen-error"
            label="Error state"
          >
            <input
              className="border-line text-ink aria-invalid:border-accent min-h-11 border bg-transparent px-3 font-semibold outline-none"
              type="text"
            />
          </FormField>
          <FormField id="specimen-disabled" label="Disabled state">
            <input
              className="border-line text-ink min-h-11 border bg-transparent px-3 font-semibold outline-none disabled:opacity-50"
              disabled
              type="text"
            />
          </FormField>
        </div>
      </RuledSection>

      <RuledSection meta="Four cells collapse to two below 820px" title="Metadata">
        <MetadataRow
          ariaLabel="Metadata specimen"
          items={[
            { label: "Field one", value: "Specimen value" },
            { label: "Field two", value: "Specimen value" },
            { label: "Field three", value: "Specimen value" },
            { label: "Field four", value: "Specimen value" },
          ]}
        />
      </RuledSection>

      <RuledSection meta="Neutral values — not portfolio claims" title="Statistics">
        <div className="border-line bg-line grid grid-cols-2 gap-px border-2 min-[821px]:grid-cols-4">
          <div className="bg-paper">
            <StatCell detail="Component specimen" label="Component specimen" value="01" />
          </div>
          <div className="bg-paper">
            <StatCell detail="Component specimen" label="Component specimen" value="0.25" />
          </div>
          <div className="bg-paper">
            <StatCell detail="Component specimen" label="Component specimen" value="128" />
          </div>
          <div className="bg-paper">
            <StatCell detail="Component specimen" label="Component specimen" value="99%" />
          </div>
        </div>
      </RuledSection>

      <RuledSection meta="Inverts on hover" title="Project rows">
        <ProjectRow
          category="Machine learning"
          href="/"
          index="01"
          name="Example system"
          year="2026"
        />
      </RuledSection>

      <RuledSection meta="With and without accent" title="Page title">
        <div className="flex flex-col gap-8">
          <PageTitle
            accent="accent"
            eyebrow="Specimen"
            headingLevel={2}
            subtitle="Title specimen with an accent substring"
            title="With accent"
          />
          <PageTitle
            headingLevel={2}
            subtitle="Title specimen without an accent substring"
            title="Plain title"
          />
        </div>
      </RuledSection>

      <RuledSection meta="Paper / Night / Mono" title="Display modes">
        <div className="flex flex-col gap-4">
          <ModeSwitcher />
          <p className="text-dim max-w-[62ch] font-mono text-[0.6875rem] tracking-[0.08em] uppercase">
            Ctrl+K or Cmd+K opens the command palette from any route; Escape closes it and returns
            focus to the header trigger. The chosen display mode persists across visits.
          </p>
        </div>
      </RuledSection>

      <RuledSection meta="4 to 64px" title="Spacing">
        <ul className="flex list-none flex-col gap-3 p-0">
          {SPACING_STEPS.map((step) => (
            <li className="flex items-center gap-4" key={step}>
              <span className="text-dim w-14 font-mono text-[0.6875rem] tracking-[0.08em] uppercase">
                {step}px
              </span>
              <span aria-hidden="true" className="bg-accent" style={{ height: 12, width: step }} />
            </li>
          ))}
        </ul>
      </RuledSection>
    </>
  );
}
