import { createAuthClient } from "@neondatabase/auth";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { pathToFileURL } from "node:url";

import { normalizeAuthBaseUrl } from "./bootstrap-neon-admin";

type SignInInput = {
  baseUrl: string;
  email: string;
  password: string;
};

type SignInRequest = {
  email: string;
  password: string;
  callbackURL: string;
  fetchOptions: {
    headers: {
      Origin: string;
    };
  };
};

type SignInResponse = {
  data?: {
    user?: {
      id?: unknown;
      email?: unknown;
    };
  } | null;
  error?: {
    message?: string;
    code?: string;
    status?: number;
  } | null;
};

export function buildSignInRequest(input: SignInInput): SignInRequest {
  const origin = new URL(input.baseUrl).origin;

  return {
    email: input.email.trim(),
    password: input.password,
    callbackURL: origin,
    fetchOptions: {
      headers: {
        Origin: origin,
      },
    },
  };
}

function extractSignedInUserId(response: SignInResponse): string {
  const id = response.data?.user?.id;

  if (typeof id !== "string" || !id.trim()) {
    throw new Error("Neon Auth did not return a signed-in user ID");
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

const rl = createInterface({ input, output });

async function promptRequired(question: string, fallback?: string): Promise<string> {
  const label = fallback ? `${question} (${fallback}): ` : `${question}: `;
  const answer = await rl.question(label);
  return answer.trim() || fallback || "";
}

async function main(): Promise<void> {
  try {
    const baseUrl = normalizeAuthBaseUrl(
      await promptRequired("Neon Auth URL", process.env.NEON_AUTH_BASE_URL),
    );
    const email = await promptRequired("Admin email", process.env.ADMIN_EMAIL);
    const password = await promptHidden("Admin password (hidden): ");
    const expectedAdminId = process.env.ADMIN_USER_ID?.trim();

    const authClient = createAuthClient(baseUrl);
    const response = (await authClient.signIn.email(
      buildSignInRequest({ baseUrl, email, password }),
    )) as SignInResponse;

    if (response.error) {
      throw new Error(response.error.message || response.error.code || "Neon Auth sign-in failed");
    }

    const userId = extractSignedInUserId(response);

    output.write("\nNeon Auth accepted the email/password.\n");
    output.write(`Signed-in user ID: ${userId}\n`);

    if (expectedAdminId) {
      output.write(
        userId === expectedAdminId
          ? "Signed-in user ID matches ADMIN_USER_ID.\n"
          : "Signed-in user ID does NOT match ADMIN_USER_ID.\n",
      );
    }
  } finally {
    rl.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Admin login verification failed";
    output.write(`\nVerification failed: ${message}\n`);
    process.exitCode = 1;
  });
}
