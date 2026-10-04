// src/lib/education.ts
// Domain model for the education (Vereinsschule) registration flow.
//
// Everything in this module mirrors db/schema.ts so that the form, the API
// route and the database stay in sync:
//
//   students.estimated_level   -> STUDENT_LEVELS
//   students.admission_status  -> ADMISSION_STATUSES / DEFAULT_ADMISSION_STATUS (db/lib/enums.ts)
//   students.gender            -> GENDERS / DEFAULT_GENDER (db/lib/enums.ts)
//   students.notes             -> StudentFormValues.notes
//   student_guardians          -> GuardianFormValues + GuardianFormValues.secondary
//   users (incl. SEPA columns) -> GuardianFormValues + PaymentFormValues
//   memberships                -> isMember flag used by the fee calculation
import type { Locale } from "@/i18n/config";
import type { Gender, MaritalStatus } from "@/lib/enums";
import { DEFAULT_GENDER } from "@/lib/enums";
import { parseIsoDate } from "@/lib/date";

// ---------------------------------------------------------------------------
// students.estimated_level
// ---------------------------------------------------------------------------

/**
 * Stable machine values persisted in `students.estimated_level`
 * (varchar(50)). The German/French/Arabic wording is only used for display.
 */
export const STUDENT_LEVELS = [
  "preparatory",
  "level1",
  "level2",
  "level3",
  "level4",
] as const;

export type StudentLevel = (typeof STUDENT_LEVELS)[number];

export const STUDENT_LEVEL_LABELS: Record<
  StudentLevel,
  Record<Locale, string>
> = {
  preparatory: {
    de: "Vorbereitungsstufe",
    fr: "Niveau préparatoire",
    ar: "المستوى التحضيري",
  },
  level1: { de: "Stufe 1", fr: "Niveau 1", ar: "المستوى 1" },
  level2: { de: "Stufe 2", fr: "Niveau 2", ar: "المستوى 2" },
  level3: { de: "Stufe 3", fr: "Niveau 3", ar: "المستوى 3" },
  level4: { de: "Stufe 4", fr: "Niveau 4", ar: "المستوى 4" },
};

export function isStudentLevel(value: unknown): value is StudentLevel {
  return STUDENT_LEVELS.includes(value as StudentLevel);
}

// ---------------------------------------------------------------------------
// relationship_types (student_guardians.relationship_type_id)
// ---------------------------------------------------------------------------

/**
 * The `label` stored in `relationship_types` is the canonical (German) value,
 * the same way the existing API route stores "Elternteil".
 */
export const GUARDIAN_RELATIONSHIPS = [
  "Vater",
  "Mutter",
  "Elternteil",
  "Vormund",
] as const;

export type GuardianRelationship = (typeof GUARDIAN_RELATIONSHIPS)[number];

export const GUARDIAN_RELATIONSHIP_LABELS: Record<
  GuardianRelationship,
  Record<Locale, string>
> = {
  Vater: { de: "Vater", fr: "Père", ar: "الأب" },
  Mutter: { de: "Mutter", fr: "Mère", ar: "الأم" },
  Elternteil: {
    de: "Elternteil / Erziehungsberechtigte(r)",
    fr: "Parent / tuteur légal",
    ar: "الوالد / الوصي القانوني",
  },
  Vormund: { de: "Vormund / Betreuer", fr: "Tuteur / éducateur", ar: "الوصي" },
};

export function isGuardianRelationship(
  value: unknown,
): value is GuardianRelationship {
  return GUARDIAN_RELATIONSHIPS.includes(value as GuardianRelationship);
}

// ---------------------------------------------------------------------------
// students.admission_status
//
// The status values and their labels live in @/lib/enums, which re-exports the
// canonical set from db/lib/enums. A new request is stored as
// DEFAULT_ADMISSION_STATUS ("Zulassungsantrag").
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Fees
// ---------------------------------------------------------------------------

/**
 * Fee model. Members get the first child for free, every additional child
 * costs a reduced amount. Non-members pay the full amount per child.
 * The server always recalculates the total (the client value is untrusted).
 */
export const EDUCATION_FEES = {
  memberFirstChild: 0,
  memberAdditionalChild: 10,
  guestChild: 20,
  currency: "EUR",
  creditorId: "DE05ZZZ00002617424",
} as const;

export function calculateEducationFee({
  isMember,
  childCount,
}: {
  isMember: boolean;
  childCount: number;
}): { total: number; lines: { label: string; amount: number }[] } {
  if (childCount <= 0) {
    return { total: 0, lines: [] };
  }

  if (isMember) {
    const additional = childCount - 1;
    return {
      total: additional * EDUCATION_FEES.memberAdditionalChild,
      lines: [
        { label: "firstChildMember", amount: EDUCATION_FEES.memberFirstChild },
        ...(additional > 0
          ? [
              {
                label: `additionalChildren:${additional}`,
                amount: additional * EDUCATION_FEES.memberAdditionalChild,
              },
            ]
          : []),
      ],
    };
  }

  return {
    total: childCount * EDUCATION_FEES.guestChild,
    lines: [
      { label: `children:${childCount}`, amount: childCount * EDUCATION_FEES.guestChild },
    ],
  };
}

// ---------------------------------------------------------------------------
// Age limits
// ---------------------------------------------------------------------------

/** The Vereinsschule currently teaches children between 6 and 14 years. */
export const STUDENT_AGE_RANGE = { min: 6, max: 14 } as const;

/** Hard limits used for validation – protects against typos. */
export const STUDENT_AGE_LIMITS = { min: 4, max: 18 } as const;

export function calculateAge(birthDate: string, today = new Date()): number | null {
  const date = parseIsoDate(birthDate);
  if (!date) return null;

  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < date.getDate())
  ) {
    age -= 1;
  }
  return age;
}

/** A date is in the future when it is a real date later than `today`. */
export function isFutureDate(value: string, today = new Date()): boolean {
  const date = parseIsoDate(value);
  if (!date) return false;
  return date.getTime() > today.getTime();
}

export function isValidBirthDate(value: string): boolean {
  const age = calculateAge(value);
  if (age === null) return false;
  return age >= 0 && age <= STUDENT_AGE_LIMITS.max;
}

// ---------------------------------------------------------------------------
// Banking helpers
// ---------------------------------------------------------------------------

export function normalizeIban(value: string): string {
  return value.replace(/[\s-]/g, "").toUpperCase();
}

const IBAN_LENGTHS: Record<string, number> = {
  AD: 24, AT: 20, BE: 16, CH: 21, DE: 22, DK: 18, ES: 24, FI: 18,
  FR: 27, GB: 22, IE: 22, IT: 27, LI: 21, LU: 20, NL: 18, NO: 15,
  PL: 28, PT: 25, SE: 24,
};

/** ISO 13616 format + mod-97 checksum check. */
export function isValidIban(rawValue: string): boolean {
  const iban = normalizeIban(rawValue);
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$/.test(iban)) return false;
  if (IBAN_LENGTHS[iban.slice(0, 2)] !== iban.length) return false;

  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged
    .replace(/[A-Z]/g, (char) => String(char.charCodeAt(0) - 55))
    .replace(/\D/g, "");

  if (numeric.length < 5) return false;

  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 1) {
    remainder = (remainder * 10 + Number(numeric[i])) % 97;
  }
  return remainder === 1;
}

export function isValidBic(value: string): boolean {
  const bic = value.replace(/\s/g, "").toUpperCase();
  return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic);
}

export function formatIbanForDisplay(value: string): string {
  return normalizeIban(value).replace(/(.{4})/g, "$1 ").trim();
}

// ---------------------------------------------------------------------------
// Form value shapes (single source of truth for the wizard + API route)
// ---------------------------------------------------------------------------

export interface GuardianFormValues {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
  maritalStatus: MaritalStatus | "";
  email: string;
  phone: string;
  phone2: string;
  address: string;
  relationship: GuardianRelationship;
  canPickup: boolean;
}

/**
 * The media permissions are asked per child: publishing a photo of one sibling
 * does not imply anything about the other, so every student carries its own
 * answer.
 */
export interface StudentConsentFormValues {
  mediaOnline: boolean;
  mediaPrint: boolean;
  mediaPromotion: boolean;
}

export interface StudentFormValues {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  estimatedLevel: StudentLevel | "";
  notes: string;
  consents: StudentConsentFormValues;
}

export interface PaymentFormValues {
  accountHolder: string;
  iban: string;
  bic: string;
  bank: string;
  mandateAccepted: boolean;
}

export interface ConsentFormValues {
  schoolRulesAccepted: boolean;
}

export interface EducationFormValues {
  isMember: boolean;
  guardian: GuardianFormValues;
  secondaryGuardianEnabled: boolean;
  secondaryGuardian: GuardianFormValues;
  students: StudentFormValues[];
  /**
   * SEPA direct debit is optional: families may register now and settle the
   * contribution by transfer afterwards. When this is `false` the whole payment
   * object is left out of the request and the step is only shown as a note.
   */
  paymentEnabled: boolean;
  payment: PaymentFormValues;
  consents: ConsentFormValues;
  lang: Locale;
}

export const emptyGuardian: GuardianFormValues = {
  firstName: "",
  lastName: "",
  birthDate: "",
  gender: DEFAULT_GENDER,
  maritalStatus: "",
  email: "",
  phone: "",
  phone2: "",
  address: "",
  relationship: "Elternteil",
  canPickup: true,
};

export const emptyStudentConsent: StudentConsentFormValues = {
  mediaOnline: true,
  mediaPrint: false,
  mediaPromotion: false,
};

export const emptyStudent: StudentFormValues = {
  id: "",
  firstName: "",
  lastName: "",
  birthDate: "",
  gender: DEFAULT_GENDER,
  estimatedLevel: "preparatory",
  notes: "",
  consents: { ...emptyStudentConsent },
};

export const emptyPayment: PaymentFormValues = {
  accountHolder: "",
  iban: "",
  bic: "",
  bank: "",
  mandateAccepted: false,
};

export const emptyConsents: ConsentFormValues = {
  schoolRulesAccepted: false,
};

export function createEmptyForm(lang: Locale): EducationFormValues {
  return {
    isMember: false,
    guardian: { ...emptyGuardian },
    secondaryGuardianEnabled: false,
    secondaryGuardian: { ...emptyGuardian, canPickup: false },
    students: [{ ...emptyStudent, id: createFieldId() }],
    paymentEnabled: false,
    payment: { ...emptyPayment },
    consents: { ...emptyConsents },
    lang,
  };
}

let fieldIdCounter = 0;
export function createFieldId(): string {
  fieldIdCounter += 1;
  return `student-${Date.now()}-${fieldIdCounter}`;
}

// ---------------------------------------------------------------------------
// i18n helpers
// ---------------------------------------------------------------------------

/**
 * Replaces `{placeholder}` tokens in a dictionary string. The dictionaries are
 * plain JSON, so parameterized labels such as "Kind {n}" cannot be functions.
 */
export function interpolateTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
