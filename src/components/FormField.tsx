"use client";

// src/components/FormField.tsx
// Small accessible form primitives shared by the registration flows.
// They keep the education wizard readable and guarantee consistent
// label / hint / error wiring (aria-describedby, aria-invalid).
import { useEffect, useRef, useState } from "react";
import {
  caretAfterDigit,
  formatDateForDisplay,
  formatDateInput,
  parseDateInput,
} from "@/lib/date";

export const inputBaseClass =
  "w-full rounded-lg border bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-400";

export function inputClass(hasError?: boolean) {
  return `${inputBaseClass} ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/30"
      : "border-gray-300 focus:border-primary-green focus:ring-primary-green/30"
  }`;
}

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  optionalLabel?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function Field({
  id,
  label,
  required = false,
  optionalLabel,
  hint,
  error,
  className = "",
  children,
}: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && (
          <span className="ms-1 text-red-500" aria-hidden="true">
            *
          </span>
        )}
        {optionalLabel && (
          <span className="ms-1 font-normal text-gray-400">({optionalLabel})</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600"
        >
          <svg
            className="size-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  hasError?: boolean;
  hintId?: string;
  errorId?: string;
}

export function TextInput({
  id,
  hasError,
  hintId,
  errorId,
  className = "",
  ...props
}: TextInputProps) {
  return (
    <input
      id={id}
      aria-invalid={hasError || undefined}
      aria-describedby={errorId ?? hintId}
      className={`${inputClass(hasError)} ${className}`}
      {...props}
    />
  );
}

interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  id: string;
  /** ISO `YYYY-MM-DD`; anything else renders as an empty field. */
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  hintId?: string;
  errorId?: string;
  /**
   * Replaces the shared input styling instead of extending it – the mask needs
   * a full class list, otherwise the focus and error styles of the surrounding
   * form would fight over the same utilities.
   */
  className?: string;
}

/**
 * Date field shown and edited as `dd/mm/yyyy`.
 *
 * A native `<input type="date">` would render the date with the format of the
 * visitor's operating system, so the mask is hand written: it inserts the
 * separators, rejects impossible days and months and only reports an ISO value
 * once a complete, real date has been entered.
 */
export function DateInput({
  id,
  value,
  onChange,
  hasError,
  hintId,
  errorId,
  className,
  ...props
}: DateInputProps) {
  const [text, setText] = useState(() => formatDateForDisplay(value));
  const [syncedValue, setSyncedValue] = useState(value);
  const caret = useRef<number | null>(null);
  const input = useRef<HTMLInputElement>(null);

  // Reformat when the value is replaced from the outside (form reset, restored
  // draft). Adjusting the state while rendering – instead of in an effect –
  // keeps the field in sync without a second render pass; while typing, `text`
  // stays the source of truth and is left alone.
  if (value !== syncedValue) {
    setSyncedValue(value);
    if (parseDateInput(text).iso !== value) {
      setText(formatDateForDisplay(value));
    }
  }

  // The mask shifts the caret whenever a separator appears, so it is restored
  // once the reformatted value has been committed to the DOM.
  useEffect(() => {
    if (caret.current === null) return;
    const position = caret.current;
    caret.current = null;
    input.current?.setSelectionRange(position, position);
  }, [text]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const digitsBeforeCaret = (raw.slice(0, event.target.selectionStart ?? raw.length).match(/\d/g) ?? [])
      .length;

    const next = formatDateInput(raw);
    setText(next);

    const parsed = parseDateInput(next);
    onChange(parsed.valid && parsed.iso ? parsed.iso : "");

    caret.current = caretAfterDigit(next, digitsBeforeCaret);
  };

  return (
    <input
      ref={input}
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      dir="ltr"
      placeholder="dd/mm/yyyy"
      maxLength={10}
      value={text}
      onChange={handleChange}
      aria-invalid={hasError || undefined}
      aria-describedby={errorId ?? hintId}
      className={className || inputClass(hasError)}
      {...props}
    />
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  hasError?: boolean;
  hintId?: string;
  errorId?: string;
}

export function TextArea({
  id,
  hasError,
  hintId,
  errorId,
  className = "",
  ...props
}: TextAreaProps) {
  return (
    <textarea
      id={id}
      aria-invalid={hasError || undefined}
      aria-describedby={errorId ?? hintId}
      className={`${inputClass(hasError)} resize-y ${className}`}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  hasError?: boolean;
  hintId?: string;
  errorId?: string;
}

export function Select({
  id,
  hasError,
  hintId,
  errorId,
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <select
      id={id}
      aria-invalid={hasError || undefined}
      aria-describedby={errorId ?? hintId}
      className={`${inputClass(hasError)} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

interface CheckboxFieldProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  description?: string;
  error?: string;
  tone?: "green" | "purple" | "orange" | "red";
}

const checkboxTones = {
  green: "text-primary-green focus:ring-primary-green/30 border-gray-300",
  purple: "text-primary-purple focus:ring-primary-purple/30 border-gray-300",
  orange: "text-orange-600 focus:ring-orange-500/30 border-gray-300",
  red: "text-red-600 focus:ring-red-500/30 border-gray-300",
} as const;

export function CheckboxField({
  id,
  checked,
  onChange,
  label,
  description,
  error,
  tone = "green",
}: CheckboxFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className={`flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-4 transition-colors ${
          checked ? "border-primary-green/40 bg-primary-green/5" : "border-gray-200"
        }`}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`mt-0.5 size-5 shrink-0 rounded border focus:ring-2 ${checkboxTones[tone]}`}
        />
        <span className="text-sm text-gray-700">
          <span className="font-medium">{label}</span>
          {description && (
            <span className="mt-1 block text-xs text-gray-500">{description}</span>
          )}
        </span>
      </label>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1 text-xs font-medium text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}

interface SectionCardProps {
  id?: string;
  step?: number;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  tone?: "green" | "purple" | "orange";
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const sectionTones = {
  green: {
    wrapper: "border-primary-green/20",
    badge: "bg-primary-green text-white",
    title: "text-primary-green",
  },
  purple: {
    wrapper: "border-primary-purple/20",
    badge: "bg-primary-purple text-white",
    title: "text-primary-purple",
  },
  orange: {
    wrapper: "border-orange-200",
    badge: "bg-orange-500 text-white",
    title: "text-orange-700",
  },
} as const;

export function SectionCard({
  id,
  step,
  title,
  description,
  icon,
  tone = "green",
  children,
  footer,
}: SectionCardProps) {
  const colors = sectionTones[tone];
  return (
    <section
      id={id}
      className={`scroll-mt-24 rounded-xl border bg-white p-6 shadow-sm ${colors.wrapper}`}
    >
      <header className="mb-6 flex items-start gap-3">
        {step !== undefined && (
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${colors.badge}`}
          >
            {step}
          </span>
        )}
        {icon && (
          <span className={`shrink-0 ${colors.title}`} aria-hidden="true">
            {icon}
          </span>
        )}
        <div>
          <h3 className={`text-lg font-bold text-gray-900 ${colors.title}`}>
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
      </header>
      <div className="space-y-5">{children}</div>
      {footer && <div className="mt-6">{footer}</div>}
    </section>
  );
}

interface StepIndicatorProps {
  steps: { id: string; label: string; shortLabel: string; optionalLabel?: string }[];
  currentStep: number;
  onStepSelect: (index: number) => void;
  maxReachableStep: number;
}

export function StepIndicator({
  steps,
  currentStep,
  onStepSelect,
  maxReachableStep,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Form progress" className="mb-8">
      <ol className="flex flex-wrap items-center gap-y-3">
        {steps.map((step, index) => {
          const state =
            index < currentStep
              ? "done"
              : index === currentStep
                ? "current"
                : index <= maxReachableStep
                  ? "reachable"
                  : "upcoming";
          const isInteractive = index <= maxReachableStep;

          return (
            <li key={step.id} className="flex items-center">
              <button
                type="button"
                onClick={() => isInteractive && onStepSelect(index)}
                disabled={!isInteractive}
                aria-current={state === "current" ? "step" : undefined}
                className={`flex items-center gap-2 rounded-full px-2 py-1 text-sm transition-colors ${
                  isInteractive ? "hover:bg-gray-100" : "cursor-not-allowed opacity-60"
                }`}
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    state === "done"
                      ? "bg-primary-green text-white"
                      : state === "current"
                        ? "bg-primary-purple text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {state === "done" ? (
                    <svg
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={`hidden sm:inline ${
                    state === "current"
                      ? "font-semibold text-gray-900"
                      : "text-gray-600"
                  }`}
                >
                  {step.label}
                  {step.optionalLabel && (
                    <span className="ms-1 font-normal text-gray-400">
                      ({step.optionalLabel})
                    </span>
                  )}
                </span>
                <span className="font-medium text-gray-600 sm:hidden">
                  {step.shortLabel}
                </span>
              </button>
              {index < steps.length - 1 && (
                <span
                  className={`mx-1 h-0.5 w-4 rounded-full sm:w-8 ${
                    index < currentStep ? "bg-primary-green" : "bg-gray-200"
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
