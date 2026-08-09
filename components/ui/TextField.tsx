'use client';

import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label: string;
  /** Helper text under the field. */
  hint?: ReactNode;
  /** Shows a `*` after the label. Does not set the `required` attribute — validity
   *  is enforced by the save button, so the browser bubble would be noise. */
  required?: boolean;
  /** Right-aligned inside the field, e.g. `8 / 25`. */
  counter?: string;
  /** Right-aligned unit inside the field, e.g. `฿`. */
  suffix?: string;
};

export function TextField({
  label,
  hint,
  required = false,
  counter,
  suffix,
  id,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const trailing = counter ?? suffix;

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {required && <span className="ml-0.5 text-negative">*</span>}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-describedby={hintId}
          className={`h-11 w-full rounded-xl border border-line bg-surface px-4 text-sm text-ink transition-colors placeholder:text-ink-faint hover:border-line-strong ${
            trailing ? 'pr-16' : ''
          }`}
          {...props}
        />
        {trailing && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium tabular-nums text-ink-faint">
            {trailing}
          </span>
        )}
      </div>
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-ink-faint">
          {hint}
        </p>
      )}
    </div>
  );
}
