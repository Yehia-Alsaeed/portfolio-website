import type { StaticImageData } from "next/image";

import petsFcn from "../../../mockups/demo/assets/pets-fcn.webp";
import petsHrnet from "../../../mockups/demo/assets/pets-hrnet.webp";
import petsSegnet from "../../../mockups/demo/assets/pets-segnet.webp";
import prestigeCollection from "../../../mockups/demo/assets/prestige-collection.webp";
import prestigeHome from "../../../mockups/demo/assets/prestige-home.webp";
import skillbridgeInterview from "../../../mockups/demo/assets/skillbridge-interview.jpeg";
import skillbridgeResults from "../../../mockups/demo/assets/skillbridge-results.jpeg";
import studyPlannerArchitecture from "../../../mockups/demo/assets/study-planner-architecture.webp";

/**
 * Statically imported so Next.js derives real width/height (and a blur
 * placeholder) from the committed files themselves - the single source of
 * truth for both the Cloudinary <Image> layout hints and the no-Cloudinary
 * fallback render. Reuses docs/content/asset-register.md's tracked files
 * directly; no redundant copies live under src/ or public/.
 */
export const LOCAL_FALLBACK_IMAGES: Readonly<Record<string, StaticImageData>> = {
  "pets-fcn": petsFcn,
  "pets-hrnet": petsHrnet,
  "pets-segnet": petsSegnet,
  "prestige-collection": prestigeCollection,
  "prestige-home": prestigeHome,
  "skillbridge-interview": skillbridgeInterview,
  "skillbridge-results": skillbridgeResults,
  "study-planner-architecture": studyPlannerArchitecture,
};
