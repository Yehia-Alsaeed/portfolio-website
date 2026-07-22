import type { ModelComparison } from "@/content/projects/proof";
import { ProjectImage } from "@/features/media/project-image";

export type ModelComparisonStaticProps = { models: readonly ModelComparison[] };

export function ModelComparisonStatic({ models }: ModelComparisonStaticProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 min-[700px]:grid-cols-3">
        {models.map((model) => (
          <div key={model.id}>
            <ProjectImage
              alt={`${model.label} predictions beside source and ground truth`}
              publicId={model.imagePublicId}
              sizes="(min-width: 700px) 33vw, 100vw"
            />
            <h4 className="mt-2 text-sm font-bold">{model.label}</h4>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[0.8125rem]">
          <caption className="sr-only">Oxford Pet Segmentation model comparison</caption>
          <thead>
            <tr className="border-line border-b-2 text-left">
              <th className="py-2 pr-4" scope="col">
                Model
              </th>
              <th className="py-2 pr-4" scope="col">
                mIoU
              </th>
              <th className="py-2 pr-4" scope="col">
                Inference time
              </th>
              <th className="py-2 pr-4" scope="col">
                Parameters
              </th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr className="border-line border-b" key={model.id}>
                <th className="py-2 pr-4 text-left font-bold" scope="row">
                  {model.label}
                </th>
                <td className="py-2 pr-4">{model.miou}</td>
                <td className="py-2 pr-4">{model.inferenceTime}</td>
                <td className="py-2 pr-4">{model.parameters}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="text-dim flex flex-col gap-2 text-sm leading-relaxed">
        {models.map((model) => (
          <li key={model.id}>
            <span className="text-ink font-bold">{model.label}:</span> {model.note}
          </li>
        ))}
      </ul>
    </div>
  );
}
