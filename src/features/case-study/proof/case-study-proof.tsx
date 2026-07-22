import { getArchitectureProof } from "@/content/projects/proof";
import { ArchitectureStatic } from "@/features/case-study/proof/architecture-static";

export type CaseStudyProofProps = { slug: string };

export function CaseStudyProof({ slug }: CaseStudyProofProps) {
  const proof = getArchitectureProof(slug);
  if (!proof) return null;

  return (
    <div className="border-line mt-10 border-t pt-10">
      <h3 className="text-dim font-mono text-[0.6875rem] font-bold tracking-[0.1em] uppercase">
        Architecture proof
      </h3>
      <div className="mt-6">
        <ArchitectureStatic proof={proof} />
      </div>
    </div>
  );
}
