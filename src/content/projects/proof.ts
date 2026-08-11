import type { CaseStudy } from "@/content/projects/case-studies";

export type ProofNode = {
  id: string;
  label: string;
  technology: string;
  responsibility: string;
  input: string;
  output: string;
};

export type ArchitectureProof = {
  slug: CaseStudy["slug"];
  nodes: readonly ProofNode[];
  flow: readonly string[];
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

// Every node below is grounded directly in the matching CASE_STUDIES
// entry's `architecture`/`approach` prose (see src/content/projects/case-studies.ts)
// and the approved Phase 4 claim ledger - no metric, timing, or architectural
// claim is introduced here that isn't already published there.
export const ARCHITECTURE_PROOFS = [
  {
    flow: [
      "Interview session",
      "FastAPI orchestration",
      "CV/role analysis + transcription",
      "Multimodal scoring",
      "Feedback report",
    ],
    nodes: [
      {
        id: "capture-ui",
        input: "Candidate webcam/mic session, uploaded CV, and selected target role.",
        label: "Capture & UI",
        output: "Session recording and uploaded CV sent to the FastAPI backend.",
        responsibility:
          "Captures the webcam/microphone interview session and renders the CV upload, question flow, and results report.",
        technology: "React",
      },
      {
        id: "orchestration",
        input: "Uploaded CV, target role, and recorded webcam/mic session from the UI.",
        label: "FastAPI Orchestration",
        output: "Selected STAR questions and routed audio for transcription and scoring.",
        responsibility:
          "Coordinates the backend pipeline: receives the session, selects five role-aware STAR questions, and routes answers to transcription.",
        technology: "FastAPI",
      },
      {
        id: "cv-role-signals",
        input: "Uploaded CV and target role (Software Engineer, AI Engineer, or Data Scientist).",
        label: "CV/Role Signals",
        output: "Structured CV/role signals feeding question selection and scoring.",
        responsibility:
          "Extracts structured CV and role signals used to select the five role-aware STAR questions.",
        technology: "FastAPI",
      },
      {
        id: "transcription",
        input: "Recorded webcam/mic answers routed from orchestration.",
        label: "Transcription",
        output: "Text transcripts of each answer for the multimodal scoring pipeline.",
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
        responsibility:
          "Fuses transcribed content, CV/role signals, MediaPipe-based eye-contact estimation, and prosody/pacing features to score the interview across five traits.",
        technology: "PyTorch + GPT-4o-mini",
      },
      {
        id: "report-output",
        input: "Per-trait scores from the multimodal scoring pipeline.",
        label: "Report Output",
        output: "Five-trait interview feedback report (PDF) returned to the candidate.",
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
  },
  {
    flow: [
      "Education QA data",
      "Baseline evaluation",
      "QLoRA fine-tuning",
      "Held-out evaluation",
      "Result artifacts",
    ],
    nodes: [
      {
        id: "dataset-prep",
        input: "Raw higher-education question-answer dataset subset.",
        label: "Dataset Preparation",
        output: "Instruction-formatted prompts for baseline inference and fine-tuning.",
        responsibility:
          "Cleans, deduplicates, and reformats the higher-education QA dataset into instruction-style prompts.",
        technology: "Python",
      },
      {
        id: "baseline-eval",
        input: "Instruction-formatted prompts from dataset preparation.",
        label: "Baseline Evaluation",
        output: "Baseline Exact Match and ROUGE scores for both untuned models.",
        responsibility:
          "Measures out-of-the-box performance of Llama 3.2 3B Instruct and Llama 3.1 8B Instruct before any fine-tuning.",
        technology: "Hugging Face Transformers",
      },
      {
        id: "qlora-fine-tuning",
        input: "Instruction-formatted prompts and each model's baseline weights.",
        label: "QLoRA Fine-Tuning",
        output: "Two QLoRA-fine-tuned models (3B and 8B).",
        responsibility:
          "Fine-tunes both Llama Instruct models with 4-bit quantization and LoRA adapters on limited GPU hardware.",
        technology: "PEFT/QLoRA + BitsAndBytes + TRL SFTTrainer",
      },
      {
        id: "evaluation",
        input: "Fine-tuned model outputs on the held-out prompts.",
        label: "Evaluation",
        output: "Exact Match and ROUGE comparison scores for both fine-tuned models.",
        responsibility:
          "Scores each fine-tuned model with Exact Match and ROUGE against the baseline.",
        technology: "Exact Match + ROUGE",
      },
      {
        id: "result-artifacts",
        input: "Evaluation scores for both models.",
        label: "Result Artifacts",
        output: "outputs/ directory with comparison CSVs and metrics JSON.",
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
  },
  {
    flow: ["Student profile", "Draft study plan", "Critique", "Optimization", "Scored output"],
    nodes: [
      {
        id: "profiler",
        input: "Student's subjects, exam dates, and available daily study hours.",
        label: "Student Profiler",
        output: "Structured planning data with per-subject difficulty classification.",
        responsibility:
          "Turns the raw request into structured planning data, classifying subject difficulty by semantic similarity.",
        technology: "sentence-transformers (all-MiniLM-L6-v2)",
      },
      {
        id: "generator",
        input: "Structured planning data from the Profiler.",
        label: "Study Plan Generator",
        output: "Initial day-by-day draft study schedule.",
        responsibility:
          "Builds an initial day-by-day schedule from the planning data, using planning constraints and a safe calculator tool.",
        technology: "CrewAI + GPT-4o-mini",
      },
      {
        id: "critic",
        input: "Initial draft schedule from the Generator.",
        label: "Plan Critic",
        output: "Structured critique of the draft schedule's weaknesses.",
        responsibility:
          "Reviews the draft for overloaded days, missing buffer days, incorrect exam handling, and weak subject prioritization.",
        technology: "CrewAI + GPT-4o-mini",
      },
      {
        id: "optimizer",
        input: "Draft schedule and the Critic's structured critique.",
        label: "Plan Optimizer",
        output: "Corrected final day-by-day study schedule.",
        responsibility:
          "Produces the corrected final schedule strictly from the Critic's feedback.",
        technology: "CrewAI + GPT-4o-mini",
      },
      {
        id: "evaluation-output",
        input: "Corrected final schedule from the Optimizer.",
        label: "Evaluation & Output",
        output: "Scored plan with saved JSON/text artifacts and TensorBoard run logs.",
        responsibility:
          "Parses the final plan, scores it, and logs runs across model/temperature variations.",
        technology: "TensorBoard + JSON/text artifacts",
      },
    ],
    readingOrder: ["profiler", "generator", "critic", "optimizer", "evaluation-output"],
    slug: "ai-study-planner-agents",
  },
  {
    flow: [
      "Pet masks + fixed splits",
      "FCN + SegNet + HRNet",
      "Shared evaluation",
      "Model comparison",
    ],
    nodes: [
      {
        id: "preprocessing",
        input: "Oxford-IIIT Pet trimap annotations.",
        label: "Preprocessing & Fixed Splits",
        output: "Binary masks and fixed train/validation/test split CSVs.",
        responsibility:
          "Converts trimap annotations into binary foreground/background masks and fixes the train/validation/test splits shared by all three models.",
        technology: "Python",
      },
      {
        id: "fcn-branch",
        input: "Preprocessed masks and fixed training split.",
        label: "FCN-ResNet18",
        output: "Trained FCN-ResNet18 predictions for evaluation.",
        responsibility:
          "Trains the lightweight fully convolutional baseline, transfer-learned from its pretrained ResNet18 backbone.",
        technology: "PyTorch + torchvision",
      },
      {
        id: "segnet-branch",
        input: "Preprocessed masks and fixed training split.",
        label: "SegNet-VGG16",
        output: "Trained SegNet-VGG16 predictions for evaluation.",
        responsibility:
          "Trains the encoder-decoder model with max-unpooling, transfer-learned from its pretrained VGG16 backbone.",
        technology: "PyTorch + torchvision",
      },
      {
        id: "hrnet-branch",
        input: "Preprocessed masks and fixed training split.",
        label: "HRNet-W18",
        output: "Trained HRNet-W18 predictions for evaluation.",
        responsibility:
          "Trains the multi-scale high-resolution fusion model, transfer-learned from its pretrained backbone via timm.",
        technology: "PyTorch + timm",
      },
      {
        id: "shared-evaluation",
        input: "Predictions from FCN, SegNet, and HRNet on the fixed test split.",
        label: "Shared Evaluation",
        output: "Per-model metrics: accuracy, size, and speed measured identically.",
        responsibility:
          "Evaluates all three models on the same fixed held-out test split, reporting mIoU, pet IoU, Dice/F1, pixel accuracy, precision, recall, parameter count, and per-image inference time.",
        technology: "PyTorch",
      },
      {
        id: "comparison-output",
        input: "Per-model metrics from shared evaluation.",
        label: "Comparison Output",
        output: "results_artifacts/model_results.csv with the full model comparison.",
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
  },
  {
    flow: [
      "Customer/admin UI",
      "Express API",
      "Guarded routes",
      "MongoDB + Cloudinary",
      "Vercel deployment",
    ],
    nodes: [
      {
        id: "customer-admin-ui",
        input: "Customer browsing/reservation actions and admin management actions.",
        label: "Customer/Admin UI",
        output: "Typed REST requests to the Express API.",
        responsibility: "Serves separate customer and admin experiences from the same deployment.",
        technology: "React 19 + TypeScript + Vite",
      },
      {
        id: "express-api",
        input: "Typed REST requests from the customer/admin UI.",
        label: "Express API",
        output: "Routed requests to the guarded route groups.",
        responsibility:
          "Exposes a typed REST contract and hardens the public API with Helmet, CORS, and per-route rate limiting.",
        technology: "Express 5",
      },
      {
        id: "guarded-routes",
        input: "Routed API requests and JWT credentials.",
        label: "Guarded Route Groups",
        output: "Authorized calls to MongoDB models and Cloudinary uploads.",
        responsibility:
          "Separates customer and admin access across route groups for auth, cars, offers, reservations, customers, and uploads.",
        technology: "JWT + role-based guards",
      },
      {
        id: "mongodb",
        input: "Authorized reads/writes from the guarded route groups.",
        label: "MongoDB",
        output: "Vehicle, offer, reservation, and user records.",
        responsibility:
          "Persists users, cars, offers, and reservations behind the guarded route groups via Mongoose models.",
        technology: "MongoDB + Mongoose",
      },
      {
        id: "cloudinary",
        input: "Vehicle images uploaded through the guarded upload routes.",
        label: "Cloudinary",
        output: "Hosted vehicle image URLs referenced by MongoDB records.",
        responsibility:
          "Handles all vehicle image uploads instead of storing binaries in the database.",
        technology: "Cloudinary",
      },
      {
        id: "vercel-deployment",
        input: "Frontend build output and backend serverless functions.",
        label: "Vercel Deployment",
        output: "Live production deployment.",
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

  const readingOrderSet = new Set(proof.readingOrder);
  if (
    readingOrderSet.size !== proof.readingOrder.length ||
    readingOrderSet.size !== nodeIdSet.size ||
    ![...readingOrderSet].every((id) => nodeIdSet.has(id))
  ) {
    errors.push(`${proof.slug}: readingOrder must list every node exactly once`);
  }

  if (proof.flow.length < 2 || proof.flow.some((stage) => stage.trim().length === 0)) {
    errors.push(`${proof.slug}: flow must contain at least two non-empty stages`);
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
