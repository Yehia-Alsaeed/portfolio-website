import type { AgentReplayStep } from "@/content/projects/proof";

export type AgentReplayStaticProps = { steps: readonly AgentReplayStep[] };

export function AgentReplayStatic({ steps }: AgentReplayStaticProps) {
  return (
    <ol className="border-line grid grid-cols-1 border-t border-l min-[700px]:grid-cols-2">
      {steps.map((step, index) => (
        <li className="border-line border-r border-b p-6" key={step.id}>
          <p className="text-accent-text font-mono text-[0.625rem] font-bold tracking-[0.14em] uppercase">
            {String(index + 1).padStart(2, "0")} / {step.id}
          </p>
          <h4 className="mt-2 text-base font-bold">{step.label}</h4>
          <p className="text-dim mt-2 text-sm leading-relaxed">{step.instruction}</p>
          <dl className="mt-3 flex flex-col gap-2 font-mono text-[0.6875rem] leading-relaxed">
            <div>
              <dt className="text-dim tracking-[0.08em] uppercase">Input</dt>
              <dd className="mt-0.5">{step.input}</dd>
            </div>
            <div>
              <dt className="text-dim tracking-[0.08em] uppercase">Output</dt>
              <dd className="mt-0.5">{step.output}</dd>
            </div>
            <div>
              <dt className="text-dim tracking-[0.08em] uppercase">Decision</dt>
              <dd className="mt-0.5">{step.decision}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ol>
  );
}
