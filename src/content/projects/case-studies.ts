export type CaseStudyResult = { label: string; value: string; detail?: string };
export type CaseStudyMedia = { publicId: string; fallbackSrc: string; alt: string };

export type CaseStudy = {
  slug: string;
  title: string;
  summary: string;
  role: string;
  /** Omitted until Yehia supplies the real build period during final pre-launch tweaks (GitHub push dates do not reflect when these were actually built). */
  period?: string;
  type: string;
  stack: readonly string[];
  problem: string;
  constraints: readonly string[];
  approach: string;
  architecture: string;
  results: readonly CaseStudyResult[];
  limitations: readonly string[];
  reproducibility: string;
  media: readonly CaseStudyMedia[];
  repoUrl: `https://github.com/${string}`;
  liveUrl?: string;
  previousSlug: string;
  nextSlug: string;
};

export const CASE_STUDIES = [
  {
    approach:
      "SkillBridge scores a webcam interview by fusing three signal streams: transcribed speech content scored by an LLM against the question rubric, MediaPipe-based eye-contact estimation, and prosody/pacing features. Before settling on that architecture, the project ran a proper multimodal study on the First Impressions V2 interview dataset, comparing an XGBoost baseline on handcrafted audio/video/text features against transformer embeddings (wav2vec2 for audio, CLIP for vision, MPNet for text). The transformer-embedding fusion approach was evaluated with a grouped-by-source train/test split, specifically to prevent clips from the same speaker leaking across splits, and compared against the more common (and more optimistic) paper-style split used in prior work.",
    architecture:
      "React front-end captures the webcam/microphone session and renders the CV upload, question flow, and results report. A FastAPI backend extracts CV/role signals, selects five role-aware STAR questions, transcribes answers with OpenAI Whisper, and runs the multimodal scoring pipeline (PyTorch models plus GPT-4o-mini for content scoring) before composing a five-trait feedback report with PDF export. Session history is stored locally in SQLite for the demo/evaluation workflow.",
    constraints: [
      "First Impressions V2 is license-restricted, so the dataset itself is not redistributed in the repository.",
      "Supports three predefined target roles: Software Engineer, AI Engineer, and Data Scientist.",
      "Ships as a local FastAPI + React demo with SQLite session storage, not a hosted multi-user product.",
    ],
    limitations: [
      "The reported accuracy is an offline evaluation on First Impressions V2 clips, not a measurement of real interview outcomes.",
      "Interview footage can show an identifiable person, so only the two approved evidence images are used in production; the rest of the dataset and any other candidate footage stay unpublished.",
    ],
    media: [
      {
        alt: "Candidate interview session with webcam and question interface",
        fallbackSrc: "mockups/demo/assets/skillbridge-interview.jpeg",
        publicId: "skillbridge-interview",
      },
      {
        alt: "Five-trait interview feedback report",
        fallbackSrc: "mockups/demo/assets/skillbridge-results.jpeg",
        publicId: "skillbridge-results",
      },
    ],
    nextSlug: "llama-qlora-education-qa",
    period: "Oct 2025 - Jun 2026",
    previousSlug: "prestige-motors-showroom",
    problem:
      "Interview practice is expensive and hard to get honest, structured feedback on outside a handful of paid coaching sessions. SkillBridge asks whether a machine can watch a practice interview and return repeatable, trait-level feedback instead: a candidate uploads a CV and target role, answers five webcam questions, and receives a scored report across communication, confidence, domain knowledge, professionalism, and employability.",
    reproducibility:
      "The training methodology and curated metrics are published in the repository's docs/results.md, with the full write-up in docs/SkillBridge-Technical-Report.pdf and training-script notes in training/README.md. The dataset, trained model artifacts, transcripts, and embeddings are intentionally excluded because the source dataset is large and license-restricted; the active backend loads local multimodal fusion-head artifacts at runtime.",
    repoUrl: "https://github.com/Yehia-Alsaeed/skillbridge-ai-interviewer",
    results: [
      {
        detail:
          "1 - MAE on the interview-score label, grouped-by-source test split (95% CI 0.9055-0.9128)",
        label: "Interview score accuracy (grouped split)",
        value: "0.9094",
      },
      {
        detail: "Average of the six First Impressions V2 trait labels, grouped split",
        label: "Big Five average accuracy",
        value: "0.9089",
      },
      {
        detail:
          "Grouped split scored 0.9094 vs. 0.9148 on the more common but leakier paper-style split - the gap this project measured and reported",
        label: "Source-leakage gap vs. paper-style split",
        value: "0.0054",
      },
      {
        detail:
          "Normalized accuracy on the interview label: handcrafted-feature XGBoost baseline vs. the final transformer-embedding fusion model",
        label: "Improvement over handcrafted baseline",
        value: "0.0995 -> 0.2560 normalized accuracy",
      },
    ],
    role: "ML engineer + full-stack developer",
    slug: "skillbridge-ai-interviewer",
    stack: ["React", "FastAPI", "PyTorch", "OpenAI Whisper/GPT-4o-mini", "MediaPipe", "SQLite"],
    summary:
      "A multimodal AI interview coach that scores webcam mock interviews across five traits, evaluated with a leakage-aware protocol against a handcrafted-feature baseline.",
    title: "SkillBridge AI Interviewer",
    type: "Graduation project",
  },
  {
    approach:
      "The pipeline cleaned, deduplicated, and reformatted a higher-education question-answer dataset into instruction-style prompts, then measured out-of-the-box (baseline) performance for two open Llama Instruct models before fine-tuning each with QLoRA: 4-bit quantization plus LoRA adapters, using Hugging Face Transformers, TRL's SFTTrainer, and BitsAndBytes so both models could be trained on limited GPU hardware.",
    architecture:
      "A single reproducible script (llama_qlora_education_qa.py) runs the full experiment: dataset preprocessing, baseline inference for Llama 3.2 3B Instruct and Llama 3.1 8B Instruct, QLoRA fine-tuning of both, and evaluation with Exact Match and ROUGE, writing comparison CSVs and metrics JSON to an outputs/ directory.",
    constraints: [
      "Evaluated on a specific higher-education short-answer QA dataset subset, not a general-purpose QA benchmark.",
      "QLoRA with 4-bit quantization was chosen specifically to fit fine-tuning on limited GPU hardware.",
    ],
    limitations: [
      "Exact Match is a strict metric - it can undercount answers that are semantically correct but phrased differently from the target.",
      "The fine-tuned ROUGE scores are generated at runtime when the evaluation script executes rather than published as fixed numbers; only the baseline ROUGE-1/2/L values are fixed in the repository's results notes. Not measured as a static figure here.",
    ],
    media: [],
    nextSlug: "ai-study-planner-agents",
    previousSlug: "skillbridge-ai-interviewer",
    problem:
      "General-purpose instruction-tuned language models rarely answer short-form educational questions in the exact target format graders expect. This project measures that gap directly and asks how far parameter-efficient fine-tuning (QLoRA) can close it on limited hardware, without full-parameter retraining.",
    reproducibility:
      "The full pipeline is one script, llama_qlora_education_qa.py, covering data prep, baseline inference, QLoRA fine-tuning, and evaluation. Exact Match and baseline ROUGE figures are recorded in docs/results.md; safe illustrative prompts are published in sample_prompts.md so the input/output format can be inspected without the full dataset.",
    repoUrl: "https://github.com/Yehia-Alsaeed/llama-qlora-education-qa",
    results: [
      {
        detail: "Untuned model produced generic, non-target-format answers",
        label: "Llama 3.2 3B Instruct, baseline Exact Match",
        value: "0.000",
      },
      {
        detail: "Best exact-match result across both fine-tuned models in this experiment",
        label: "Llama 3.2 3B Instruct, QLoRA fine-tuned Exact Match",
        value: "0.660",
      },
      {
        detail:
          "Larger model, same fine-tuning recipe - still a strong improvement over its own baseline, but lower than the 3B run",
        label: "Llama 3.1 8B Instruct, QLoRA fine-tuned Exact Match",
        value: "0.595",
      },
      {
        detail: "Llama 3.1 8B Instruct, fixed baseline value before fine-tuning",
        label: "Baseline ROUGE-1 (8B)",
        value: "0.2212",
      },
    ],
    role: "NLP / ML engineer",
    slug: "llama-qlora-education-qa",
    stack: [
      "PyTorch",
      "Hugging Face Transformers",
      "TRL (SFTTrainer)",
      "PEFT/QLoRA",
      "BitsAndBytes",
    ],
    summary:
      "QLoRA fine-tuning took two open Llama Instruct models from 0% to as high as 66% exact-match on a short-answer educational QA benchmark - with the smaller model winning.",
    title: "Llama QLoRA Education QA",
    type: "LLM fine-tuning experiment",
  },
  {
    approach:
      "A student's subjects, exam dates, and available daily study hours are classified for difficulty using semantic similarity from a sentence-transformer (all-MiniLM-L6-v2), then handed to a four-stage CrewAI pipeline. Each agent owns one decision and produces a typed handoff, so a weak plan gets caught and corrected before it reaches the student instead of being generated once and shipped unchecked.",
    architecture:
      "Student Profiler turns the raw request into structured planning data; Study Plan Generator builds an initial day-by-day schedule using planning constraints and tool support (including a safe calculator tool); Plan Critic reviews the draft for overloaded days, missing buffer days, incorrect exam handling, and weak subject prioritization; Plan Optimizer produces the corrected final schedule strictly from the critique. A structured evaluation layer then parses the final plan and scores it, saving JSON/text artifacts and logging runs across model/temperature variations to TensorBoard.",
    constraints: [
      "Requires an OpenAI API key (planning/critique) and a Serper API key (tool-augmented search) to run.",
      "Schedules are produced by an LLM-in-the-loop pipeline with a rule-based critic, not a formally verified constraint solver.",
    ],
    limitations: [
      "No aggregate benchmark across many runs is published in the repository; the quality score below is from one illustrative sample run, not a dataset-wide average. Not measured beyond that example.",
      "The Critic's checks (overload, buffers, exam handling) catch a specific, defined set of plan quality issues - it is not a general guarantee of an optimal schedule.",
    ],
    media: [
      {
        alt: "Profiler-to-optimizer multi-agent workflow",
        fallbackSrc: "mockups/demo/assets/study-planner-architecture.webp",
        publicId: "study-planner-architecture",
      },
    ],
    nextSlug: "oxford-pet-binary-segmentation",
    previousSlug: "llama-qlora-education-qa",
    problem:
      "Turning a list of subjects and exam dates into a realistic day-by-day study schedule is a constraint-satisfaction problem most students solve badly by hand - overloading early days, forgetting buffer time before exams, or under-weighting harder subjects. This project asks whether a coordinated set of LLM agents, each with one job, can draft and self-correct a schedule that respects those constraints.",
    reproducibility:
      "The reusable src/study_planner package (agents, difficulty classifier, evaluation, CrewAI task/tool definitions) can be run natively or through the included Jupyter demo notebook. A full example input profile and its optimized output schedule are published under examples/, so the input/output contract is inspectable without an API key.",
    repoUrl: "https://github.com/Yehia-Alsaeed/ai-study-planner-agents",
    results: [
      {
        detail:
          "Regex-parsed self-critique score on the published sample optimized schedule (examples/sample_output.md)",
        label: "Sample run quality score",
        value: "9 / 10",
      },
      {
        detail:
          "Profiler, Generator, Critic, Optimizer - each with a distinct, typed responsibility",
        label: "Coordinated agent stages",
        value: "4",
      },
    ],
    role: "AI systems engineer",
    slug: "ai-study-planner-agents",
    stack: ["CrewAI", "GPT-4o-mini", "sentence-transformers", "TensorBoard"],
    summary:
      "A four-agent CrewAI system that drafts, critiques, and optimizes personalized study schedules with tool-augmented reasoning.",
    title: "AI Study Planner Agents",
    type: "Multi-agent AI system",
  },
  {
    approach:
      "Trimap annotations from the Oxford-IIIT Pet dataset were converted into binary foreground/background masks, then three architecturally distinct segmentation models were trained under the same preprocessing, augmentation, and fixed train/validation/test splits so the comparison isolates model choice rather than data handling: FCN-ResNet18 (lightweight fully convolutional baseline), SegNet-VGG16 (encoder-decoder with max-unpooling), and HRNet-W18 (multi-scale high-resolution fusion via timm).",
    architecture:
      "Each model shares the same PyTorch training loop, transfer-learned from its pretrained backbone. Evaluation runs on the fixed held-out test split and reports mIoU, pet IoU, Dice/F1, pixel accuracy, precision, and recall alongside parameter count and per-image inference time, so accuracy is never read in isolation from cost.",
    constraints: [
      "Binary segmentation only (pet vs. background) - not multi-class or instance segmentation.",
      "Metrics are reported on the fixed Oxford-IIIT Pet test split used throughout the experiment, not a held-out external dataset.",
    ],
    limitations: [
      "Reported inference time is a per-image benchmark from the experiment environment, not a measurement of a deployed, load-tested service. Not measured in production.",
      "Only HRNet's prediction grid is used as production evidence today; FCN and SegNet prediction images are approved as repository output but not yet wired into every production surface.",
    ],
    media: [
      {
        alt: "FCN predictions beside source and ground truth",
        fallbackSrc: "mockups/demo/assets/pets-fcn.webp",
        publicId: "pets-fcn",
      },
      {
        alt: "SegNet predictions beside source and ground truth",
        fallbackSrc: "mockups/demo/assets/pets-segnet.webp",
        publicId: "pets-segnet",
      },
      {
        alt: "HRNet predictions beside source and ground truth",
        fallbackSrc: "mockups/demo/assets/pets-hrnet.webp",
        publicId: "pets-hrnet",
      },
    ],
    nextSlug: "prestige-motors-showroom",
    previousSlug: "ai-study-planner-agents",
    problem:
      "Picking a segmentation model for a real product is rarely just about accuracy - inference speed and parameter count decide whether it can actually run where it's needed. This project asks which of three well-known architectures wins once accuracy, size, and speed are all measured on the same task and the same split.",
    reproducibility:
      "The full pipeline lives in one notebook, pet_segmentation_models.ipynb, covering preprocessing, training, evaluation, and comparison. The fixed train/validation/test split CSVs are published under preprocessing_artifacts/, and the final saved comparison metrics are in results_artifacts/model_results.csv.",
    repoUrl: "https://github.com/Yehia-Alsaeed/oxford-pet-binary-segmentation",
    results: [
      {
        detail:
          "Also the highest pet IoU (0.9198), Dice/F1 (0.9582), and pixel accuracy (0.9650) of the three models",
        label: "HRNet-W18 test mIoU",
        value: "0.9306",
      },
      {
        detail: "0.0633s per image, with the fewest parameters of the three models at 11.44M",
        label: "HRNet-W18 inference speed",
        value: "0.06s / image",
      },
      {
        detail: "SegNet-VGG16 measured 2.3331s per image at 29.46M parameters",
        label: "HRNet-W18 inference speed vs. SegNet-VGG16",
        value: "~37x faster",
      },
      {
        detail: "FCN-ResNet18: 0.9243 mIoU / 0.1919s; SegNet-VGG16: 0.9122 mIoU / 2.3331s",
        label: "Runner-up models",
        value: "FCN 0.9243 mIoU, SegNet 0.9122 mIoU",
      },
    ],
    role: "Computer vision engineer",
    slug: "oxford-pet-binary-segmentation",
    stack: ["PyTorch", "timm", "torchvision"],
    summary:
      "Three segmentation architectures benchmarked on the Oxford-IIIT Pet dataset; HRNet-W18 won on accuracy, parameter count, and inference speed at once.",
    title: "Oxford Pet Segmentation",
    type: "Computer vision benchmark",
  },
  {
    approach:
      "Built as a conventional MERN application with a clear customer/admin split: a React 19 + TypeScript + Vite front end talks to an Express 5 + MongoDB API over a typed REST contract, with Cloudinary handling all vehicle image uploads instead of storing binaries in the database.",
    architecture:
      "The frontend (frontend/) serves separate customer and admin experiences from the same deployment. The backend (backend/) exposes route groups for auth, cars, offers, reservations, customers, and uploads, backed by Mongoose models for users, cars, offers, and reservations. JWT authentication with role-based guards separates customer and admin access; Helmet, CORS, and per-route rate limiting harden the public API. Vercel serves the static frontend build alongside serverless Node API routes, configured through vercel.json.",
    constraints: [
      "Built and maintained solo, end to end (frontend, backend, deployment).",
      "The admin workflow assumes a single showroom operator, not a multi-tenant dealership platform.",
    ],
    limitations: [
      "No independent business-outcome metrics (traffic, conversion, completed sales) are published for the live deployment. Not measured.",
      "JWT secrets, the database URL, and Cloudinary credentials are required environment configuration and are intentionally not committed - only .env.example placeholders ship in the repository.",
    ],
    liveUrl: "https://prestige-motor.vercel.app/",
    media: [
      {
        alt: "Prestige Motors showroom homepage",
        fallbackSrc: "mockups/demo/assets/prestige-home.webp",
        publicId: "prestige-home",
      },
      {
        alt: "Responsive vehicle collection interface",
        fallbackSrc: "mockups/demo/assets/prestige-collection.webp",
        publicId: "prestige-collection",
      },
    ],
    nextSlug: "skillbridge-ai-interviewer",
    previousSlug: "oxford-pet-binary-segmentation",
    problem:
      "A premium car showroom needs more than a brochure site: customers want to browse inventory, reserve new vehicles, negotiate offers on used cars, and list their own vehicles for sale, while staff need to manage all of that without touching code. Prestige Motors is that platform, designed, built, and deployed end to end.",
    reproducibility:
      "The repository splits cleanly into backend/ (Express API, MongoDB models, controllers, routes, auth, uploads) and frontend/ (React/Vite/TypeScript UI for customers and admins), with vercel.json documenting the production build and rewrite configuration and .env.example documenting every required environment variable. The product itself is reproducible by visiting the live deployment directly.",
    repoUrl: "https://github.com/Yehia-Alsaeed/prestige-motors-showroom",
    results: [
      {
        detail: "Only project in the catalogue with an approved public deployment",
        label: "Deployment status",
        value: "Live in production",
      },
      {
        detail:
          "Reservations, used-car offers, customer listings, and the admin approval queue all shipped end-to-end",
        label: "Delivered customer + admin workflow",
        value: "Full reservation, offer, and approval pipeline",
      },
    ],
    role: "Solo full-stack developer",
    slug: "prestige-motors-showroom",
    stack: ["React", "TypeScript", "Vite", "Express", "MongoDB", "Cloudinary", "Vercel"],
    summary:
      "A deployed full-stack MERN showroom platform with customer reservations, a used-car offer pipeline, and a role-guarded admin dashboard.",
    title: "Prestige Motors Showroom",
    type: "Full-stack web application",
  },
] as const satisfies readonly CaseStudy[];
