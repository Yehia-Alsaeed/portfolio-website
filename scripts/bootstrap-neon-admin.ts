import { createAuthClient } from "@neondatabase/auth";
import { pathToFileURL } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

type SignupInput = {
  baseUrl: string;
  email: string;
  name: string;
  password: string;
};

type SignupResponse = {
  data?: {
    user?: {
      id?: unknown;
    };
  } | null;
  error?: {
    message?: string;
    code?: string;
    status?: number;
  } | null;
  user?: {
    id?: unknown;
  };
};

export function normalizeAuthBaseUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "");

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("NEON_AUTH_BASE_URL must be a valid http(s) URL");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("NEON_AUTH_BASE_URL must be a valid http(s) URL");
  }

  return trimmed;
}

export function buildAdminSignupInput(input: SignupInput): SignupInput {
  const baseUrl = normalizeAuthBaseUrl(input.baseUrl);
  const email = input.email.trim();
  const name = input.name.trim();

  if (!email || !email.includes("@")) {
    throw new Error("Admin email must be a valid email address");
  }

  if (!name) {
    throw new Error("Admin name is required");
  }

  if (input.password.length < 8) {
    throw new Error("Admin password must be at least 8 characters");
  }

  return { baseUrl, email, name, password: input.password };
}

export function extractCreatedUserId(response: SignupResponse): string {
  const id = response.data?.user?.id ?? response.user?.id;

  if (typeof id !== "string" || !id.trim()) {
    throw new Error("Neon Auth did not return a created user ID");
  }

  return id;
}

async function promptHidden(question: string): Promise<string> {
  output.write(question);

  const chunks: string[] = [];
  const wasRaw = input.isRaw;

  input.setRawMode?.(true);
  input.resume();

  return await new Promise((resolve, reject) => {
    function cleanup(): void {
      input.setRawMode?.(wasRaw);
      input.off("data", onData);
    }

    function onData(buffer: Buffer): void {
      const value = buffer.toString("utf8");

      if (value === "\u0003") {
        cleanup();
        output.write("\n");
        reject(new Error("Cancelled"));
        return;
      }

      if (value === "\r" || value === "\n" || value === "\r\n") {
        cleanup();
        output.write("\n");
        resolve(chunks.join(""));
        return;
      }

      if (value === "\b" || value === "\u007f") {
        chunks.pop();
        return;
      }

      chunks.push(value);
    }

    input.on("data", onData);
  });
}

async function promptRequired(question: string, fallback?: string): Promise<string> {
  const label = fallback ? `${question} (${fallback}): ` : `${question}: `;
  const answer = await rl.question(label);
  return answer.trim() || fallback || "";
}

const rl = createInterface({ input, output });

async function main(): Promise<void> {
  try {
    const baseUrl = await promptRequired("Neon Auth URL", process.env.NEON_AUTH_BASE_URL);
    const email = await promptRequired("Admin email", process.env.ADMIN_EMAIL);
    const name = await promptRequired("Admin name", process.env.ADMIN_NAME ?? "Yehia Alsaeed");
    const password = await promptHidden("Admin password (hidden): ");
    const confirmation = await promptHidden("Confirm admin password (hidden): ");

    if (password !== confirmation) {
      throw new Error("Admin passwords did not match");
    }

    const signupInput = buildAdminSignupInput({ baseUrl, email, name, password });
    const authClient = createAuthClient(signupInput.baseUrl);
    const response = (await authClient.signUp.email({
      email: signupInput.email,
      name: signupInput.name,
      password: signupInput.password,
    })) as SignupResponse;

    if (response.error) {
      throw new Error(response.error.message || response.error.code || "Neon Auth signup failed");
    }

    const userId = extractCreatedUserId(response);

    output.write("\nCreated Neon Auth admin credential user.\n");
    output.write(`ADMIN_USER_ID=${userId}\n\n`);
    output.write("Set that exact ADMIN_USER_ID in Vercel Preview/Production, then redeploy.\n");
    output.write("Do not commit this value to the repository.\n");
  } finally {
    rl.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Admin bootstrap failed";
    output.write(`\nBootstrap failed: ${message}\n`);
    process.exitCode = 1;
  });
}
