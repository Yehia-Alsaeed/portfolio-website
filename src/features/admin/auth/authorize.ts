import { cache } from "react";

import { readAdminUserId } from "@/lib/env/server";

import { auth } from "./server";
import { AdminAuthError, type AdminAccess, type AuthSessionResult } from "./model";

export type AdminAuthorizerDependencies = {
  getSession: () => Promise<AuthSessionResult>;
  readAdminUserId: () => string;
};

export function createAdminAuthorizer(dependencies: AdminAuthorizerDependencies) {
  return async function getAdminAccess(): Promise<AdminAccess> {
    let result: AuthSessionResult;

    try {
      result = await dependencies.getSession();
    } catch {
      return { status: "expired" };
    }

    if (result.error) return { status: "expired" };

    const user = result.data?.user;
    if (!user?.id) return { status: "anonymous" };

    if (user.id !== dependencies.readAdminUserId()) return { status: "unauthorized" };

    return { status: "authorized", user: { id: user.id, name: user.name ?? null } };
  };
}

export const getAdminAccess = cache(
  createAdminAuthorizer({
    getSession: () => auth.getSession(),
    readAdminUserId,
  }),
);

export async function requireAdmin(): Promise<{ id: string; name?: string | null }> {
  const access = await getAdminAccess();

  if (access.status !== "authorized") {
    throw new AdminAuthError(access.status);
  }

  return access.user;
}

export async function requireAdminAccess<T>(
  getAccess: () => Promise<AdminAccess>,
  read: () => Promise<T> | T,
): Promise<T> {
  const access = await getAccess();

  if (access.status !== "authorized") {
    throw new AdminAuthError(access.status);
  }

  return read();
}
