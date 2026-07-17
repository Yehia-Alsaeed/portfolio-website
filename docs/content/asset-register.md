# Portfolio Asset Register

| Asset | Owner | Visibility / approval | Production destination | Fallback | Required alt-text intent |
|---|---|---|---|---|---|
| `skillbridge-interview.jpeg` | Yehia Alsaeed / SkillBridge project | Approved project evidence; use only while display approval remains valid | Cloudinary in the SkillBridge case study | Omit from production if approval is withdrawn because it may show an identifiable person | Candidate interview session with webcam and question interface |
| `skillbridge-results.jpeg` | Yehia Alsaeed / SkillBridge project | Approved project evidence; use only while display approval remains valid | Cloudinary in the SkillBridge case study | Omit from production if approval is withdrawn because the report may contain person-specific information | Five-trait interview feedback report |
| `prestige-home.webp` | Yehia Alsaeed / Prestige Motors project | Approved public deployment | Cloudinary in the Prestige Motors case study | Use `mockups/demo/assets/prestige-home.webp` when Cloudinary is unavailable | Prestige Motors showroom homepage |
| `prestige-collection.webp` | Yehia Alsaeed / Prestige Motors project | Approved public deployment | Cloudinary in the Prestige Motors case study | Use `mockups/demo/assets/prestige-collection.webp` when Cloudinary is unavailable | Responsive vehicle collection interface |
| `pets-fcn.webp` | Yehia Alsaeed / Oxford Pet Segmentation project | Approved repository output | Cloudinary in the Oxford Pet case study | Use `mockups/demo/assets/pets-fcn.webp` when Cloudinary is unavailable | FCN predictions beside source and ground truth |
| `pets-segnet.webp` | Yehia Alsaeed / Oxford Pet Segmentation project | Approved repository output | Cloudinary in the Oxford Pet case study | Use `mockups/demo/assets/pets-segnet.webp` when Cloudinary is unavailable | SegNet predictions beside source and ground truth |
| `pets-hrnet.webp` | Yehia Alsaeed / Oxford Pet Segmentation project | Approved repository output | Cloudinary in the Oxford Pet case study | Use `mockups/demo/assets/pets-hrnet.webp` when Cloudinary is unavailable | HRNet predictions beside source and ground truth |
| `study-planner-architecture.webp` | Yehia Alsaeed / AI Study Planner Agents project | Approved repository evidence | Cloudinary in the AI Study Planner case study | Use `mockups/demo/assets/study-planner-architecture.webp` when Cloudinary is unavailable | Profiler-to-optimizer multi-agent workflow |

## Repository Boundary

- Track the optimized JPEG/WebP demo references.
- Do not track QA screenshots or redundant PNG source copies.
- Store Cloudinary public IDs and alt text in typed production content.
- Keep the CV, font files, tiny textures, and UI-only assets in the repository.
- Never store image or PDF binaries in PostgreSQL.
