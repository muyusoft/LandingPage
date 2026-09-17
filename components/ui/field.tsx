"use client";

import { useState, type FocusEvent, type ReactNode } from "react";

type FieldShellProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
};

export function FieldShell({ label, htmlFor, error, children }: Readonly<FieldShellProps>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-warn" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

type ValidatableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

// Valida al perder foco (onBlur), no al teclear — sección 9 del spec.
export function useFieldValidation(errorMessage: string) {
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);

  function handleBlur(event: FocusEvent<ValidatableElement>) {
    setTouched(true);
    setIsValid(event.currentTarget.checkValidity());
  }

  const invalid = touched && !isValid;

  return { error: invalid ? errorMessage : undefined, invalid, handleBlur };
}

export const fieldControlClasses =
  "w-full rounded-input border border-line bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors focus:border-accent-2 aria-invalid:border-warn";
