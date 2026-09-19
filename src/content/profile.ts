export type Profile = {
  name: string;
  email: string;
  location: string;
  role: string;
  status: string;
  githubUrl: string;
  linkedinUrl: string;
};

export const PROFILE = {
  email: "yehias3eed11@gmail.com",
  githubUrl: "https://github.com/Yehia-Alsaeed",
  linkedinUrl: "https://www.linkedin.com/in/yehia-alsaeed",
  location: "Cairo, Egypt",
  name: "Yehia Alsaeed",
  role: "Freelance web developer + AI/ML engineer",
  status: "Open to roles and clients",
} as const satisfies Profile;
