"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";

import { buildContactMailto } from "./mailto";

const controlClass =
  "border-line bg-paper text-ink min-h-11 w-full rounded-none border px-3 py-2 outline-none focus-visible:outline-3";

export function ContactForm() {
  const [invalid, setInvalid] = React.useState(false);
  const alertRef = React.useRef<HTMLParagraphElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      setInvalid(true);
      requestAnimationFrame(() => alertRef.current?.focus());
      return;
    }

    setInvalid(false);
    const data = new FormData(form);
    window.location.href = buildContactMailto({
      email: String(data.get("email") ?? ""),
      inquiryType: String(data.get("inquiryType") ?? ""),
      message: String(data.get("message") ?? ""),
      name: String(data.get("name") ?? ""),
    });
  }

  return (
    <form
      className="border-line grid gap-5 border-t pt-8 md:grid-cols-2"
      noValidate
      onSubmit={handleSubmit}
    >
      {invalid ? (
        <p
          className="text-accent-text border-accent border-l-4 pl-3 font-mono text-xs font-bold md:col-span-2"
          ref={alertRef}
          role="alert"
          tabIndex={-1}
        >
          Complete every field with a valid email address.
        </p>
      ) : null}
      <FormField id="contact-inquiry-type" label="Inquiry type">
        <select className={controlClass} defaultValue="" name="inquiryType" required>
          <option disabled value="">
            Select an inquiry
          </option>
          <option>Job opportunity</option>
          <option>Freelance project</option>
          <option>Collaboration</option>
          <option>Other</option>
        </select>
      </FormField>
      <FormField id="contact-name" label="Name">
        <input
          autoComplete="name"
          className={controlClass}
          maxLength={100}
          name="name"
          required
          type="text"
        />
      </FormField>
      <FormField id="contact-email" label="Email">
        <input
          autoComplete="email"
          className={controlClass}
          maxLength={254}
          name="email"
          required
          type="email"
        />
      </FormField>
      <FormField id="contact-message" label="Message">
        <textarea
          className={`${controlClass} min-h-32 resize-y`}
          maxLength={5000}
          name="message"
          required
        />
      </FormField>
      <div className="flex flex-col items-start gap-3 md:col-span-2 md:flex-row md:items-center">
        <Button type="submit">Prepare email</Button>
        <p className="text-dim font-mono text-[0.6875rem]">
          Opens your email app. Direct email is always available above.
        </p>
      </div>
    </form>
  );
}
