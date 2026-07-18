export type Profile = {
  name: string;
  email: string;
  location: string;
  role: string;
  status: string;
  githubUrl: string;
  linkedinUrl: string;
  cvUrl: string;
};

export const PROFILE = {
  cvUrl: "/cv/Yehia_Alsaeed_CV_AI.pdf",
  email: "yehias3eed11@gmail.com",
  githubUrl: "https://github.com/Yehia-Alsaeed",
  linkedinUrl: "https://www.linkedin.com/in/yehia-alsaeed",
  location: "Cairo, Egypt",
  name: "Yehia Alsaeed",
  role: "AI/ML Engineer + Web Dev",
  status: "Open to roles and clients",
} as const satisfies Profile;
