"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";

import { loginAction } from "./auth/actions";
import type { LoginState } from "./auth/model";

const INITIAL_STATE: LoginState = {
  status: "idle",
  message: "",
};

export function LoginForm() {
  const [state, formAction, pending] = React.useActionState(loginAction, INITIAL_STATE);
  const hasError = state.status !== "idle";

  return (
    <form action={formAction} className="grid gap-6" noValidate>
      {hasError ? (
        <div
          aria-live="assertive"
          className="border-line bg-soft text-accent-text border-2 p-4 font-mono text-sm font-bold"
          role="alert"
          tabIndex={-1}
        >
          {state.message}
          {state.retryAfterSeconds ? ` Try again in ${state.retryAfterSeconds} seconds.` : ""}
        </div>
      ) : null}

      <FormField id="admin-email" label="Email">
        <input
          autoComplete="username"
          className="border-line bg-paper text-ink min-h-12 border-2 px-4 text-base"
          name="email"
          required
          type="email"
        />
      </FormField>

      <FormField id="admin-password" label="Password">
        <input
          autoComplete="current-password"
          className="border-line bg-paper text-ink min-h-12 border-2 px-4 text-base"
          name="password"
          required
          type="password"
        />
      </FormField>

      <Button disabled={pending} type="submit">
        {pending ? "Checking" : "Sign in"}
      </Button>
    </form>
  );
}
