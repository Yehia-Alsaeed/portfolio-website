import { RuledSection } from "@/components/ui/ruled-section";
import type { ProcessStep } from "@/content/services";

export type ProcessSectionProps = { steps: readonly ProcessStep[] };

export function ProcessSection({ steps }: ProcessSectionProps) {
  return (
    <RuledSection title="How we work together">
      <ol className="border-line grid grid-cols-1 border-t border-l min-[560px]:grid-cols-2 min-[1024px]:grid-cols-4">
        {steps.map((step) => (
          <li className="border-line border-r border-b p-6" key={step.index}>
            <p className="text-accent-text font-mono text-[0.625rem] font-bold tracking-[0.14em] uppercase">
              {step.index}
            </p>
            <h3 className="mt-2 text-lg font-bold">{step.title}</h3>
            <p className="text-dim mt-2 text-sm leading-relaxed">{step.summary}</p>
          </li>
        ))}
      </ol>
    </RuledSection>
  );
}
