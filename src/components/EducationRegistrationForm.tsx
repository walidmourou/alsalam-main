"use client";

// src/components/EducationRegistrationForm.tsx
// Multi-step registration wizard for the Vereinsschule.
//
// The wizard is a thin UI over `educationRequestSchema`: every step validates
// the same zod schema that POST /api/education-registration uses, so the fields
// map 1:1 onto db/schema.ts:
//
//   guardian           -> users (incl. SEPA columns) + student_guardians (is_primary)
//   secondaryGuardian  -> users + student_guardians
//   students[]         -> students (estimated_level, notes, admission_status)
//   payment            -> users.bank / iban / bic / bank_account_holder
//   consents           -> required before the request can be submitted
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type deDictionary from "@/i18n/dictionaries/de.json";
import SchoolRulesModal from "@/components/SchoolRulesModal";
import {
  CheckboxField,
  DateInput,
  Field,
  SectionCard,
  Select,
  StepIndicator,
  TextArea,
  TextInput,
} from "@/components/FormField";
import { formatDateForDisplay } from "@/lib/date";
import {
  GENDERS,
  DEFAULT_GENDER,
  GENDER_LABELS,
  MARITAL_STATUSES,
  MARITAL_STATUS_LABELS,
} from "@/lib/enums";
import {
  EDUCATION_FEES,
  GUARDIAN_RELATIONSHIPS,
  GUARDIAN_RELATIONSHIP_LABELS,
  STUDENT_LEVELS,
  STUDENT_LEVEL_LABELS,
  calculateAge,
  calculateEducationFee,
  createEmptyForm,
  createFieldId,
  emptyStudent,
  formatIbanForDisplay,
  interpolateTemplate,
  isGuardianRelationship,
  isStudentLevel,
  normalizeIban,
  STUDENT_AGE_RANGE,
  type EducationFormValues,
  type GuardianFormValues,
  type StudentConsentFormValues,
  type StudentFormValues,
} from "@/lib/education";
import {
  collectFieldErrors,
  studentKey,
  validateEducationRequest,
  type GuardianCheck,
  type GuardianVerificationResult,
} from "@/lib/education-schema";

type FormLabels = typeof deDictionary.education.form;

interface EducationRegistrationFormProps {
  locale: Locale;
  labels: FormLabels;
  /**
   * Rendered inside the page modal: the wizard is always expanded and drops its
   * own card frame, so it fills the dialog instead of looking like a dialog
   * inside a dialog. The wizard keeps its header (title + required hint + close
   * button), which is why the modal hides its own header in this mode.
   */
  inModal?: boolean;
  /** Called by the wizard's close button when it lives inside a modal. */
  onRequestClose?: () => void;
}

const DRAFT_STORAGE_KEY = "alsalam:education-registration-draft";
const MAX_STUDENTS = 10;

/** Short list of the media channels a child was allowed to appear in. */
function grantedMediaChannels(
  student: StudentFormValues,
  labels: FormLabels["consents"],
): string {
  const granted: string[] = [];
  if (student.consents.mediaOnline) granted.push(labels.mediaShortOnline);
  if (student.consents.mediaPrint) granted.push(labels.mediaShortPrint);
  if (student.consents.mediaPromotion) {
    granted.push(labels.mediaShortPromotion);
  }
  return granted.join(" · ");
}

/** Name used to address a single child in the consent texts. */
function studentName(student: StudentFormValues, index: number): string {
  const name = `${student.firstName} ${student.lastName}`.trim();
  return name || `#${index + 1}`;
}

/** Answer of the step 1 lookup, rendered as a notice in every step. */
interface GuardianChecks {
  primary: GuardianCheck;
  secondary: GuardianCheck | null;
  membership: GuardianVerificationResult["membership"];
}

/** Maps a field path (e.g. "students.0.birthDate") to the step that owns it. */
function stepForPath(path: string): number {
  if (
    path === "isMember" ||
    path.startsWith("guardian") ||
    path.startsWith("secondaryGuardian")
  ) {
    return 0;
  }
  if (path.startsWith("students")) return 1;
  if (path.startsWith("payment")) return 2;
  return 3;
}

function pickErrorsByStep(
  fieldErrors: Record<string, string>,
  step: number,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fieldErrors).filter(([path]) => stepForPath(path) === step),
  );
}

function lowestStepWithErrors(fieldErrors: Record<string, string>): number {
  return Object.keys(fieldErrors).reduce(
    (lowest, path) => Math.min(lowest, stepForPath(path)),
    3,
  );
}

function toRequestPayload(form: EducationFormValues) {
  return {
    isMember: form.isMember,
    // The first responsible person is the child's legal guardian, so collecting
    // the child is implied; only the second person is asked about it.
    guardian: { ...form.guardian, canPickup: true },
    secondaryGuardian: form.secondaryGuardianEnabled
      ? form.secondaryGuardian
      : undefined,
    students: form.students.map((student) => ({
      firstName: student.firstName,
      lastName: student.lastName,
      birthDate: student.birthDate,
      gender: student.gender,
      estimatedLevel: student.estimatedLevel || "preparatory",
      notes: student.notes || undefined,
      consents: {
        mediaOnline: student.consents.mediaOnline,
        mediaPrint: student.consents.mediaPrint,
        mediaPromotion: student.consents.mediaPromotion,
      },
    })),
    // The payment step is optional: without the opt-in the request carries no
    // SEPA data at all and the contribution is settled by transfer.
    paymentEnabled: form.paymentEnabled,
    payment: form.paymentEnabled
      ? {
          accountHolder: form.payment.accountHolder,
          iban: form.payment.iban,
          bic: form.payment.bic,
          bank: form.payment.bank,
          mandateAccepted: form.payment.mandateAccepted,
        }
      : undefined,
    consents: form.consents,
    lang: form.lang,
  };
}

function readStoredDraft(): string | null {
  try {
    return window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
  } catch {
    // Storage may be unavailable (private mode) – the form still works.
    return null;
  }
}

const getServerDraft = () => null;
const subscribeToNothing = () => () => {};

/** Applies a serialized draft on top of a fresh form. */
function applyDraft(
  base: EducationFormValues,
  raw: string | null,
): EducationFormValues {
  if (!raw) return base;

  let parsed: Partial<EducationFormValues>;
  try {
    parsed = JSON.parse(raw) as Partial<EducationFormValues>;
  } catch {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    return base;
  }

  const { students: draftStudents, ...rest } = parsed;
  if (!Array.isArray(draftStudents) || draftStudents.length === 0) return base;

  return {
    ...base,
    ...rest,
    guardian: { ...base.guardian, ...rest.guardian },
    secondaryGuardian: { ...base.secondaryGuardian, ...rest.secondaryGuardian },
    payment: { ...base.payment, ...rest.payment },
    consents: { ...base.consents, ...rest.consents },
    lang: base.lang,
    students: draftStudents.map((student) => ({
      ...emptyStudent,
      ...student,
      id: student.id || createFieldId(),
      consents: { ...emptyStudent.consents, ...student.consents },
    })),
  };
}

/**
 * The stored draft is read through `useSyncExternalStore`: the server snapshot
 * is always `null`, so the first client render matches the server output and
 * the restored draft is applied on the following render. Changing the `key`
 * remounts the wizard so its `useState` initializers pick the draft up.
 */
export default function EducationRegistrationForm({
  locale,
  labels,
  inModal = false,
  onRequestClose,
}: EducationRegistrationFormProps) {
  const storedDraft = useSyncExternalStore(
    subscribeToNothing,
    readStoredDraft,
    getServerDraft,
  );

  return (
    <EducationWizard
      key={storedDraft ? `draft:${storedDraft.length}` : "fresh"}
      locale={locale}
      labels={labels}
      initialDraft={storedDraft}
      inModal={inModal}
      onRequestClose={onRequestClose}
    />
  );
}

function EducationWizard({
  locale,
  labels,
  initialDraft,
  inModal = false,
  onRequestClose,
}: EducationRegistrationFormProps & { initialDraft: string | null }) {
  const t = labels;
  const [form, setForm] = useState<EducationFormValues>(() =>
    applyDraft(createEmptyForm(locale), initialDraft),
  );
  const [isOpen, setIsOpen] = useState(() => inModal || initialDraft !== null);
  const [step, setStep] = useState(0);
  const [maxReachableStep, setMaxReachableStep] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [schoolRulesOpen, setSchoolRulesOpen] = useState(false);
  const [draftRestored] = useState(() => initialDraft !== null);
  // Result of the step 1 lookup. It is kept for the whole flow so the notices
  // stay visible in every step, and dropped as soon as the identity it was
  // based on is edited.
  const [checks, setChecks] = useState<GuardianChecks | null>(null);
  const [verifying, setVerifying] = useState(false);

  const headingRef = useRef<HTMLHeadingElement>(null);

  const steps = [
    { id: "guardian", label: t.steps.guardian, shortLabel: t.steps.guardianShort },
    { id: "students", label: t.steps.students, shortLabel: t.steps.studentsShort },
    {
      id: "payment",
      label: t.steps.payment,
      shortLabel: t.steps.paymentShort,
      optionalLabel: t.optional,
    },
    { id: "review", label: t.steps.review, shortLabel: t.steps.reviewShort },
  ];

  // -------------------------------------------------------------------------
  // Draft persistence – a long form should survive an accidental reload.
  // Only an open form is written, otherwise mounting would overwrite a draft
  // that has not been restored yet.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (status === "success" || !isOpen) return;
    try {
      const { lang: _lang, ...draft } = form;
      void _lang;
      window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Storage may be unavailable (private mode) – the form still works.
    }
  }, [form, isOpen, status]);

  // -------------------------------------------------------------------------
  // State helpers
  // -------------------------------------------------------------------------
  const fieldId = useCallback(
    (path: string) => `field-${path.replace(/\./g, "-")}`,
    [],
  );

  const hasError = useCallback(
    (path: string) => Boolean(fieldErrors[path]),
    [fieldErrors],
  );

  const errorFor = useCallback(
    (path: string) => {
      const code = fieldErrors[path];
      if (!code) return undefined;
      return t.errors[code as keyof typeof t.errors] ?? code;
    },
    [fieldErrors, t],
  );

  /** aria wiring for the Field wrapper (hint <-> error share one description) */
  const ariaFor = useCallback(
    (path: string) => ({
      hasError: hasError(path),
      errorId: hasError(path) ? `${fieldId(path)}-error` : undefined,
      hintId: hasError(path) ? undefined : `${fieldId(path)}-hint`,
    }),
    [fieldId, hasError],
  );

  const clearErrorsWithPrefix = useCallback(
    (updater: (current: Record<string, string>) => Record<string, string>) => {
      setFieldErrors(updater);
    },
    [],
  );

  const update = useCallback(
    <K extends keyof EducationFormValues>(key: K, value: EducationFormValues[K]) => {
      setForm((current) => ({ ...current, [key]: value }));
      // A notice about existing accounts must not survive a changed identity.
      if (key === "isMember" || key === "secondaryGuardianEnabled") {
        setChecks(null);
      }
      const prefix = `${String(key)}.`;
      clearErrorsWithPrefix((current) => {
        if (!Object.keys(current).some((path) => path.startsWith(prefix))) {
          return current;
        }
        const next = { ...current };
        for (const path of Object.keys(next)) {
          if (path.startsWith(prefix)) delete next[path];
        }
        return next;
      });
    },
    [clearErrorsWithPrefix],
  );

  const updateGuardianField = useCallback(
    (target: "guardian" | "secondaryGuardian", key: keyof GuardianFormValues) =>
      (value: string | boolean) => {
        // first/last name and e-mail are what the lookup compares.
        if (["firstName", "lastName", "email"].includes(String(key))) {
          setChecks(null);
        }
        setForm((current) => ({
          ...current,
          [target]: { ...current[target], [key]: value },
        }));
        clearErrorsWithPrefix((current) => {
          const path = `${target}.${String(key)}`;
          if (!current[path]) return current;
          const next = { ...current };
          delete next[path];
          return next;
        });
      },
    [clearErrorsWithPrefix],
  );

  const updateStudent = useCallback(
    (id: string, key: keyof StudentFormValues, value: string) => {
      setForm((current) => ({
        ...current,
        students: current.students.map((student) =>
          student.id === id ? { ...student, [key]: value } : student,
        ),
      }));
      const suffix = `.${String(key)}`;
      clearErrorsWithPrefix((current) => {
        if (
          !Object.keys(current).some(
            (path) => path.startsWith("students.") && path.endsWith(suffix),
          )
        ) {
          return current;
        }
        const next = { ...current };
        for (const path of Object.keys(next)) {
          if (path.startsWith("students.") && path.endsWith(suffix)) {
            delete next[path];
          }
        }
        return next;
      });
    },
    [clearErrorsWithPrefix],
  );

  /** Media permissions are stored per student, see `StudentFormValues.consents`. */
  const updateStudentConsent = useCallback(
    (
      index: number,
      key: keyof StudentConsentFormValues,
      value: boolean,
    ) => {
      setForm((current) => ({
        ...current,
        students: current.students.map((student, position) =>
          position === index
            ? { ...student, consents: { ...student.consents, [key]: value } }
            : student,
        ),
      }));
      const path = `students.${index}.consents.${String(key)}`;
      clearErrorsWithPrefix((current) => {
        if (!current[path]) return current;
        const next = { ...current };
        delete next[path];
        return next;
      });
    },
    [clearErrorsWithPrefix],
  );

  const addStudent = useCallback(() => {
    setForm((current) => ({
      ...current,
      students: [
        ...current.students,
        {
          ...emptyStudent,
          id: createFieldId(),
          lastName: current.guardian.lastName,
        },
      ],
    }));
  }, []);

  const removeStudent = useCallback((id: string) => {
    setForm((current) => ({
      ...current,
      students:
        current.students.length > 1
          ? current.students.filter((student) => student.id !== id)
          : current.students,
    }));
  }, []);

  /**
   * Toggles the optional SEPA step. Switching it off also drops the pending
   * payment errors, otherwise the next validation run would keep reporting the
   * fields that are no longer on screen.
   */
  const setPaymentEnabled = useCallback((enabled: boolean) => {
    setForm((current) => ({ ...current, paymentEnabled: enabled }));
    clearErrorsWithPrefix((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([path]) => !path.startsWith("payment.")),
      );
      return Object.keys(next).length === Object.keys(current).length ? current : next;
    });
  }, [clearErrorsWithPrefix]);

  const isDuplicateStudent = useCallback(
    (student: StudentFormValues) => {
      if (!student.firstName || !student.lastName || !student.birthDate) return false;
      const key = studentKey(student.firstName, student.lastName, student.birthDate);
      return form.students.some(
        (other) =>
          other.id !== student.id &&
          studentKey(other.firstName, other.lastName, other.birthDate) === key,
      );
    },
    [form.students],
  );

  // -------------------------------------------------------------------------
  // Navigation & validation
  // -------------------------------------------------------------------------
  const runValidation = useCallback(() => {
    const result = validateEducationRequest(toRequestPayload(form));
    return result.success ? {} : collectFieldErrors(result.error);
  }, [form]);

  const focusFirstError = useCallback(
    (errors: Record<string, string>) => {
      const firstPath = Object.keys(errors)[0];
      if (!firstPath) return;
      const element = document.getElementById(
        `field-${firstPath.replace(/\./g, "-")}`,
      ) as HTMLElement | null;
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      element?.focus?.({ preventScroll: true });
    },
    [],
  );

  const goToStep = useCallback(
    (nextStep: number, options?: { keepErrors?: boolean }) => {
      setStep(nextStep);
      if (!options?.keepErrors) setFieldErrors({});
      window.requestAnimationFrame(() => headingRef.current?.focus());
    },
    [],
  );

  /**
   * Step 1 lookup: are the two people already known, and is the first one a
   * member? The membership checkbox has to agree with the record, otherwise the
   * fee shown here would contradict the one charged at the end, so a mismatch
   * keeps the user on this step.
   *
   * Returns true when the wizard may continue.
   */
  const runGuardianChecks = useCallback(async (): Promise<boolean> => {
    setVerifying(true);

    try {
      const response = await fetch("/api/education-registration/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guardian: {
            firstName: form.guardian.firstName,
            lastName: form.guardian.lastName,
            email: form.guardian.email,
          },
          secondaryGuardian: form.secondaryGuardianEnabled
            ? {
                firstName: form.secondaryGuardian.firstName,
                lastName: form.secondaryGuardian.lastName,
                email: form.secondaryGuardian.email,
              }
            : undefined,
          isMember: form.isMember,
        }),
      });

      if (!response.ok) {
        setChecks(null);
        setFieldErrors({ isMember: "verificationFailed" });
        focusFirstError({ isMember: "verificationFailed" });
        return false;
      }

      const data = (await response.json()) as GuardianVerificationResult & {
        membershipSelectionMismatch?: boolean;
      };

      const nextChecks: GuardianChecks = {
        primary: data.guardian,
        secondary: data.secondaryGuardian,
        membership: data.membership,
      };
      setChecks(nextChecks);

      if (data.membershipSelectionMismatch) {
        // Found but not ticked, or ticked but not found: both cases belong to
        // the membership checkbox and have to be resolved on this step.
        const code = data.membership.hasMembership
          ? "membershipSelectionRequired"
          : "membershipNotVerified";
        setFieldErrors({ isMember: code });
        focusFirstError({ isMember: code });
        return false;
      }

      return true;
    } catch {
      setChecks(null);
      setFieldErrors({ isMember: "verificationFailed" });
      focusFirstError({ isMember: "verificationFailed" });
      return false;
    } finally {
      setVerifying(false);
    }
  }, [form.guardian, form.secondaryGuardian, form.secondaryGuardianEnabled, form.isMember, focusFirstError]);

  const goNext = useCallback(async () => {
    const errors = runValidation();
    const stepErrors = pickErrorsByStep(errors, step);

    if (Object.keys(stepErrors).length > 0) {
      setFieldErrors(errors);
      focusFirstError(stepErrors);
      return;
    }

    // The guardians are only known once the first step is left.
    if (step === 0 && !(await runGuardianChecks())) return;

    setFieldErrors({});
    setMaxReachableStep((current) => Math.max(current, step + 1));
    goToStep(Math.min(step + 1, steps.length - 1));
  }, [focusFirstError, goToStep, runGuardianChecks, runValidation, step, steps.length]);

  const goBack = useCallback(() => goToStep(Math.max(step - 1, 0)), [goToStep, step]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      const errors = runValidation();
      if (Object.keys(errors).length > 0) {
        const lowest = lowestStepWithErrors(errors);
        setFieldErrors(errors);
        setMaxReachableStep((current) => Math.max(current, lowest));
        goToStep(lowest, { keepErrors: true });
        return;
      }

      setStatus("submitting");
      setFormError(null);

      try {
        const response = await fetch("/api/education-registration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toRequestPayload(form)),
        });

        const data: {
          error?: string;
          fieldErrors?: Record<string, string>;
        } = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (data.fieldErrors) {
            const lowest = lowestStepWithErrors(data.fieldErrors);
            setFieldErrors(data.fieldErrors);
            setMaxReachableStep((current) => Math.max(current, lowest));
            goToStep(lowest, { keepErrors: true });
          }
          const code = data.error as keyof typeof t.errors | undefined;
          throw new Error(
            (code && t.errors[code]) || t.errors.generic,
          );
        }

        setStatus("success");
        window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (error) {
        setFormError(error instanceof Error ? error.message : t.errors.generic);
        setStatus("idle");
      }
    },
    [form, goToStep, runValidation, t],
  );

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------
  const fee = useMemo(
    () =>
      calculateEducationFee({
        isMember: form.isMember,
        childCount: form.students.length,
      }),
    [form.isMember, form.students.length],
  );

  const notices = useMemo(() => {
    if (!checks) return [] as { key: string; message: string }[];

    const found: { key: string; message: string }[] = [];

    if (checks.primary.exists) {
      found.push({
        key: "guardian",
        message: interpolateTemplate(t.membership.noticeGuardianExists, {
          name: form.guardian.firstName,
          id: String(checks.primary.userId ?? ""),
        }),
      });
    }

    if (checks.secondary?.exists) {
      found.push({
        key: "secondaryGuardian",
        message: interpolateTemplate(t.membership.noticeSecondaryExists, {
          name: form.secondaryGuardian.firstName,
          id: String(checks.secondary.userId ?? ""),
        }),
      });
    }

    if (checks.membership.hasMembership) {
      found.push({
        key: "membership",
        message: t.membership.noticeMembershipFound,
      });
    }

    // A membership under another name is still a membership, but the applicant
    // should know the stored name will be replaced by the entered one.
    if (
      checks.membership.hasMembership &&
      checks.membership.nameMatches === false
    ) {
      found.push({
        key: "membershipName",
        message: interpolateTemplate(t.membership.noticeMembershipNameMismatch, {
          stored: checks.membership.storedName ?? "",
          entered: `${form.guardian.firstName} ${form.guardian.lastName}`.trim(),
        }),
      });
    }

    return found;
  }, [checks, form.guardian.firstName, form.guardian.lastName, form.secondaryGuardian.firstName, t.membership]);

  const formatCurrency = useCallback(
    (amount: number) =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: EDUCATION_FEES.currency,
      }).format(amount),
    [locale],
  );

  const genderLabel = useCallback(
    (value: string) =>
      GENDER_LABELS[
        (GENDERS as readonly string[]).includes(value)
          ? (value as (typeof GENDERS)[number])
          : DEFAULT_GENDER
      ][locale],
    [locale],
  );

  const resetForm = useCallback(() => {
    setForm(createEmptyForm(locale));
    setFieldErrors({});
    setStatus("idle");
    setIsOpen(true);
    setStep(0);
    setMaxReachableStep(0);
  }, [locale]);

  // -------------------------------------------------------------------------
  // Success
  // -------------------------------------------------------------------------
  if (status === "success") {
    return (
      <div
        id="registration-wizard"
        className={
          inModal
            ? "bg-green-50 p-6 text-center"
            : "scroll-mt-24 rounded-xl border border-green-200 bg-green-50 p-8 text-center"
        }
      >
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-500">
          <svg
            className="size-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-bold text-green-800">{t.success.title}</h3>
        <p className="mx-auto max-w-2xl text-green-700">{t.success.message}</p>
        <ul className="mx-auto mt-6 max-w-2xl space-y-2 text-start text-sm text-green-800">
          {t.success.nextSteps.map((nextStep) => (
            <li key={nextStep} className="flex items-start gap-2">
              <svg
                className="mt-0.5 size-4 shrink-0 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {nextStep}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={resetForm}
          className="mt-6 font-medium text-primary-green underline hover:no-underline"
        >
          {t.success.registerAnother}
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Closed state – invitation with the fee overview
  // -------------------------------------------------------------------------
  if (!isOpen && !inModal) {
    return (
      <div
        id="registration-invitation"
        className="scroll-mt-24 rounded-2xl bg-gradient-to-br from-primary-green to-primary-purple p-8 text-white shadow-lg md:p-10"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">{t.cta.title}</h2>
          <p className="mt-3 text-base opacity-90 md:text-lg">{t.cta.description}</p>

          <ul className="mx-auto mt-6 grid max-w-2xl gap-3 text-start sm:grid-cols-3">
            {t.cta.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2 rounded-lg bg-white/10 p-3 text-sm"
              >
                <svg
                  className="mt-0.5 size-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {benefit}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm opacity-90">{t.cta.feeHint}</p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-primary-green transition-colors hover:bg-gray-50"
            >
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              {t.cta.button}
            </button>
            <Link
              href={`/${locale}/support`}
              className="text-sm font-medium underline opacity-90 hover:no-underline"
            >
              {t.cta.membershipLink}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Wizard
  // -------------------------------------------------------------------------
  const stepErrors = pickErrorsByStep(fieldErrors, step);

  return (
    <div
      id="registration-wizard"
      className={
        inModal
          ? "p-5 sm:p-6"
          : "scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg md:p-8"
      }
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold text-gray-900 focus:outline-none"
          >
            {t.title}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {t.requiredHint} <span className="text-red-500">*</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (inModal && onRequestClose) {
              onRequestClose();
              return;
            }
            setIsOpen(false);
            setFieldErrors({});
          }}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label={t.close}
        >
          <svg
            className="size-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Result of the step 1 lookup. Shown in every step so the applicant keeps
          knowing whether the accounts already exist and who they are linked to. */}
      {notices.length > 0 && (
        <div className="mb-6 space-y-2">
          {notices.map((notice) => (
            <div
              key={notice.key}
              role="status"
              className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800"
            >
              <svg
                className="mt-0.5 size-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{notice.message}</span>
            </div>
          ))}
        </div>
      )}

      {draftRestored && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <svg
            className="mt-0.5 size-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {t.draftRestored}
        </div>
      )}

      <StepIndicator
        steps={steps}
        currentStep={step}
        maxReachableStep={maxReachableStep}
        onStepSelect={goToStep}
      />

      <form onSubmit={handleSubmit} noValidate>
        {formError && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {formError}
          </div>
        )}

        {/* ==================== Step 1: Guardians ==================== */}
        {step === 0 && (
          <div className="space-y-5">
            <SectionCard
              step={1}
              tone="green"
              title={t.guardian.title}
              description={t.guardian.description}
              icon={
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  id={fieldId("guardian.firstName")}
                  label={t.fields.firstName}
                  required
                  error={errorFor("guardian.firstName")}
                >
                  <TextInput
                    id={fieldId("guardian.firstName")}
                    value={form.guardian.firstName}
                    onChange={(event) =>
                      updateGuardianField("guardian", "firstName")(
                        event.target.value,
                      )
                    }
                    autoComplete="given-name"
                    dir="ltr"
                    {...ariaFor("guardian.firstName")}
                  />
                </Field>

                <Field
                  id={fieldId("guardian.lastName")}
                  label={t.fields.lastName}
                  required
                  error={errorFor("guardian.lastName")}
                >
                  <TextInput
                    id={fieldId("guardian.lastName")}
                    value={form.guardian.lastName}
                    onChange={(event) =>
                      updateGuardianField("guardian", "lastName")(
                        event.target.value,
                      )
                    }
                    autoComplete="family-name"
                    dir="ltr"
                    {...ariaFor("guardian.lastName")}
                  />
                </Field>

                <Field
                  id={fieldId("guardian.email")}
                  label={t.fields.email}
                  required
                  hint={t.guardian.emailHint}
                  error={errorFor("guardian.email")}
                >
                  <TextInput
                    id={fieldId("guardian.email")}
                    type="email"
                    inputMode="email"
                    value={form.guardian.email}
                    onChange={(event) =>
                      updateGuardianField("guardian", "email")(event.target.value)
                    }
                    autoComplete="email"
                    dir="ltr"
                    placeholder="name@beispiel.de"
                    {...ariaFor("guardian.email")}
                  />
                </Field>

                <Field
                  id={fieldId("guardian.phone")}
                  label={t.fields.phone}
                  required
                  error={errorFor("guardian.phone")}
                >
                  <TextInput
                    id={fieldId("guardian.phone")}
                    type="tel"
                    inputMode="tel"
                    value={form.guardian.phone}
                    onChange={(event) =>
                      updateGuardianField("guardian", "phone")(event.target.value)
                    }
                    autoComplete="tel"
                    dir="ltr"
                    placeholder="+49 7761 1234567"
                    {...ariaFor("guardian.phone")}
                  />
                </Field>

                <Field
                  id={fieldId("guardian.phone2")}
                  label={t.fields.phone2}
                  optionalLabel={t.optional}
                >
                  <TextInput
                    id={fieldId("guardian.phone2")}
                    type="tel"
                    inputMode="tel"
                    value={form.guardian.phone2}
                    onChange={(event) =>
                      updateGuardianField("guardian", "phone2")(event.target.value)
                    }
                    dir="ltr"
                    placeholder="+49 7761 1234567"
                  />
                </Field>

                <Field
                  id={fieldId("guardian.gender")}
                  label={t.fields.gender}
                  required
                >
                  <Select
                    id={fieldId("guardian.gender")}
                    value={form.guardian.gender}
                    onChange={(event) =>
                      updateGuardianField("guardian", "gender")(
                        event.target.value as GuardianFormValues["gender"],
                      )
                    }
                  >
                    {GENDERS.map((gender) => (
                      <option key={gender} value={gender}>
                        {GENDER_LABELS[gender][locale]}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  id={fieldId("guardian.relationship")}
                  label={t.fields.relationship}
                  required
                  hint={t.guardian.relationshipHint}
                >
                  <Select
                    id={fieldId("guardian.relationship")}
                    value={form.guardian.relationship}
                    onChange={(event) => {
                      if (isGuardianRelationship(event.target.value)) {
                        updateGuardianField("guardian", "relationship")(
                          event.target.value,
                        );
                      }
                    }}
                  >
                    {GUARDIAN_RELATIONSHIPS.map((relationship) => (
                      <option key={relationship} value={relationship}>
                        {GUARDIAN_RELATIONSHIP_LABELS[relationship][locale]}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  id={fieldId("guardian.birthDate")}
                  label={t.fields.birthDate}
                  optionalLabel={t.optional}
                >
                  <DateInput
                    id={fieldId("guardian.birthDate")}
                    value={form.guardian.birthDate}
                    onChange={(value) =>
                      updateGuardianField("guardian", "birthDate")(value)
                    }
                    {...ariaFor("guardian.birthDate")}
                  />
                </Field>

                <Field
                  id={fieldId("guardian.maritalStatus")}
                  label={t.fields.maritalStatus}
                  optionalLabel={t.optional}
                >
                  <Select
                    id={fieldId("guardian.maritalStatus")}
                    value={form.guardian.maritalStatus}
                    onChange={(event) =>
                      updateGuardianField("guardian", "maritalStatus")(
                        event.target.value as GuardianFormValues["maritalStatus"],
                      )
                    }
                  >
                    <option value="">{t.selectPlaceholder}</option>
                    {MARITAL_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {MARITAL_STATUS_LABELS[status][locale]}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field
                id={fieldId("guardian.address")}
                label={t.fields.address}
                required
                hint={t.guardian.addressHint}
                error={errorFor("guardian.address")}
              >
                <TextArea
                  id={fieldId("guardian.address")}
                  rows={3}
                  value={form.guardian.address}
                  onChange={(event) =>
                    updateGuardianField("guardian", "address")(
                      event.target.value,
                    )
                  }
                  autoComplete="street-address"
                  dir="ltr"
                  {...ariaFor("guardian.address")}
                />
              </Field>
            </SectionCard>

            <SectionCard
              step={2}
              tone="purple"
              title={t.membership.title}
              description={t.membership.description}
              icon={
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              }
            >
              <CheckboxField
                id={fieldId("isMember")}
                checked={form.isMember}
                onChange={(checked) => update("isMember", checked)}
                label={t.membership.checkbox}
                description={t.membership.checkboxHint}
                error={
                  errorFor("isMember")
                    ? t.errors[
                        errorFor("isMember") as keyof typeof t.errors
                      ] ?? errorFor("isMember")
                    : undefined
                }
                tone="purple"
              />
              <p className="rounded-lg bg-accent-purple-light p-3 text-sm text-gray-700">
                {form.isMember
                  ? t.membership.memberFeeHint
                  : t.membership.guestFeeHint}
              </p>
            </SectionCard>

            <SectionCard
              step={3}
              tone="orange"
              title={t.secondaryGuardian.title}
              description={t.secondaryGuardian.description}
              icon={
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
            >
              <CheckboxField
                id="secondary-enabled"
                checked={form.secondaryGuardianEnabled}
                onChange={(checked) => update("secondaryGuardianEnabled", checked)}
                label={t.secondaryGuardian.checkbox}
                description={t.secondaryGuardian.checkboxHint}
                tone="orange"
              />

              {form.secondaryGuardianEnabled && (
                <div className="grid gap-4 rounded-lg bg-orange-50/60 p-4 md:grid-cols-2">
                  <Field
                    id={fieldId("secondaryGuardian.firstName")}
                    label={t.fields.firstName}
                    required
                    error={errorFor("secondaryGuardian.firstName")}
                  >
                    <TextInput
                      id={fieldId("secondaryGuardian.firstName")}
                      value={form.secondaryGuardian.firstName}
                      onChange={(event) =>
                        updateGuardianField("secondaryGuardian", "firstName")(
                          event.target.value,
                        )
                      }
                      autoComplete="given-name"
                      dir="ltr"
                      {...ariaFor("secondaryGuardian.firstName")}
                    />
                  </Field>

                  <Field
                    id={fieldId("secondaryGuardian.lastName")}
                    label={t.fields.lastName}
                    required
                    error={errorFor("secondaryGuardian.lastName")}
                  >
                    <TextInput
                      id={fieldId("secondaryGuardian.lastName")}
                      value={form.secondaryGuardian.lastName}
                      onChange={(event) =>
                        updateGuardianField("secondaryGuardian", "lastName")(
                          event.target.value,
                        )
                      }
                      autoComplete="family-name"
                      dir="ltr"
                      {...ariaFor("secondaryGuardian.lastName")}
                    />
                  </Field>

                  <Field
                    id={fieldId("secondaryGuardian.email")}
                    label={t.fields.email}
                    required
                    error={errorFor("secondaryGuardian.email")}
                  >
                    <TextInput
                      id={fieldId("secondaryGuardian.email")}
                      type="email"
                      inputMode="email"
                      value={form.secondaryGuardian.email}
                      onChange={(event) =>
                        updateGuardianField("secondaryGuardian", "email")(
                          event.target.value,
                        )
                      }
                      autoComplete="email"
                      dir="ltr"
                      {...ariaFor("secondaryGuardian.email")}
                    />
                  </Field>

                  <Field
                    id={fieldId("secondaryGuardian.phone")}
                    label={t.fields.phone}
                    required
                    error={errorFor("secondaryGuardian.phone")}
                  >
                    <TextInput
                      id={fieldId("secondaryGuardian.phone")}
                      type="tel"
                      inputMode="tel"
                      value={form.secondaryGuardian.phone}
                      onChange={(event) =>
                        updateGuardianField("secondaryGuardian", "phone")(
                          event.target.value,
                        )
                      }
                      autoComplete="tel"
                      dir="ltr"
                      {...ariaFor("secondaryGuardian.phone")}
                    />
                  </Field>

                  <Field
                    id={fieldId("secondaryGuardian.address")}
                    label={t.fields.address}
                    required
                    className="md:col-span-2"
                    error={errorFor("secondaryGuardian.address")}
                  >
                    <TextArea
                      id={fieldId("secondaryGuardian.address")}
                      rows={2}
                      value={form.secondaryGuardian.address}
                      onChange={(event) =>
                        updateGuardianField("secondaryGuardian", "address")(
                          event.target.value,
                        )
                      }
                      dir="ltr"
                      {...ariaFor("secondaryGuardian.address")}
                    />
                  </Field>

                  <Field
                    id={fieldId("secondaryGuardian.relationship")}
                    label={t.fields.relationship}
                    required
                    className="md:col-span-2"
                  >
                    <Select
                      id={fieldId("secondaryGuardian.relationship")}
                      value={form.secondaryGuardian.relationship}
                      onChange={(event) => {
                        if (isGuardianRelationship(event.target.value)) {
                          updateGuardianField(
                            "secondaryGuardian",
                            "relationship",
                          )(event.target.value);
                        }
                      }}
                    >
                      {GUARDIAN_RELATIONSHIPS.map((relationship) => (
                        <option key={relationship} value={relationship}>
                          {GUARDIAN_RELATIONSHIP_LABELS[relationship][locale]}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <div className="md:col-span-2">
                    <CheckboxField
                      id={fieldId("secondaryGuardian.canPickup")}
                      checked={form.secondaryGuardian.canPickup}
                      onChange={updateGuardianField(
                        "secondaryGuardian",
                        "canPickup",
                      )}
                      label={t.secondaryGuardian.canPickup}
                      description={t.secondaryGuardian.canPickupHint}
                      tone="orange"
                    />
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {/* ==================== Step 2: Students ==================== */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-start gap-2 rounded-lg border border-purple-200 bg-accent-purple-light p-4 text-sm text-gray-700">
              <svg
                className="mt-0.5 size-4 shrink-0 text-primary-purple"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t.students.ageHint}{" "}
              <span className="font-semibold">
                {STUDENT_AGE_RANGE.min}–{STUDENT_AGE_RANGE.max}
              </span>
            </div>

            {form.students.map((student, index) => {
              const path = `students.${index}`;
              const age = calculateAge(student.birthDate);
              const duplicate = isDuplicateStudent(student);

              return (
                <div
                  key={student.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h4 className="flex items-center gap-2 font-semibold text-gray-900">
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary-purple text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      {interpolateTemplate(t.students.childTitle, { n: index + 1 })}
                    </h4>
                    {form.students.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStudent(student.id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
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
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        {t.students.remove}
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      id={fieldId(`${path}.firstName`)}
                      label={t.fields.firstName}
                      required
                      error={errorFor(`${path}.firstName`)}
                    >
                      <TextInput
                        id={fieldId(`${path}.firstName`)}
                        value={student.firstName}
                        onChange={(event) =>
                          updateStudent(student.id, "firstName", event.target.value)
                        }
                        autoComplete="off"
                        dir="ltr"
                        {...ariaFor(`${path}.firstName`)}
                      />
                    </Field>

                    <Field
                      id={fieldId(`${path}.lastName`)}
                      label={t.fields.lastName}
                      required
                      error={errorFor(`${path}.lastName`)}
                    >
                      <TextInput
                        id={fieldId(`${path}.lastName`)}
                        value={student.lastName}
                        onChange={(event) =>
                          updateStudent(student.id, "lastName", event.target.value)
                        }
                        autoComplete="off"
                        dir="ltr"
                        {...ariaFor(`${path}.lastName`)}
                      />
                    </Field>

                    <Field
                      id={fieldId(`${path}.birthDate`)}
                      label={t.fields.birthDate}
                      required
                      hint={
                        age !== null && age >= 0
                          ? interpolateTemplate(t.students.ageLabel, { age })
                          : undefined
                      }
                      error={
                        duplicate
                          ? t.errors.duplicateStudent
                          : errorFor(`${path}.birthDate`)
                      }
                    >
                      <DateInput
                        id={fieldId(`${path}.birthDate`)}
                        value={student.birthDate}
                        onChange={(value) =>
                          updateStudent(student.id, "birthDate", value)
                        }
                        hasError={hasError(`${path}.birthDate`) || duplicate}
                        errorId={
                          hasError(`${path}.birthDate`) || duplicate
                            ? `${fieldId(`${path}.birthDate`)}-error`
                            : undefined
                        }
                        hintId={`${fieldId(`${path}.birthDate`)}-hint`}
                      />
                    </Field>

                    <Field
                      id={fieldId(`${path}.gender`)}
                      label={t.fields.gender}
                      required
                      error={errorFor(`${path}.gender`)}
                    >
                      <Select
                        id={fieldId(`${path}.gender`)}
                        value={student.gender}
                        onChange={(event) =>
                          updateStudent(student.id, "gender", event.target.value)
                        }
                        {...ariaFor(`${path}.gender`)}
                      >
                        {GENDERS.map((gender) => (
                          <option key={gender} value={gender}>
                            {GENDER_LABELS[gender][locale]}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <Field
                      id={fieldId(`${path}.estimatedLevel`)}
                      label={t.fields.estimatedLevel}
                      required
                      hint={t.students.levelHint}
                      className="md:col-span-2"
                      error={errorFor(`${path}.estimatedLevel`)}
                    >
                      <Select
                        id={fieldId(`${path}.estimatedLevel`)}
                        value={student.estimatedLevel}
                        onChange={(event) => {
                          if (isStudentLevel(event.target.value)) {
                            updateStudent(
                              student.id,
                              "estimatedLevel",
                              event.target.value,
                            );
                          }
                        }}
                        {...ariaFor(`${path}.estimatedLevel`)}
                      >
                        <option value="">{t.selectPlaceholder}</option>
                        {STUDENT_LEVELS.map((level) => (
                          <option key={level} value={level}>
                            {STUDENT_LEVEL_LABELS[level][locale]}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <Field
                      id={fieldId(`${path}.notes`)}
                      label={t.fields.notes}
                      optionalLabel={t.optional}
                      hint={t.students.notesHint}
                      className="md:col-span-2"
                    >
                      <TextArea
                        id={fieldId(`${path}.notes`)}
                        rows={3}
                        value={student.notes}
                        onChange={(event) =>
                          updateStudent(student.id, "notes", event.target.value)
                        }
                        placeholder={t.students.notesPlaceholder}
                        dir="auto"
                      />
                    </Field>
                  </div>

                  {/* Photo and video permissions belong to this child only,
                      so they are declared next to the child they apply to. */}
                  <fieldset
                    className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4"
                    aria-labelledby={`${fieldId(`${path}.consents`)}-legend`}
                  >
                    <legend
                      id={`${fieldId(`${path}.consents`)}-legend`}
                      className="px-1 text-sm font-semibold text-gray-900"
                    >
                      {interpolateTemplate(t.consents.mediaStudentTitle, {
                        name: studentName(student, index),
                      })}
                    </legend>
                    <p className="mb-3 text-sm text-gray-600">
                      {interpolateTemplate(t.consents.mediaIntro, {
                        name: studentName(student, index),
                      })}
                    </p>

                    <div className="space-y-3">
                      <CheckboxField
                        id={fieldId(`${path}.consents.mediaOnline`)}
                        checked={student.consents.mediaOnline}
                        onChange={(checked) =>
                          updateStudentConsent(index, "mediaOnline", checked)
                        }
                        label={t.consents.mediaOnline}
                        tone="purple"
                      />
                      <CheckboxField
                        id={fieldId(`${path}.consents.mediaPrint`)}
                        checked={student.consents.mediaPrint}
                        onChange={(checked) =>
                          updateStudentConsent(index, "mediaPrint", checked)
                        }
                        label={t.consents.mediaPrint}
                        tone="purple"
                      />
                      <CheckboxField
                        id={fieldId(`${path}.consents.mediaPromotion`)}
                        checked={student.consents.mediaPromotion}
                        onChange={(checked) =>
                          updateStudentConsent(index, "mediaPromotion", checked)
                        }
                        label={t.consents.mediaPromotion}
                        tone="purple"
                      />
                    </div>

                    <p className="mt-3 text-xs text-gray-500">
                      {interpolateTemplate(t.consents.mediaValiditySingle, {
                        name: studentName(student, index),
                      })}
                    </p>
                  </fieldset>
                </div>
              );
            })}

            {fieldErrors["students"] && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {errorFor("students")}
              </p>
            )}

            <button
              type="button"
              onClick={addStudent}
              disabled={form.students.length >= MAX_STUDENTS}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary-purple/40 bg-accent-purple-light px-6 py-4 font-semibold text-primary-purple transition-colors hover:border-primary-purple hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t.students.add}
            </button>
          </div>
        )}

        {/* ==================== Step 3: Payment ==================== */}
        {step === 2 && (
          <div className="space-y-5">
            <SectionCard
              step={1}
              tone="green"
              title={t.payment.title}
              description={t.payment.description}
              icon={
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V6a3 3 0 00-3-3H6a3 3 0 00-3 3v11a3 3 0 003 3z"
                  />
                </svg>
              }
            >
              <CheckboxField
                id={fieldId("paymentEnabled")}
                checked={form.paymentEnabled}
                onChange={setPaymentEnabled}
                label={t.payment.optInLabel}
                description={t.payment.optInHint}
                tone="green"
              />

              {form.paymentEnabled ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      id={fieldId("payment.accountHolder")}
                      label={t.fields.accountHolder}
                      required
                      error={errorFor("payment.accountHolder")}
                    >
                      <TextInput
                        id={fieldId("payment.accountHolder")}
                        value={form.payment.accountHolder}
                        onChange={(event) =>
                          update("payment", {
                            ...form.payment,
                            accountHolder: event.target.value,
                          })
                        }
                        autoComplete="name"
                        dir="ltr"
                        {...ariaFor("payment.accountHolder")}
                      />
                    </Field>

                    <Field
                      id={fieldId("payment.bank")}
                      label={t.fields.bank}
                      optionalLabel={t.optional}
                    >
                      <TextInput
                        id={fieldId("payment.bank")}
                        value={form.payment.bank}
                        onChange={(event) =>
                          update("payment", { ...form.payment, bank: event.target.value })
                        }
                        dir="ltr"
                      />
                    </Field>

                    <Field
                      id={fieldId("payment.iban")}
                      label="IBAN"
                      required
                      hint={t.payment.ibanHint}
                      error={errorFor("payment.iban")}
                    >
                      <TextInput
                        id={fieldId("payment.iban")}
                        value={form.payment.iban}
                        onChange={(event) =>
                          update("payment", {
                            ...form.payment,
                            iban: formatIbanForDisplay(event.target.value),
                          })
                        }
                        onBlur={() =>
                          update("payment", {
                            ...form.payment,
                            iban: normalizeIban(form.payment.iban),
                          })
                        }
                        dir="ltr"
                        autoCapitalize="characters"
                        spellCheck={false}
                        placeholder="DE89 3704 0044 0532 0130 00"
                        className="font-mono tracking-wide"
                        {...ariaFor("payment.iban")}
                      />
                    </Field>

                    <Field
                      id={fieldId("payment.bic")}
                      label="BIC / SWIFT"
                      optionalLabel={t.optional}
                      hint={t.payment.bicHint}
                      error={errorFor("payment.bic")}
                    >
                      <TextInput
                        id={fieldId("payment.bic")}
                        value={form.payment.bic}
                        onChange={(event) =>
                          update("payment", {
                            ...form.payment,
                            bic: event.target.value.toUpperCase(),
                          })
                        }
                        dir="ltr"
                        autoCapitalize="characters"
                        spellCheck={false}
                        placeholder="COBADEFFXXX"
                        className="font-mono tracking-wide"
                        {...ariaFor("payment.bic")}
                      />
                    </Field>
                  </div>

                  <CheckboxField
                    id={fieldId("payment.mandateAccepted")}
                    checked={form.payment.mandateAccepted}
                    onChange={(checked) =>
                      update("payment", {
                        ...form.payment,
                        mandateAccepted: checked,
                      })
                    }
                    label={t.payment.mandateLabel}
                    description={t.payment.mandateText}
                    error={errorFor("payment.mandateAccepted")}
                    tone="red"
                  />
                </>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="font-semibold text-gray-900">
                    {t.payment.deferredTitle}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    {t.payment.deferredText}
                  </p>
                </div>
              )}
            </SectionCard>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h4 className="font-semibold text-gray-900">{t.fee.title}</h4>
                <span className="text-2xl font-bold text-primary-green">
                  {formatCurrency(fee.total)}
                </span>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                {form.students.map((student, index) => (
                  <li key={student.id} className="flex justify-between gap-4">
                    <span>
                      {interpolateTemplate(t.students.childTitle, { n: index + 1 })} ·{" "}
                      {[student.firstName, student.lastName]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(
                        form.isMember
                          ? index === 0
                            ? EDUCATION_FEES.memberFirstChild
                            : EDUCATION_FEES.memberAdditionalChild
                          : EDUCATION_FEES.guestChild,
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ==================== Step 4: Review & submit ==================== */}
        {step === 3 && (
          <div className="space-y-5">
            <SectionCard
              step={1}
              tone="green"
              title={t.review.title}
              description={t.review.description}
            >
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {t.fields.firstName} / {t.fields.lastName}
                  </dt>
                  <dd className="text-gray-900">
                    {form.guardian.firstName} {form.guardian.lastName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {t.fields.email}
                  </dt>
                  <dd className="text-gray-900" dir="ltr">
                    {form.guardian.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {t.fields.phone}
                  </dt>
                  <dd className="text-gray-900" dir="ltr">
                    {form.guardian.phone}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {t.fields.address}
                  </dt>
                  <dd className="text-gray-900">{form.guardian.address}</dd>
                </div>
                {form.secondaryGuardianEnabled && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {t.secondaryGuardian.title}
                    </dt>
                    <dd className="text-gray-900">
                      {form.secondaryGuardian.firstName}{" "}
                      {form.secondaryGuardian.lastName} ·{" "}
                      <span dir="ltr">{form.secondaryGuardian.email}</span>
                    </dd>
                  </div>
                )}
              </dl>

              <button
                type="button"
                onClick={() => goToStep(0)}
                className="self-start text-sm font-medium text-primary-green underline hover:no-underline"
              >
                {t.review.edit}
              </button>
            </SectionCard>

            <SectionCard
              step={2}
              tone="purple"
              title={t.students.title}
              description={t.students.ageHint}
            >
              <ul className="divide-y divide-gray-100">
                {form.students.map((student, index) => (
                  <li
                    key={student.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {interpolateTemplate(t.students.childTitle, { n: index + 1 })} · {student.firstName}{" "}
                        {student.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDateForDisplay(student.birthDate) || "—"} ·{" "}
                        {genderLabel(student.gender)} ·{" "}
                        {isStudentLevel(student.estimatedLevel)
                          ? STUDENT_LEVEL_LABELS[student.estimatedLevel][locale]
                          : "—"}
                      </p>
                      {/* The media permissions are granted per child, so the
                          review lists them per child as well. */}
                      <p className="mt-1 text-sm text-purple-700">
                        {grantedMediaChannels(student, t.consents) ||
                          t.consents.reviewNoMedia}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 p-4">
                <span className="font-semibold text-gray-900">
                  {t.fee.title}
                </span>
                <span className="text-xl font-bold text-primary-green">
                  {formatCurrency(fee.total)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => goToStep(1)}
                className="self-start text-sm font-medium text-primary-purple underline hover:no-underline"
              >
                {t.review.edit}
              </button>
            </SectionCard>

            <SectionCard
              step={3}
              tone="green"
              title={t.payment.reviewTitle}
            >
              <p className="text-gray-900">
                {form.paymentEnabled
                  ? t.payment.reviewEnabled
                  : t.payment.reviewDeferred}
              </p>
              {form.paymentEnabled && form.payment.iban && (
                <p className="mt-1 font-mono text-sm text-gray-600" dir="ltr">
                  {formatIbanForDisplay(form.payment.iban)}
                </p>
              )}

              <button
                type="button"
                onClick={() => goToStep(2)}
                className="self-start text-sm font-medium text-primary-green underline hover:no-underline"
              >
                {t.review.edit}
              </button>
            </SectionCard>

            <SectionCard
              step={4}
              tone="orange"
              title={t.consents.title}
              description={t.consents.description}
            >
              <CheckboxField
                id={fieldId("consents.schoolRulesAccepted")}
                checked={form.consents.schoolRulesAccepted}
                onChange={(checked) =>
                  update("consents", {
                    ...form.consents,
                    schoolRulesAccepted: checked,
                  })
                }
                label={t.consents.schoolRulesLabel}
                description={t.consents.schoolRulesHint}
                error={errorFor("consents.schoolRulesAccepted")}
                tone="orange"
              />
              <button
                type="button"
                onClick={() => setSchoolRulesOpen(true)}
                className="inline-flex items-center gap-1 self-start text-sm font-medium text-primary-purple underline hover:no-underline"
              >
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
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                {t.consents.readRules}
              </button>

              <p className="mt-2 text-sm text-gray-600">
                {t.consents.mediaRights}
              </p>
            </SectionCard>
          </div>
        )}

        {/* ==================== Navigation ==================== */}
        <div className="mt-8 flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0 || status === "submitting"}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
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
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t.back}
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={verifying}
              aria-busy={verifying || undefined}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-purple px-8 py-3 font-semibold text-white transition-colors hover:bg-primary-purple/90 disabled:cursor-wait disabled:opacity-70"
            >
              {verifying ? t.membership.verifying : t.next}
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
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-green px-8 py-3 font-semibold text-white shadow-md transition-colors hover:bg-primary-green/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "submitting" ? (
                <>
                  <svg
                    className="size-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t.submitting}
                </>
              ) : (
                <>
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {t.submit}
                </>
              )}
            </button>
          )}
        </div>

        {Object.keys(stepErrors).length > 0 && (
          <p role="status" className="mt-4 text-center text-sm text-red-600">
            {interpolateTemplate(t.review.fixErrors, {
              count: Object.keys(stepErrors).length,
            })}
          </p>
        )}
      </form>

      <SchoolRulesModal
        isOpen={schoolRulesOpen}
        onClose={() => setSchoolRulesOpen(false)}
        locale={locale}
        labels={{ close: t.close }}
      />
    </div>
  );
}
