import * as React from "react";

export type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactElement<{
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }>;
};

export function FormField({ children, error, hint, id, label }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const control = React.Children.only(children);

  return (
    <div className="flex flex-col gap-2">
      <label
        className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.12em] text-dim"
        htmlFor={id}
      >
        {label}
      </label>
      {React.cloneElement(control, {
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        ...(error ? { "aria-invalid": true } : {}),
        id,
      })}
      {hint ? (
        <p className="font-mono text-[0.6875rem] tracking-[0.06em] text-dim" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="font-mono text-[0.6875rem] font-bold tracking-[0.06em] text-accent" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
