"use client";

// src/components/FormField.tsx
// Small accessible form primitives shared by the registration flows.
// They keep the education wizard readable and guarantee consistent
// label / hint / error wiring (aria-describedby, aria-invalid).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  caretAfterDigit,
  daysInMonth,
  formatDateForDisplay,
  formatDateInput,
  parseDateInput,
  parseIsoDate,
  toIsoDate,
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
   * Language used for the month and weekday names of the calendar. Falls back
   * to English when it is omitted.
   */
  locale?: string;
  /**
   * Replaces the shared input styling instead of extending it – the mask needs
   * a full class list, otherwise the focus and error styles of the surrounding
   * form would fight over the same utilities.
   */
  className?: string;
}

const CALENDAR_LABELS = {
  de: {
    open: "Kalender öffnen",
    dialog: "Datum auswählen",
    previous: "Vorheriger Monat",
    next: "Nächster Monat",
    month: "Monat",
    year: "Jahr",
    today: "Heute",
    clear: "Löschen",
  },
  fr: {
    open: "Ouvrir le calendrier",
    dialog: "Choisir une date",
    previous: "Mois précédent",
    next: "Mois suivant",
    month: "Mois",
    year: "Année",
    today: "Aujourd'hui",
    clear: "Effacer",
  },
  ar: {
    open: "فتح التقويم",
    dialog: "اختيار تاريخ",
    previous: "الشهر السابق",
    next: "الشهر التالي",
    month: "الشهر",
    year: "السنة",
    today: "اليوم",
    clear: "مسح",
  },
  en: {
    open: "Open calendar",
    dialog: "Choose a date",
    previous: "Previous month",
    next: "Next month",
    month: "Month",
    year: "Year",
    today: "Today",
    clear: "Clear",
  },
} as const;

function calendarLabels(locale?: string) {
  const language = locale?.split("-")[0].toLowerCase();
  if (language && language in CALENDAR_LABELS) {
    return CALENDAR_LABELS[language as keyof typeof CALENDAR_LABELS];
  }
  return CALENDAR_LABELS.en;
}

const CALENDAR_WIDTH = 288;
const CALENDAR_MARGIN = 8;

/**
 * Date field shown and edited as `dd/mm/yyyy`.
 *
 * A native `<input type="date">` would render the date with the format of the
 * visitor's operating system, so the mask is hand written: it inserts the
 * separators, rejects impossible days and months and only reports an ISO value
 * once a complete, real date has been entered.
 *
 * The calendar button opens a month grid so the date can also be picked with
 * the mouse, while the text field stays the single source of truth (`onChange`
 * always receives an ISO `YYYY-MM-DD` value).
 */
export function DateInput({
  id,
  value,
  onChange,
  hasError,
  hintId,
  errorId,
  locale,
  className,
  style,
  ...props
}: DateInputProps) {
  const [text, setText] = useState(() => formatDateForDisplay(value));
  const [syncedValue, setSyncedValue] = useState(value);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(() =>
    startOfMonth(parseIsoDate(value) ?? new Date()),
  );
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const caret = useRef<number | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);

  const labels = calendarLabels(locale);
  const dateLocale = locale || "en-GB";

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(dateLocale, { month: "long" }),
    [dateLocale],
  );

  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(dateLocale, { weekday: "short" });
    // 2024-01-01 was a Monday, so this lists Monday through Sunday.
    return Array.from({ length: 7 }, (_, index) =>
      formatter.format(new Date(2024, 0, 1 + index)),
    );
  }, [dateLocale]);

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
    const offset = caret.current;
    caret.current = null;
    input.current?.setSelectionRange(offset, offset);
  }, [text]);

  const positionPopup = useCallback(() => {
    const rect = trigger.current?.getBoundingClientRect();
    if (!rect) return;

    const height = popup.current?.offsetHeight ?? 340;
    let left = rect.right - CALENDAR_WIDTH;
    left = Math.max(
      CALENDAR_MARGIN,
      Math.min(left, window.innerWidth - CALENDAR_WIDTH - CALENDAR_MARGIN),
    );

    let top = rect.bottom + 6;
    if (top + height > window.innerHeight - CALENDAR_MARGIN) {
      const above = rect.top - height - 6;
      if (above >= CALENDAR_MARGIN) top = above;
    }

    setPosition({ top, left });
  }, []);

  // Keep the calendar attached to the field while the page or a modal scrolls.
  useEffect(() => {
    if (!open) return;

    positionPopup();
    const handleViewportChange = () => positionPopup();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open, positionPopup]);

  // Move focus into the calendar so keyboard users can navigate it right away.
  useEffect(() => {
    if (open) popup.current?.focus();
  }, [open]);

  // Close when the visitor clicks anywhere outside the field or the calendar.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (container.current?.contains(target)) return;
      if (popup.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const closeCalendar = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus();
  };

  const openCalendar = () => {
    if (props.disabled || props.readOnly) return;
    setViewMonth(startOfMonth(parseIsoDate(value) ?? new Date()));
    positionPopup();
    setOpen(true);
  };

  const selectDate = (iso: string) => {
    setText(formatDateForDisplay(iso));
    setSyncedValue(iso);
    onChange(iso);
    closeCalendar(true);
  };

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

  const minIso = props.min ? String(props.min).slice(0, 10) : "";
  const maxIso = props.max ? String(props.max).slice(0, 10) : "";
  const todayIso = toIsoDate(new Date());
  const viewYear = viewMonth.getFullYear();
  const viewMonthIndex = viewMonth.getMonth();

  const isDisabledDate = (iso: string) =>
    (minIso !== "" && iso < minIso) || (maxIso !== "" && iso > maxIso);

  const firstWeekday = (new Date(viewYear, viewMonthIndex, 1).getDay() + 6) % 7;
  const totalDays = daysInMonth(viewYear, viewMonthIndex);
  const cellCount = Math.ceil((firstWeekday + totalDays) / 7) * 7;

  const currentYear = new Date().getFullYear();
  const baseMinYear = parseIsoDate(minIso)?.getFullYear() ?? currentYear - 120;
  const baseMaxYear = parseIsoDate(maxIso)?.getFullYear() ?? currentYear + 10;
  const selectedYear = parseIsoDate(value)?.getFullYear();
  const minYear = selectedYear ? Math.min(baseMinYear, selectedYear) : baseMinYear;
  const maxYear = selectedYear ? Math.max(baseMaxYear, selectedYear) : baseMaxYear;
  const years = Array.from(
    { length: Math.max(1, maxYear - minYear + 1) },
    (_, index) => maxYear - index,
  );

  const changeMonth = (delta: number) => {
    setViewMonth((current) =>
      new Date(current.getFullYear(), current.getMonth() + delta, 1),
    );
  };

  const selectToday = () => {
    if (!isDisabledDate(todayIso)) selectDate(todayIso);
  };

  const clearDate = () => {
    setText("");
    setSyncedValue("");
    onChange("");
    setOpen(false);
    input.current?.focus();
  };

  return (
    <div
      ref={container}
      className="relative"
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          closeCalendar(true);
        }
      }}
    >
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
        style={{ paddingInlineEnd: "2.75rem", ...style }}
        {...props}
      />
      <button
        ref={trigger}
        type="button"
        onClick={() => (open ? closeCalendar() : openCalendar())}
        disabled={props.disabled || props.readOnly}
        aria-label={labels.open}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? `${id}-calendar` : undefined}
        className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-green/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CalendarDays className="size-4" aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={popup}
          id={`${id}-calendar`}
          role="dialog"
          aria-label={labels.dialog}
          tabIndex={-1}
          dir="ltr"
          style={{ top: position.top, left: position.left }}
          className="fixed z-[70] w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-xl outline-none"
        >
          <div className="mb-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label={labels.previous}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-green/40"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>

            <select
              value={viewMonthIndex}
              onChange={(event) =>
                setViewMonth(
                  new Date(viewYear, Number(event.target.value), 1),
                )
              }
              aria-label={labels.month}
              className="min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-800 focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/30"
            >
              {Array.from({ length: 12 }, (_, month) => (
                <option key={month} value={month}>
                  {monthFormatter.format(new Date(2024, month, 1))}
                </option>
              ))}
            </select>

            <select
              value={viewYear}
              onChange={(event) =>
                setViewMonth(
                  new Date(Number(event.target.value), viewMonthIndex, 1),
                )
              }
              aria-label={labels.year}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-800 focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/30"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label={labels.next}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-green/40"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1" role="grid">
            {weekdayLabels.map((label, index) => (
              <div
                key={`weekday-${index}`}
                role="columnheader"
                className="flex h-8 items-center justify-center text-[11px] font-semibold uppercase tracking-wide text-gray-400"
              >
                {label}
              </div>
            ))}

            {Array.from({ length: cellCount }, (_, index) => {
              const day = index - firstWeekday + 1;
              if (day < 1 || day > totalDays) {
                return <div key={`empty-${index}`} aria-hidden="true" />;
              }

              const date = new Date(viewYear, viewMonthIndex, day);
              const iso = toIsoDate(date);
              const selected = iso === value;
              const isToday = iso === todayIso;
              const disabled = isDisabledDate(iso);

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => selectDate(iso)}
                  disabled={disabled}
                  aria-pressed={selected}
                  aria-current={isToday ? "date" : undefined}
                  className={`flex size-8 items-center justify-center rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-green/40 ${
                    selected
                      ? "bg-primary-green font-semibold text-white"
                      : isToday
                        ? "border border-primary-green/40 font-semibold text-primary-green hover:bg-primary-green/10"
                        : "text-gray-700 hover:bg-gray-100"
                  } ${disabled ? "cursor-not-allowed text-gray-300 hover:bg-transparent" : ""}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
            <button
              type="button"
              onClick={selectToday}
              disabled={isDisabledDate(todayIso)}
              className="rounded-md px-2 py-1 text-xs font-medium text-primary-green transition-colors hover:bg-primary-green/10 focus:outline-none focus:ring-2 focus:ring-primary-green/40 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              {labels.today}
            </button>
            <button
              type="button"
              onClick={clearDate}
              className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-green/40"
            >
              {labels.clear}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
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
