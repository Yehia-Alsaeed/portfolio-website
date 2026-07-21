import type { ProjectFallbackRecord } from "@/features/projects/model";

export const FALLBACK_PROJECTS = [
  {
    description:
      "Multimodal mock-interview coach — scores webcam interviews on five traits using speech transcription, eye-contact estimation, and LLM scoring.",
    language: "Python",
    name: "SkillBridge AI Interviewer",
    slug: "skillbridge-ai-interviewer",
    stars: 0,
    topics: ["llm", "multimodal", "fastapi", "pytorch", "openai"],
  },
  {
    description:
      "Fine-tuned Llama 3.x with QLoRA for educational QA — Exact Match improved 0.00 to 0.66 with a full evaluation pipeline.",
    language: "Python",
    name: "Llama QLoRA Education QA",
    slug: "llama-qlora-education-qa",
    stars: 0,
    topics: ["llm", "fine-tuning", "qlora", "transformers", "peft"],
  },
  {
    description:
      "Multi-agent system (profiler, generator, critic, optimizer) generating and refining study schedules with tool-augmented reasoning.",
    language: "Python",
    name: "AI Study Planner Agents",
    slug: "ai-study-planner-agents",
    stars: 0,
    topics: ["multi-agent", "crewai", "llm", "agents"],
  },
  {
    description:
      "Benchmarked FCN-ResNet18, SegNet-VGG16 and HRNet-W18 — selected HRNet at 0.93 mIoU / 0.06s per image.",
    language: "Python",
    name: "Oxford Pet Segmentation",
    slug: "oxford-pet-binary-segmentation",
    stars: 0,
    topics: ["computer-vision", "segmentation", "pytorch", "hrnet"],
  },
  {
    description:
      "Handwritten digit detection on HashiDigits — localizes and classifies digits in images.",
    language: "Python",
    name: "YOLOv8 Digit Detector",
    slug: "yolov8-handwritten-digit-detector",
    stars: 0,
    topics: ["computer-vision", "yolov8", "object-detection", "opencv"],
  },
  {
    description:
      "MERN showroom platform — reservations, used-car offers, role-based admin, JWT auth, Cloudinary pipeline. Deployed.",
    language: "TypeScript",
    name: "Prestige Motors Showroom",
    slug: "prestige-motors-showroom",
    stars: 0,
    topics: ["fullstack", "react", "express", "mongodb", "mern"],
  },
  {
    description:
      "Flutter travel planner — Firebase auth and Firestore, Geoapify place discovery, itinerary scheduling.",
    language: "Dart",
    name: "TripMate Travel Planner",
    slug: "trip-mate-travel-planner-app",
    stars: 0,
    topics: ["mobile", "flutter", "firebase"],
  },
  {
    description:
      "Credit-card churn with KMeans features, SMOTE/ROS imbalance handling, tuned classifiers and ensembles.",
    language: "Jupyter Notebook",
    name: "Bank Churn Classification",
    slug: "bank-churn-imbalanced-classification",
    stars: 0,
    topics: ["machine-learning", "data-science", "scikit-learn", "imbalanced-classification"],
  },
  {
    description:
      "Classification and regression — preprocessing, feature selection, hyperparameter tuning, model evaluation.",
    language: "Jupyter Notebook",
    name: "Supervised ML Notebooks",
    slug: "supervised-ml-classification-regression",
    stars: 0,
    topics: ["machine-learning", "data-science", "scikit-learn"],
  },
  {
    description:
      "EDA on sales, profit, discounts, shipping time and product performance with a full visualization suite.",
    language: "Jupyter Notebook",
    name: "Superstore Sales Analysis",
    slug: "superstore-sales-data-analysis",
    stars: 0,
    topics: ["data-science", "data-analysis", "eda", "pandas"],
  },
  {
    description:
      "PyTorch Random Fourier Features classifier — 3-class and binary experiments with TensorBoard tracking.",
    language: "Jupyter Notebook",
    name: "RFF Wine Quality Classifier",
    slug: "rff-wine-quality-classifier",
    stars: 0,
    topics: ["machine-learning", "pytorch", "kernel-methods"],
  },
  {
    description:
      "Multi-robot transport simulation — Q-learning with PSO hyperparameter tuning and GWO swarm optimization.",
    language: "Jupyter Notebook",
    name: "Airport Luggage Robots",
    slug: "airport-luggage-robot-planning",
    stars: 0,
    topics: ["reinforcement-learning", "q-learning", "machine-learning"],
  },
  {
    description:
      "Unity 2D action-adventure platformer — traps, enemies, checkpoints, dialogue, boss combat.",
    language: "C#",
    name: "Lost in the Woods",
    slug: "lost-in-the-woods-unity-platformer",
    stars: 0,
    topics: ["unity", "game-development", "csharp"],
  },
  {
    description:
      "Pygame Connect6 with heuristic AI — minimax search and alpha-beta pruning opponents.",
    language: "Python",
    name: "Connect Six AI",
    slug: "connect-six-ai-game",
    stars: 0,
    topics: ["game-ai", "pygame", "minimax"],
  },
  {
    description:
      "Windows C++ board game — game-tree search, recursive backtracking, minimax with alpha-beta pruning.",
    language: "C++",
    name: "Game-Tree Board Game",
    slug: "game-tree-alpha-beta-board-game",
    stars: 0,
    topics: ["game-ai", "cpp", "minimax"],
  },
  {
    description:
      "Socket-based distributed inventory simulation — Swing branch clients, resource servers, mutual exclusion.",
    language: "Java",
    name: "Socket Clothing Store",
    slug: "java-socket-clothing-store-system",
    stars: 0,
    topics: ["distributed-systems", "sockets", "java"],
  },
  {
    description:
      "Publish/subscribe event system over Java RMI — topic routing, callbacks, service monitoring.",
    language: "Java",
    name: "RMI Event Notifications",
    slug: "java-rmi-event-notification-system",
    stars: 0,
    topics: ["distributed-systems", "java-rmi", "pub-sub"],
  },
] as const satisfies readonly ProjectFallbackRecord[];
