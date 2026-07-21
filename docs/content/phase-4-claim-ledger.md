# Phase 4 Claim Ledger

Every metric in `src/content/projects/case-studies.ts` (`results[].label` / `results[].value`, quoted verbatim below) and every material technical/methodology claim in its prose fields is listed with an exact source. All sources were read directly from the public repository (via `gh api repos/Yehia-Alsaeed/<repo>`, authenticated as `Yehia-Alsaeed`) or from the reviewed CV (`public/cv/Yehia_Alsaeed_CV_AI.pdf`, source `D:\job hunt\CV VERSIONS\Yehia_Alsaeed_CV_AI.docx` per `docs/content/cv-register.md`) on 2026-07-21. `mockups/demo/case-study*.html` copy was treated as a starting point only and re-verified against the repositories: the SkillBridge and Oxford Pet headline numbers were sharpened to the exact published figures, the Llama QLoRA case now reports both evaluated models instead of one, and the Prestige Motors/AI Study Planner case studies drop unverifiable demo claims in favor of what the repositories actually publish.

**Period field policy (2026-07-21, per Yehia):** GitHub `created_at`/`pushed_at` dates do not reflect when these projects were actually built, so they are not used as a `period` source. Yehia supplied SkillBridge's real build period directly ("Oct 2025 - Jun 2026"); the other four case studies intentionally omit `period` (the field is optional) and will be filled in with real dates during final pre-launch tweaks after all 8 phases are complete.

## SkillBridge AI Interviewer

| Claim (`results[].label`) | Value (`results[].value`) | Source |
| --- | --- | --- |
| Interview score accuracy (grouped split) | 0.9094 | `skillbridge-ai-interviewer` repo, `docs/results.md`, "Headline Result" table (full value 0.9094, 95% CI 0.9055-0.9128) |
| Big Five average accuracy | 0.9089 | `skillbridge-ai-interviewer` repo, `docs/results.md`, "Headline Result" table |
| Source-leakage gap vs. paper-style split | 0.0054 | `skillbridge-ai-interviewer` repo, `docs/results.md`, "Leakage Comparison" table (grouped 0.9094 vs. paper-style 0.9148) |
| Improvement over handcrafted baseline | 0.0995 -> 0.2560 normalized accuracy | `skillbridge-ai-interviewer` repo, `docs/results.md`, "Baseline Comparison" table (interview-label normalized accuracy) |

Other material claims: evaluation dataset is First Impressions V2 (`docs/results.md`, "Evaluation Setup"); the grouped-by-source split is used specifically to avoid person-level leakage (same section); the baseline/fusion comparison is handcrafted-feature XGBoost vs. wav2vec2 (audio) / CLIP (vision) / MPNet (text) embeddings (`README.md`, "Tech Stack" and "Machine-Learning Work"); role/stack come from `public/cv/Yehia_Alsaeed_CV_AI.pdf` ("SkillBridge AI Interviewer" entry); period "Oct 2025 - Jun 2026" was supplied directly by Yehia (2026-07-21) — the repo's `created_at`/`pushed_at` dates only reflect when it was pushed to GitHub, not when it was built, so they were not used; no live deployment (`homepage` field empty via `gh api repos/Yehia-Alsaeed/skillbridge-ai-interviewer`).

## Llama QLoRA Education QA

| Claim (`results[].label`) | Value (`results[].value`) | Source |
| --- | --- | --- |
| Llama 3.2 3B Instruct, baseline Exact Match | 0.000 | `llama-qlora-education-qa` repo, `docs/results.md`, "Exact Match Comparison" table |
| Llama 3.2 3B Instruct, QLoRA fine-tuned Exact Match | 0.660 | `llama-qlora-education-qa` repo, `docs/results.md`, "Exact Match Comparison" table |
| Llama 3.1 8B Instruct, QLoRA fine-tuned Exact Match | 0.595 | `llama-qlora-education-qa` repo, `docs/results.md`, "Exact Match Comparison" table |
| Baseline ROUGE-1 (8B) | 0.2212 | `llama-qlora-education-qa` repo, `docs/results.md`, "ROUGE Comparison" table |

Other material claims: fine-tuned ROUGE is generated at evaluation-script runtime rather than published as a fixed number, so it is reported as "Not measured as a static figure" in the case study limitation, not a `results` entry (`docs/results.md`, "ROUGE Comparison" table note); method is QLoRA with 4-bit quantization and LoRA adapters via TRL's `SFTTrainer` (`README.md`, "Key Features & Methodology"); role/stack from `public/cv/Yehia_Alsaeed_CV_AI.pdf` ("Llama QLoRA Education QA" entry); `period` is intentionally omitted — Yehia will supply the real build period during final pre-launch tweaks rather than have it inferred from the repo's GitHub push date; no approved media asset exists for this project, so `media` is an empty array (`docs/content/asset-register.md` has no `llama-qlora-education-qa` row).

## AI Study Planner Agents

| Claim (`results[].label`) | Value (`results[].value`) | Source |
| --- | --- | --- |
| Sample run quality score | 9 / 10 | `ai-study-planner-agents` repo, `examples/sample_output.md` ("Quality Score: 9/10" line), parsed by `src/study_planner/evaluation.py`'s `QUALITY_PATTERN` |
| Coordinated agent stages | 4 | `ai-study-planner-agents` repo, `README.md`, "Agent Architecture" table (Profiler, Generator, Critic, Optimizer) |

Other material claims: difficulty classification uses the `all-MiniLM-L6-v2` sentence-transformer (`README.md`, "Tech Stack & Core Skills"); no aggregate benchmark across many runs is published, only the one example above, so the case study states "Not measured beyond that example" as a limitation (repository file listing: `docs/` contains only `images/`, no results/benchmark file); role/stack from `public/cv/Yehia_Alsaeed_CV_AI.pdf` ("AI Study Planner Agents" entry); `period` is intentionally omitted pending Yehia's real build dates (see Llama QLoRA row above for the same policy).

## Oxford Pet Segmentation

| Claim (`results[].label`) | Value (`results[].value`) | Source |
| --- | --- | --- |
| HRNet-W18 test mIoU | 0.9306 | `oxford-pet-binary-segmentation` repo, `README.md`, "Results" table |
| HRNet-W18 inference speed | 0.06s / image | `oxford-pet-binary-segmentation` repo, `README.md`, "Results" table (exact value 0.0633s, rounded for display) |
| HRNet-W18 inference speed vs. SegNet-VGG16 | ~37x faster | Derived from `oxford-pet-binary-segmentation` repo, `README.md`, "Results" table (2.3331s / 0.0633s = 36.9) |
| Runner-up models | FCN 0.9243 mIoU, SegNet 0.9122 mIoU | `oxford-pet-binary-segmentation` repo, `README.md`, "Results" table |

Other material claims: HRNet-W18 also has the highest pet IoU (0.9198), Dice/F1 (0.9582), pixel accuracy (0.9650), and fewest parameters (11.44M) of the three models (same "Results" table); dataset and task is Oxford-IIIT Pet, binary (pet vs. background) segmentation via trimap-to-mask conversion (`README.md` introduction); role/stack from `public/cv/Yehia_Alsaeed_CV_AI.pdf` ("Oxford Pet Binary Segmentation" entry); `period` is intentionally omitted pending Yehia's real build dates.

## Prestige Motors Showroom

| Claim (`results[].label`) | Value (`results[].value`) | Source |
| --- | --- | --- |
| Deployment status | Live in production | `gh api repos/Yehia-Alsaeed/prestige-motors-showroom --jq .homepage` returned `https://prestige-motor.vercel.app/`; corroborated in repo `README.md`, "Live Project" |
| Delivered customer + admin workflow | Full reservation, offer, and approval pipeline | `prestige-motors-showroom` repo, `README.md`, "Core Features" section |

Other material claims: live deployment URL `https://prestige-motor.vercel.app/` matches the repo's `homepage` field exactly; role/stack from `public/cv/Yehia_Alsaeed_CV_AI.pdf` ("Prestige Motors Showroom" entry); `period` is intentionally omitted pending Yehia's real build dates; no business-outcome metrics (traffic, conversion, sales) are published anywhere, so the case study reports that limitation as "Not measured" rather than inventing a number.

## Verification method

- Repository metadata, README files, and curated results docs were fetched directly with `gh api repos/Yehia-Alsaeed/<repo>` (`gh` authenticated as `Yehia-Alsaeed`) on 2026-07-21 — not copied from the static `mockups/demo/` prototype.
- Every `results[].label`/`results[].value` pair in `src/content/projects/case-studies.ts` appears verbatim in this ledger; `tests/unit/phase-4-project-data.test.ts` enforces that mapping automatically.
- No metric, screenshot, or person-specific detail beyond the two rows approved in `docs/content/asset-register.md` for SkillBridge is published.
