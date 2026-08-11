import { getArchitectureProof, MODEL_COMPARISONS } from "@/content/projects/proof";
import { ArchitectureStatic } from "@/features/case-study/proof/architecture-static";
import { ModelComparisonStatic } from "@/features/case-study/proof/model-comparison-static";
import { ModelMicroscope } from "@/features/case-study/proof/model-microscope";

export type CaseStudyProofProps = { slug: string };

export function CaseStudyProof({ slug }: CaseStudyProofProps) {
  const proof = getArchitectureProof(slug);
  if (!proof) return null;

  return (
    <div className="border-line @container mt-10 border-t pt-10">
      <h3 className="text-dim font-mono text-[0.6875rem] font-bold tracking-[0.1em] uppercase">
        Architecture proof
      </h3>
      <div className="mt-6">
        <ArchitectureStatic proof={proof} />
      </div>

      {slug === "oxford-pet-binary-segmentation" ? (
        <div className="border-line mt-10 border-t pt-10">
          <h3 className="text-dim font-mono text-[0.6875rem] font-bold tracking-[0.1em] uppercase">
            Model comparison
          </h3>
          <div className="mt-6">
            <ModelComparisonStatic models={MODEL_COMPARISONS} />
          </div>
          <ModelMicroscope models={MODEL_COMPARISONS} />
        </div>
      ) : null}
    </div>
  );
}
