import { getProjectCatalogue } from "@/features/projects/catalogue";
import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE, renderOgImage } from "@/lib/og/render-og-image";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Projects | Yehia Alsaeed";

export default async function Image() {
  const projects = await getProjectCatalogue();

  return renderOgImage({
    eyebrow: "Projects",
    subtitle:
      "All GitHub projects by Yehia Alsaeed across AI, machine learning, and full-stack systems, filterable by category.",
    title: `All ${projects.length} projects`,
  });
}
