import type { ArchitectureProof } from "@/content/projects/proof";

export type ArchitectureStaticProps = { proof: ArchitectureProof };

export function ArchitectureStatic({ proof }: ArchitectureStaticProps) {
  const nodesById = new Map(proof.nodes.map((node) => [node.id, node]));

  return (
    <div className="flex flex-col gap-8">
      <ol className="border-line grid grid-cols-1 border-t border-l min-[700px]:grid-cols-2">
        {proof.readingOrder.map((id, index) => {
          const node = nodesById.get(id);
          if (!node) return null;

          return (
            <li className="border-line border-r border-b p-6" key={node.id}>
              <p className="text-accent-text font-mono text-[0.625rem] font-bold tracking-[0.14em] uppercase">
                {String(index + 1).padStart(2, "0")} / {node.technology}
              </p>
              <h4 className="mt-2 text-base font-bold">{node.label}</h4>
              <p className="text-dim mt-2 text-sm leading-relaxed">{node.responsibility}</p>
              <dl className="mt-3 flex flex-col gap-2 font-mono text-[0.6875rem] leading-relaxed">
                <div>
                  <dt className="text-dim tracking-[0.08em] uppercase">Input</dt>
                  <dd className="mt-0.5">{node.input}</dd>
                </div>
                <div>
                  <dt className="text-dim tracking-[0.08em] uppercase">Output</dt>
                  <dd className="mt-0.5">{node.output}</dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ol>

      <div>
        <h4 className="text-dim font-mono text-[0.6875rem] font-bold tracking-[0.1em] uppercase">
          Relationships
        </h4>
        <ul className="text-dim mt-3 flex flex-col gap-2 text-sm leading-relaxed">
          {proof.edges.map((edge) => {
            const source = nodesById.get(edge.source);
            const target = nodesById.get(edge.target);
            if (!source || !target) return null;

            return (
              <li key={edge.id}>
                {source.label} → {target.label}
                {edge.label ? ` (${edge.label})` : ""}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
