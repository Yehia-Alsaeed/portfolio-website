export type SystemFlowProps = {
  stages: readonly string[];
};

export function SystemFlow({ stages }: SystemFlowProps) {
  return (
    <div>
      <h4 className="text-dim font-mono text-[0.6875rem] font-bold tracking-[0.1em] uppercase">
        System flow
      </h4>
      <ol
        aria-label="System flow stages"
        className="border-line mt-4 flex flex-col gap-6 border-t pt-4 min-[768px]:flex-row min-[768px]:items-start min-[768px]:gap-8"
      >
        {stages.map((stage, index) => {
          const hasNextStage = index < stages.length - 1;

          return (
            <li
              className="relative min-w-0 text-center font-mono text-[0.6875rem] leading-relaxed font-bold tracking-[0.08em] uppercase min-[768px]:flex-1"
              key={stage}
            >
              {stage}
              {hasNextStage ? (
                <>
                  <span
                    aria-hidden="true"
                    className="text-accent-text absolute -bottom-5 left-1/2 -translate-x-1/2 min-[768px]:hidden"
                  >
                    ↓
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-accent-text absolute top-0 -right-5 hidden min-[768px]:block"
                  >
                    →
                  </span>
                </>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
