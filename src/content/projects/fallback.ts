import type { ProjectFallbackRecord } from "@/features/projects/model";

/**
 * The reviewed catalogue, and the source of truth for everything a project
 * card renders. Live GitHub data no longer overwrites any of it (see
 * catalogue.ts): repo blurbs are written for people browsing source, and they
 * had been replacing these measured results with generic prose.
 *
 * Every `outcome.value` is traceable. The five case-study projects trace to
 * docs/content/phase-4-claim-ledger.md; the rest trace to their repository's
 * own README results table. Where a repository publishes no measurement, the
 * outcome states a concrete capability rather than an invented figure.
 */
export const FALLBACK_PROJECTS = [
  {
    description:
      "Scores recorded interviews on the Big Five traits by fusing speech, vision and text embeddings, evaluated on a grouped split that prevents person-level leakage.",
    language: "Python",
    name: "SkillBridge AI Interviewer",
    outcome: { label: "Interview score accuracy", value: "0.9094" },
    slug: "skillbridge-ai-interviewer",
    stack: ["PyTorch", "FastAPI", "wav2vec2", "CLIP"],
    topics: ["llm", "multimodal", "fastapi", "pytorch", "openai"],
  },
  {
    description:
      "Fine-tunes Llama 3.2 3B Instruct for educational question answering using 4-bit QLoRA adapters, measured against the untuned baseline on the same evaluation set.",
    language: "Python",
    name: "Llama QLoRA Education QA",
    outcome: { label: "Exact Match after tuning", value: "0.00 to 0.66" },
    slug: "llama-qlora-education-qa",
    stack: ["Llama 3.2", "QLoRA", "PEFT", "TRL"],
    topics: ["llm", "fine-tuning", "qlora", "transformers", "peft"],
  },
  {
    description:
      "Builds and refines personalised study schedules through four cooperating agents - profiler, generator, critic and optimizer - with sentence-transformer difficulty scoring.",
    language: "Python",
    name: "AI Study Planner Agents",
    outcome: { label: "Cooperating agent stages", value: "4" },
    slug: "ai-study-planner-agents",
    stack: ["CrewAI", "GPT-4o mini", "Sentence-Transformers"],
    topics: ["multi-agent", "crewai", "llm", "agents"],
  },
  {
    description:
      "Benchmarks FCN-ResNet18, SegNet-VGG16 and HRNet-W18 on binary pet segmentation, selecting HRNet on the accuracy-versus-latency trade-off.",
    language: "Python",
    name: "Oxford Pet Segmentation",
    outcome: { label: "Test mIoU, at 0.06s per image", value: "0.93" },
    slug: "oxford-pet-binary-segmentation",
    stack: ["PyTorch", "HRNet-W18", "Oxford-IIIT Pet"],
    topics: ["computer-vision", "segmentation", "pytorch", "hrnet"],
  },
  {
    description:
      "Detects and classifies handwritten digits with YOLOv8, trained on the 10,000-image HashiDigits set and validated on multi-digit clusters and real handwriting.",
    language: "Python",
    name: "YOLOv8 Digit Detector",
    outcome: { label: "mAP50-95 on the test split", value: "99.1%" },
    slug: "yolov8-handwritten-digit-detector",
    stack: ["YOLOv8", "Ultralytics", "Roboflow", "OpenCV"],
    topics: ["computer-vision", "yolov8", "object-detection", "opencv"],
  },
  {
    description:
      "MERN showroom platform covering vehicle listings, customer reservations and offers, and a role-gated admin approval pipeline with Cloudinary media handling.",
    language: "TypeScript",
    name: "Prestige Motors Showroom",
    outcome: { label: "Deployed and publicly reachable", value: "Live" },
    slug: "prestige-motors-showroom",
    stack: ["React", "Express", "MongoDB", "Cloudinary"],
    topics: ["fullstack", "react", "express", "mongodb", "mern"],
  },
  {
    description:
      "Flutter trip planner with Firebase auth and Firestore storage, Geoapify place discovery, and a day-by-day itinerary that rejects overlapping entries.",
    language: "Dart",
    name: "TripMate Travel Planner",
    outcome: { label: "Itinerary with no schedule clashes", value: "Day-by-day" },
    slug: "trip-mate-travel-planner-app",
    stack: ["Flutter", "Firebase", "Geoapify", "Provider"],
    topics: ["mobile", "flutter", "firebase"],
  },
  {
    description:
      "Predicts credit-card churn on an imbalanced dataset, comparing ROS against SMOTE across tuned logistic regression, SVM, random forest and a soft-voting ensemble.",
    language: "Python",
    name: "Bank Churn Classification",
    outcome: { label: "Churn F1, Random Forest + SMOTE", value: "0.854" },
    slug: "bank-churn-imbalanced-classification",
    stack: ["scikit-learn", "SMOTE", "GridSearchCV"],
    topics: ["machine-learning", "data-science", "scikit-learn", "imbalanced-classification"],
  },
  {
    description:
      "Three supervised pipelines - two classification, one regression - covering preprocessing, feature selection, hyperparameter tuning and learning-curve diagnostics.",
    language: "Python",
    name: "Supervised ML Notebooks",
    outcome: { label: "Best ROC AUC across the pipelines", value: "0.909" },
    slug: "supervised-ml-classification-regression",
    stack: ["scikit-learn", "pandas", "Matplotlib"],
    topics: ["machine-learning", "data-science", "scikit-learn"],
  },
  {
    description:
      "Cleans a 9,994-row retail dataset down to 6,777 analysable orders, then quantifies where discounting erodes profit across categories, regions and shipping modes.",
    language: "Python",
    name: "Superstore Sales Analysis",
    outcome: { label: "Of cleaned orders sold at a loss", value: "7.22%" },
    slug: "superstore-sales-data-analysis",
    stack: ["pandas", "Matplotlib", "Seaborn"],
    topics: ["data-science", "data-analysis", "eda", "pandas"],
  },
  {
    description:
      "Applies a fixed Random Fourier Feature mapping as a kernel-inspired layer ahead of a small PyTorch classifier, tuned across five variants on white-wine quality.",
    language: "Python",
    name: "RFF Wine Quality Classifier",
    outcome: { label: "Test accuracy, baseline to tuned", value: "0.486 to 0.571" },
    slug: "rff-wine-quality-classifier",
    stack: ["PyTorch", "Random Fourier Features", "TensorBoard"],
    topics: ["machine-learning", "pytorch", "kernel-methods"],
  },
  {
    description:
      "Coordinates three baggage robots across a grid airport with dynamic obstacles, comparing baseline Q-learning against PSO-tuned and GWO swarm-mode policies.",
    language: "Python",
    name: "Airport Luggage Robots",
    outcome: { label: "Learning policies compared", value: "3" },
    slug: "airport-luggage-robot-planning",
    stack: ["Q-learning", "PSO", "GWO", "Pygame"],
    topics: ["reinforcement-learning", "q-learning", "machine-learning"],
  },
  {
    description:
      "Unity 2D action-adventure with physics-driven movement, trap and enemy hazards, checkpoint respawning, trigger-based dialogue and a multi-state boss fight.",
    language: "C#",
    name: "Lost in the Woods",
    outcome: { label: "Multi-state combat and scene flow", value: "Boss AI" },
    slug: "lost-in-the-woods-unity-platformer",
    stack: ["Unity 2D", "C#", "TextMesh Pro"],
    topics: ["unity", "game-development", "csharp"],
  },
  {
    description:
      "Connect6 engine using depth-limited minimax with alpha-beta pruning, move ordering and transposition tables to survive the two-stones-per-turn branching factor.",
    language: "Python",
    name: "Connect Six AI",
    outcome: { label: "Board sizes, 19x19 down to 9x9", value: "4" },
    slug: "connect-six-ai-game",
    stack: ["Python", "Pygame", "Minimax"],
    topics: ["game-ai", "pygame", "minimax"],
  },
  {
    description:
      "Native Win32 strategy game whose AI generates every legal move, searches recursively with alphaBetaMax/Min, and prunes branches that cannot improve the result.",
    language: "C++",
    name: "Game-Tree Board Game",
    outcome: { label: "Pruned game-tree move search", value: "Alpha-beta" },
    slug: "game-tree-alpha-beta-board-game",
    stack: ["C++", "Win32", "GDI"],
    topics: ["game-ai", "cpp", "minimax"],
  },
  {
    description:
      "Distributed inventory system where Swing branch clients queue orders through a central coordinator that serialises access to per-category resource servers.",
    language: "Java",
    name: "Socket Clothing Store",
    outcome: { label: "Coordinator-serialised shared access", value: "Mutual exclusion" },
    slug: "java-socket-clothing-store-system",
    stack: ["Java 21", "TCP Sockets", "Swing"],
    topics: ["distributed-systems", "sockets", "java"],
  },
  {
    description:
      "Publish/subscribe notification service over Java RMI - publishers post to topic channels and subscribers receive live updates through remote callbacks.",
    language: "Java",
    name: "RMI Event Notifications",
    outcome: { label: "Topic routing via remote callbacks", value: "Pub/sub" },
    slug: "java-rmi-event-notification-system",
    stack: ["Java RMI", "Swing", "Pub/Sub"],
    topics: ["distributed-systems", "java-rmi", "pub-sub"],
  },
] as const satisfies readonly ProjectFallbackRecord[];
