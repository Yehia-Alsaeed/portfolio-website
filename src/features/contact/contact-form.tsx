"use client";

import * as React from "react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";

import { submitContact } from "./actions";
import { buildContactMailto } from "./mailto";
import { INITIAL_CONTACT_STATE } from "./model";

const controlClass =
  "border-line bg-paper text-ink min-h-11 w-full rounded-none border px-3 py-2 outline-none focus-visible:outline-3";

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContact, INITIAL_CONTACT_STATE);
  const formRef = React.useRef<HTMLFormElement>(null);
  const alertRef = React.useRef<HTMLParagraphElement>(null);
  const previousStatus = React.useRef(state.status);

  React.useEffect(() => {
    if (state.status === previousStatus.current) return;
    previousStatus.current = state.status;

    if (state.status === "success") {
      formRef.current?.reset();
      return;
    }

    if (state.status !== "idle") {
      alertRef.current?.focus();
    }
  }, [state.status]);

  const values = state.values;
  const showMailtoFallback =
    (state.status === "unavailable" || state.status === "rate-limited") && values !== undefined;

  const buttonLabel = isPending
    ? "Sending..."
    : state.status === "success"
      ? "Message saved"
      : "Send message";

  return (
    <form
      action={formAction}
      className="border-line grid gap-5 border-t pt-8 md:grid-cols-2"
      noValidate
      ref={formRef}
    >
      <input
        aria-hidden="true"
        autoComplete="off"
        className="sr-only"
        name="website"
        tabIndex={-1}
        type="text"
      />
      {state.status !== "idle" ? (
        <p
          aria-live={state.status === "success" ? "polite" : undefined}
          className="text-accent-text border-accent border-l-4 pl-3 font-mono text-xs font-bold md:col-span-2"
          ref={alertRef}
          role={state.status === "success" ? "status" : "alert"}
          tabIndex={-1}
        >
          {state.message}
        </p>
      ) : null}
      <FormField
        {...(state.fieldErrors.inquiryType ? { error: state.fieldErrors.inquiryType } : {})}
        id="contact-inquiry-type"
        label="Inquiry type"
      >
        <select
          className={controlClass}
          defaultValue={values?.inquiryType ?? ""}
          name="inquiryType"
          required
        >
          <option disabled value="">
            Select an inquiry
          </option>
          <option>Job opportunity</option>
          <option>Freelance project</option>
          <option>Collaboration</option>
          <option>Other</option>
        </select>
      </FormField>
      <FormField
        {...(state.fieldErrors.name ? { error: state.fieldErrors.name } : {})}
        id="contact-name"
        label="Name"
      >
        <input
          autoComplete="name"
          className={controlClass}
          defaultValue={values?.name}
          maxLength={100}
          name="name"
          required
          type="text"
        />
      </FormField>
      <FormField
        {...(state.fieldErrors.email ? { error: state.fieldErrors.email } : {})}
        id="contact-email"
        label="Email"
      >
        <input
          autoComplete="email"
          className={controlClass}
          defaultValue={values?.email}
          maxLength={254}
          name="email"
          required
          type="email"
        />
      </FormField>
      <FormField
        {...(state.fieldErrors.message ? { error: state.fieldErrors.message } : {})}
        id="contact-message"
        label="Message"
      >
        <textarea
          className={`${controlClass} min-h-32 resize-y`}
          defaultValue={values?.message}
          maxLength={5000}
          name="message"
          required
        />
      </FormField>
      <div className="flex flex-col items-start gap-3 md:col-span-2 md:flex-row md:items-center">
        <Button disabled={isPending} type="submit">
          {buttonLabel}
        </Button>
        {showMailtoFallback && values ? (
          <a
            className="text-dim font-mono text-[0.6875rem] underline"
            href={buildContactMailto(values)}
          >
            Email this message instead
          </a>
        ) : (
          <p className="text-dim font-mono text-[0.6875rem]">
            Your message is saved directly. Direct email is always available above.
          </p>
        )}
      </div>
    </form>
  );
}
