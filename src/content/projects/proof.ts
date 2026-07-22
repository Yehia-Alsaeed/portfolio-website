import type { CaseStudy } from "@/content/projects/case-studies";

export type ProofNode = {
  id: string;
  label: string;
  technology: string;
  responsibility: string;
  input: string;
  output: string;
  position: { x: number; y: number };
};

export type ProofEdge = { id: string; source: string; target: string; label?: string };

export type ArchitectureProof = {
  slug: CaseStudy["slug"];
  title: string;
  nodes: readonly ProofNode[];
  edges: readonly ProofEdge[];
  readingOrder: readonly string[];
};

export type ModelComparison = {
  id: "fcn" | "segnet" | "hrnet";
  label: string;
  imagePublicId: "pets-fcn" | "pets-segnet" | "pets-hrnet";
  miou: string;
  inferenceTime: string;
  parameters: string;
  note: string;
};

export type AgentReplayStep = {
  id: "profiler" | "generator" | "critic" | "optimizer";
  label: string;
  instruction: string;
  input: string;
  output: string;
  decision: string;
};

// Every node/edge below is grounded directly in the matching CASE_STUDIES
// entry's `architecture`/`approach` prose (see src/content/projects/case-studies.ts)
// and the approved Phase 4 claim ledger - no metric, timing, or architectural
// claim is introduced here that isn't already published there.
export const ARCHITECTURE_PROOFS = [
  {
    edges: [
      { id: "capture-ui__orchestration", source: "capture-ui", target: "orchestration" },
      { id: "orchestration__cv-role-signals", source: "orchestration", target: "cv-role-signals" },
      { id: "orchestration__transcription", source: "orchestration", target: "transcription" },
      {
        id: "cv-role-signals__multimodal-scoring",
        source: "cv-role-signals",
        target: "multimodal-scoring",
      },
      {
        id: "transcription__multimodal-scoring",
        source: "transcription",
        target: "multimodal-scoring",
      },
      {
        id: "multimodal-scoring__report-output",
        source: "multimodal-scoring",
        target: "report-output",
      },
    ],
    nodes: [
      {
        id: "capture-ui",
        input: "Candidate webcam/mic session, uploaded CV, and selected target role.",
        label: "Capture & UI",
        output: "Session recording and uploaded CV sent to the FastAPI backend.",
        position: { x: 0, y: 160 },
        responsibility:
          "Captures the webcam/microphone interview session and renders the CV upload, question flow, and results report.",
        technology: "React",
      },
      {
        id: "orchestration",
        input: "Uploaded CV, target role, and recorded webcam/mic session from the UI.",
        label: "FastAPI Orchestration",
        output: "Selected STAR questions and routed audio for transcription and scoring.",
        position: { x: 260, y: 160 },
        responsibility:
          "Coordinates the backend pipeline: receives the session, selects five role-aware STAR questions, and routes answers to transcription.",
        technology: "FastAPI",
      },
      {
        id: "cv-role-signals",
        input: "Uploaded CV and target role (Software Engineer, AI Engineer, or Data Scientist).",
        label: "CV/Role Signals",
        output: "Structured CV/role signals feeding question selection and scoring.",
        position: { x: 520, y: 40 },
        responsibility:
          "Extracts structured CV and role signals used to select the five role-aware STAR questions.",
        technology: "FastAPI",
      },
      {
        id: "transcription",
        input: "Recorded webcam/mic answers routed from orchestration.",
        label: "Transcription",
        output: "Text transcripts of each answer for the multimodal scoring pipeline.",
        position: { x: 520, y: 280 },
        responsibility: "Transcribes the candidate's recorded answers to each STAR question.",
        technology: "OpenAI Whisper",
      },
      {
        id: "multimodal-scoring",
        input:
          "Transcripts, CV/role signals, and the captured session for eye-contact/prosody features.",
        label: "Multimodal Scoring",
        output:
          "Per-trait scores for communication, confidence, domain knowledge, professionalism, and employability.",
        position: { x: 780, y: 160 },
        responsibility:
          "Fuses transcribed content, CV/role signals, MediaPipe-based eye-contact estimation, and prosody/pacing features to score the interview across five traits.",
        technology: "PyTorch + GPT-4o-mini",
      },
      {
        id: "report-output",
        input: "Per-trait scores from the multimodal scoring pipeline.",
        label: "Report Output",
        output: "Five-trait interview feedback report (PDF) returned to the candidate.",
        position: { x: 1040, y: 160 },
        responsibility:
          "Composes the five-trait feedback report and exports it as a PDF, with session history stored locally in SQLite.",
        technology: "PDF export",
      },
    ],
    readingOrder: [
      "capture-ui",
      "orchestration",
      "cv-role-signals",
      "transcription",
      "multimodal-scoring",
      "report-output",
    ],
    slug: "skillbridge-ai-interviewer",
    title: "SkillBridge AI Interviewer architecture",
  },
  {
    edges: [
      { id: "dataset-prep__baseline-eval", source: "dataset-prep", target: "baseline-eval" },
      {
        id: "baseline-eval__qlora-fine-tuning",
        source: "baseline-eval",
        target: "qlora-fine-tuning",
      },
      { id: "qlora-fine-tuning__evaluation", source: "qlora-fine-tuning", target: "evaluation" },
      { id: "evaluation__result-artifacts", source: "evaluation", target: "result-artifacts" },
    ],
    nodes: [
      {
        id: "dataset-prep",
        input: "Raw higher-education question-answer dataset subset.",
        label: "Dataset Preparation",
        output: "Instruction-formatted prompts for baseline inference and fine-tuning.",
        position: { x: 0, y: 160 },
        responsibility:
          "Cleans, deduplicates, and reformats the higher-education QA dataset into instruction-style prompts.",
        technology: "Python",
      },
      {
        id: "baseline-eval",
        input: "Instruction-formatted prompts from dataset preparation.",
        label: "Baseline Evaluation",
        output: "Baseline Exact Match and ROUGE scores for both untuned models.",
        position: { x: 260, y: 160 },
        responsibility:
          "Measures out-of-the-box performance of Llama 3.2 3B Instruct and Llama 3.1 8B Instruct before any fine-tuning.",
        technology: "Hugging Face Transformers",
      },
      {
        id: "qlora-fine-tuning",
        input: "Instruction-formatted prompts and each model's baseline weights.",
        label: "QLoRA Fine-Tuning",
        output: "Two QLoRA-fine-tuned models (3B and 8B).",
        position: { x: 520, y: 160 },
        responsibility:
          "Fine-tunes both Llama Instruct models with 4-bit quantization and LoRA adapters on limited GPU hardware.",
        technology: "PEFT/QLoRA + BitsAndBytes + TRL SFTTrainer",
      },
      {
        id: "evaluation",
        input: "Fine-tuned model outputs on the held-out prompts.",
        label: "Evaluation",
        output: "Exact Match and ROUGE comparison scores for both fine-tuned models.",
        position: { x: 780, y: 160 },
        responsibility:
          "Scores each fine-tuned model with Exact Match and ROUGE against the baseline.",
        technology: "Exact Match + ROUGE",
      },
      {
        id: "result-artifacts",
        input: "Evaluation scores for both models.",
        label: "Result Artifacts",
        output: "outputs/ directory with comparison CSVs and metrics JSON.",
        position: { x: 1040, y: 160 },
        responsibility:
          "Writes comparison CSVs and metrics JSON documenting baseline-vs-fine-tuned results.",
        technology: "CSV + JSON",
      },
    ],
    readingOrder: [
      "dataset-prep",
      "baseline-eval",
      "qlora-fine-tuning",
      "evaluation",
      "result-artifacts",
    ],
    slug: "llama-qlora-education-qa",
    title: "Llama QLoRA Education QA pipeline",
  },
  {
    edges: [
      { id: "profiler__generator", source: "profiler", target: "generator" },
      { id: "generator__critic", source: "generator", target: "critic" },
      { id: "critic__optimizer", source: "critic", target: "optimizer" },
      { id: "optimizer__evaluation-output", source: "optimizer", target: "evaluation-output" },
    ],
    nodes: [
      {
        id: "profiler",
        input: "Student's subjects, exam dates, and available daily study hours.",
        label: "Student Profiler",
        output: "Structured planning data with per-subject difficulty classification.",
        position: { x: 0, y: 160 },
        responsibility:
          "Turns the raw request into structured planning data, classifying subject difficulty by semantic similarity.",
        technology: "sentence-transformers (all-MiniLM-L6-v2)",
      },
      {
        id: "generator",
        input: "Structured planning data from the Profiler.",
        label: "Study Plan Generator",
        output: "Initial day-by-day draft study schedule.",
        position: { x: 260, y: 160 },
        responsibility:
          "Builds an initial day-by-day schedule from the planning data, using planning constraints and a safe calculator tool.",
        technology: "CrewAI + GPT-4o-mini",
      },
      {
        id: "critic",
        input: "Initial draft schedule from the Generator.",
        label: "Plan Critic",
        output: "Structured critique of the draft schedule's weaknesses.",
        position: { x: 520, y: 160 },
        responsibility:
          "Reviews the draft for overloaded days, missing buffer days, incorrect exam handling, and weak subject prioritization.",
        technology: "CrewAI + GPT-4o-mini",
      },
      {
        id: "optimizer",
        input: "Draft schedule and the Critic's structured critique.",
        label: "Plan Optimizer",
        output: "Corrected final day-by-day study schedule.",
        position: { x: 780, y: 160 },
        responsibility:
          "Produces the corrected final schedule strictly from the Critic's feedback.",
        technology: "CrewAI + GPT-4o-mini",
      },
      {
        id: "evaluation-output",
        input: "Corrected final schedule from the Optimizer.",
        label: "Evaluation & Output",
        output: "Scored plan with saved JSON/text artifacts and TensorBoard run logs.",
        position: { x: 1040, y: 160 },
        responsibility:
          "Parses the final plan, scores it, and logs runs across model/temperature variations.",
        technology: "TensorBoard + JSON/text artifacts",
      },
    ],
    readingOrder: ["profiler", "generator", "critic", "optimizer", "evaluation-output"],
    slug: "ai-study-planner-agents",
    title: "AI Study Planner Agents pipeline",
  },
  {
    edges: [
      { id: "preprocessing__fcn-branch", source: "preprocessing", target: "fcn-branch" },
      { id: "preprocessing__segnet-branch", source: "preprocessing", target: "segnet-branch" },
      { id: "preprocessing__hrnet-branch", source: "preprocessing", target: "hrnet-branch" },
      { id: "fcn-branch__shared-evaluation", source: "fcn-branch", target: "shared-evaluation" },
      {
        id: "segnet-branch__shared-evaluation",
        source: "segnet-branch",
        target: "shared-evaluation",
      },
      {
        id: "hrnet-branch__shared-evaluation",
        source: "hrnet-branch",
        target: "shared-evaluation",
      },
      {
        id: "shared-evaluation__comparison-output",
        source: "shared-evaluation",
        target: "comparison-output",
      },
    ],
    nodes: [
      {
        id: "preprocessing",
        input: "Oxford-IIIT Pet trimap annotations.",
        label: "Preprocessing & Fixed Splits",
        output: "Binary masks and fixed train/validation/test split CSVs.",
        position: { x: 0, y: 240 },
        responsibility:
          "Converts trimap annotations into binary foreground/background masks and fixes the train/validation/test splits shared by all three models.",
        technology: "Python",
      },
      {
        id: "fcn-branch",
        input: "Preprocessed masks and fixed training split.",
        label: "FCN-ResNet18",
        output: "Trained FCN-ResNet18 predictions for evaluation.",
        position: { x: 300, y: 40 },
        responsibility:
          "Trains the lightweight fully convolutional baseline, transfer-learned from its pretrained ResNet18 backbone.",
        technology: "PyTorch + torchvision",
      },
      {
        id: "segnet-branch",
        input: "Preprocessed masks and fixed training split.",
        label: "SegNet-VGG16",
        output: "Trained SegNet-VGG16 predictions for evaluation.",
        position: { x: 300, y: 240 },
        responsibility:
          "Trains the encoder-decoder model with max-unpooling, transfer-learned from its pretrained VGG16 backbone.",
        technology: "PyTorch + torchvision",
      },
      {
        id: "hrnet-branch",
        input: "Preprocessed masks and fixed training split.",
        label: "HRNet-W18",
        output: "Trained HRNet-W18 predictions for evaluation.",
        position: { x: 300, y: 440 },
        responsibility:
          "Trains the multi-scale high-resolution fusion model, transfer-learned from its pretrained backbone via timm.",
        technology: "PyTorch + timm",
      },
      {
        id: "shared-evaluation",
        input: "Predictions from FCN, SegNet, and HRNet on the fixed test split.",
        label: "Shared Evaluation",
        output: "Per-model metrics: accuracy, size, and speed measured identically.",
        position: { x: 600, y: 240 },
        responsibility:
          "Evaluates all three models on the same fixed held-out test split, reporting mIoU, pet IoU, Dice/F1, pixel accuracy, precision, recall, parameter count, and per-image inference time.",
        technology: "PyTorch",
      },
      {
        id: "comparison-output",
        input: "Per-model metrics from shared evaluation.",
        label: "Comparison Output",
        output: "results_artifacts/model_results.csv with the full model comparison.",
        position: { x: 900, y: 240 },
        responsibility:
          "Saves the final comparison metrics across all three models for side-by-side analysis.",
        technology: "CSV",
      },
    ],
    readingOrder: [
      "preprocessing",
      "fcn-branch",
      "segnet-branch",
      "hrnet-branch",
      "shared-evaluation",
      "comparison-output",
    ],
    slug: "oxford-pet-binary-segmentation",
    title: "Oxford Pet Segmentation pipeline",
  },
  {
    edges: [
      { id: "customer-admin-ui__express-api", source: "customer-admin-ui", target: "express-api" },
      { id: "express-api__guarded-routes", source: "express-api", target: "guarded-routes" },
      { id: "guarded-routes__mongodb", source: "guarded-routes", target: "mongodb" },
      { id: "guarded-routes__cloudinary", source: "guarded-routes", target: "cloudinary" },
      { id: "mongodb__vercel-deployment", source: "mongodb", target: "vercel-deployment" },
      { id: "cloudinary__vercel-deployment", source: "cloudinary", target: "vercel-deployment" },
    ],
    nodes: [
      {
        id: "customer-admin-ui",
        input: "Customer browsing/reservation actions and admin management actions.",
        label: "Customer/Admin UI",
        output: "Typed REST requests to the Express API.",
        position: { x: 0, y: 160 },
        responsibility: "Serves separate customer and admin experiences from the same deployment.",
        technology: "React 19 + TypeScript + Vite",
      },
      {
        id: "express-api",
        input: "Typed REST requests from the customer/admin UI.",
        label: "Express API",
        output: "Routed requests to the guarded route groups.",
        position: { x: 260, y: 160 },
        responsibility:
          "Exposes a typed REST contract and hardens the public API with Helmet, CORS, and per-route rate limiting.",
        technology: "Express 5",
      },
      {
        id: "guarded-routes",
        input: "Routed API requests and JWT credentials.",
        label: "Guarded Route Groups",
        output: "Authorized calls to MongoDB models and Cloudinary uploads.",
        position: { x: 520, y: 160 },
        responsibility:
          "Separates customer and admin access across route groups for auth, cars, offers, reservations, customers, and uploads.",
        technology: "JWT + role-based guards",
      },
      {
        id: "mongodb",
        input: "Authorized reads/writes from the guarded route groups.",
        label: "MongoDB",
        output: "Vehicle, offer, reservation, and user records.",
        position: { x: 780, y: 60 },
        responsibility:
          "Persists users, cars, offers, and reservations behind the guarded route groups via Mongoose models.",
        technology: "MongoDB + Mongoose",
      },
      {
        id: "cloudinary",
        input: "Vehicle images uploaded through the guarded upload routes.",
        label: "Cloudinary",
        output: "Hosted vehicle image URLs referenced by MongoDB records.",
        position: { x: 780, y: 260 },
        responsibility:
          "Handles all vehicle image uploads instead of storing binaries in the database.",
        technology: "Cloudinary",
      },
      {
        id: "vercel-deployment",
        input: "Frontend build output and backend serverless functions.",
        label: "Vercel Deployment",
        output: "Live production deployment.",
        position: { x: 1040, y: 160 },
        responsibility:
          "Serves the static frontend build alongside serverless Node API routes in production.",
        technology: "Vercel",
      },
    ],
    readingOrder: [
      "customer-admin-ui",
      "express-api",
      "guarded-routes",
      "mongodb",
      "cloudinary",
      "vercel-deployment",
    ],
    slug: "prestige-motors-showroom",
    title: "Prestige Motors Showroom architecture",
  },
] as const satisfies readonly ArchitectureProof[];

export function getArchitectureProof(slug: string): ArchitectureProof | undefined {
  return ARCHITECTURE_PROOFS.find((proof) => proof.slug === slug);
}

export function validateArchitectureProof(proof: ArchitectureProof): readonly string[] {
  const errors: string[] = [];
  const nodeIds = proof.nodes.map((node) => node.id);
  const nodeIdSet = new Set(nodeIds);
  if (nodeIdSet.size !== nodeIds.length) errors.push(`${proof.slug}: duplicate node ids`);

  const edgeIds = proof.edges.map((edge) => edge.id);
  if (new Set(edgeIds).size !== edgeIds.length) errors.push(`${proof.slug}: duplicate edge ids`);

  for (const edge of proof.edges) {
    if (!nodeIdSet.has(edge.source)) {
      errors.push(`${proof.slug}: edge ${edge.id} has an unknown source "${edge.source}"`);
    }
    if (!nodeIdSet.has(edge.target)) {
      errors.push(`${proof.slug}: edge ${edge.id} has an unknown target "${edge.target}"`);
    }
  }

  const readingOrderSet = new Set(proof.readingOrder);
  if (
    readingOrderSet.size !== proof.readingOrder.length ||
    readingOrderSet.size !== nodeIdSet.size ||
    ![...readingOrderSet].every((id) => nodeIdSet.has(id))
  ) {
    errors.push(`${proof.slug}: readingOrder must list every node exactly once`);
  }

  for (const node of proof.nodes) {
    for (const field of ["label", "technology", "responsibility", "input", "output"] as const) {
      if (node[field].length === 0) errors.push(`${proof.slug}: node ${node.id} missing ${field}`);
    }
  }

  return errors;
}

// Sourced from CASE_STUDIES' oxford-pet-binary-segmentation results and
// docs/content/phase-4-claim-ledger.md. FCN's parameter count is not
// published in either source, so it is marked "Not published" rather than
// estimated.
export const MODEL_COMPARISONS = [
  {
    id: "fcn",
    imagePublicId: "pets-fcn",
    inferenceTime: "0.1919s",
    label: "FCN-ResNet18",
    miou: "0.9243",
    note: "Lightweight fully convolutional baseline, transfer-learned from a pretrained ResNet18 backbone.",
    parameters: "Not published",
  },
  {
    id: "segnet",
    imagePublicId: "pets-segnet",
    inferenceTime: "2.3331s",
    label: "SegNet-VGG16",
    miou: "0.9122",
    note: "Encoder-decoder architecture with max-unpooling, transfer-learned from a pretrained VGG16 backbone.",
    parameters: "29.46M",
  },
  {
    id: "hrnet",
    imagePublicId: "pets-hrnet",
    inferenceTime: "0.0633s",
    label: "HRNet-W18",
    miou: "0.9306",
    note: "Highest mIoU, pet IoU, Dice/F1, and pixel accuracy of the three models, with the fewest parameters and fastest inference.",
    parameters: "11.44M",
  },
] as const satisfies readonly ModelComparison[];

// Sourced from the ai-study-planner-agents repository's published
// examples/sample_input.json and examples/sample_output.md at main commit
// 8a7ac6ecf742625b7dc91b7507a6d66ec2d852b7. The Optimizer's `decision` field
// quotes that file's own "Changes Made" section verbatim. No API call, model
// inference, or invented intermediate transcript is used.
export const AGENT_REPLAY_STEPS = [
  {
    decision:
      "Ranks NLP and Deep Learning as the highest priority given their harder difficulty and later exam days.",
    id: "profiler",
    input:
      "Raw request: 4 subjects, 4 daily study hours, start day 1 (NLP hard/day 14, Deep Learning hard/day 12, Security medium/day 10, Database medium/day 8).",
    instruction:
      "Classify each subject's difficulty via semantic similarity and structure the raw request into planning data.",
    label: "Student Profiler",
    output:
      "Structured planning data: NLP (hard, exam day 14), Deep Learning (hard, exam day 12), Security (medium, exam day 10), Database (medium, exam day 8).",
  },
  {
    decision:
      "Distributes study hours toward the harder, later-exam subjects first, while staying within the 4-hour daily limit.",
    id: "generator",
    input: "Structured planning data from the Profiler.",
    instruction:
      "Build an initial day-by-day schedule from the planning data, using planning constraints and a safe calculator tool.",
    label: "Study Plan Generator",
    output: "Initial draft schedule allocating study hours across the 14-day window.",
  },
  {
    decision:
      "Requires a dedicated buffer day immediately before every exam day and a hard cap of 4 study hours per day.",
    id: "critic",
    input: "Initial draft schedule from the Generator.",
    instruction:
      "Review the draft for overloaded days, missing buffer days, incorrect exam handling, and weak subject prioritization.",
    label: "Plan Critic",
    output:
      "Structured critique flagging any day exceeding the 4-hour limit and any exam missing its buffer day.",
  },
  {
    decision:
      "Kept every day within the 4-hour daily limit, reserved the day before each exam as a buffer day, and avoided scheduling any subject after its exam day.",
    id: "optimizer",
    input: "Draft schedule and the Critic's structured critique.",
    instruction: "Produce the corrected final schedule strictly from the Critic's feedback.",
    label: "Plan Optimizer",
    output:
      "Final 14-day schedule with a buffer day before each exam (days 7, 9, 11, 13) and every day within the 4-hour limit. Sample run quality score: 9/10.",
  },
] as const satisfies readonly AgentReplayStep[];
