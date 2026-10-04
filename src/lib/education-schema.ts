// src/lib/education-schema.ts
// Shared request validation for the education registration flow.
//
// The very same schema validates the multi-step wizard in the browser and the
// payload of POST /api/education-registration, so the two can never drift
// apart. Messages are stable machine codes – the client maps them to the
// dictionary, the API simply echoes them back as `fieldErrors`.
import { z } from "zod";
import { DEFAULT_GENDER, GENDERS, MARITAL_STATUSES } from "@/lib/enums";
import { parseIsoDate } from "@/lib/date";
import {
  GUARDIAN_RELATIONSHIPS,
  STUDENT_LEVELS,
  isValidBic,
  isValidIban,
  normalizeIban,
  calculateAge,
  isFutureDate,
  STUDENT_AGE_LIMITS,
} from "@/lib/education";

export const MAX_STUDENTS_PER_REQUEST = 10;

const MAX_LENGTH = 255;
const nameField = () =>
  z
    .string()
    .trim()
    .min(1, { message: "required" })
    .max(MAX_LENGTH, { message: "tooLong" });

const optionalTextField = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max, { message: "tooLong" })
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

const emailField = () =>
  z
    .string()
    .trim()
    .min(1, { message: "required" })
    .max(MAX_LENGTH, { message: "tooLong" })
    .pipe(z.email({ message: "invalidEmail" }));

const birthDateField = () =>
  z
    .string()
    .trim()
    .min(1, { message: "required" })
    .refine((value) => parseIsoDate(value) !== null, { message: "invalidDate" })
    .refine((value) => !isFutureDate(value), { message: "futureDate" })
    .refine((value) => {
      const age = calculateAge(value);
      return age !== null && age >= STUDENT_AGE_LIMITS.min && age <= STUDENT_AGE_LIMITS.max;
    }, { message: "ageRange" });

/** Guardians may leave their own date of birth empty; a filled value is checked. */
function isValidGuardianBirthDate(value: string): boolean {
  if (parseIsoDate(value) === null) return false;
  if (isFutureDate(value)) return false;
  const age = calculateAge(value);
  return age !== null && age >= 18 && age <= 120;
}

const phoneField = () =>
  z
    .string()
    .trim()
    .min(3, { message: "required" })
    .max(40, { message: "tooLong" })
    .refine((value) => /^[0-9+][0-9\s()/.-]{2,}$/.test(value), {
      message: "invalidPhone",
    });

const guardianSchema = z.object({
  firstName: nameField(),
  lastName: nameField(),
  // Optional: the education flow only needs the guardian for contact purposes,
  // but the column exists on `users` and improves later communication.
  birthDate: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined))
    .refine((value) => !value || isValidGuardianBirthDate(value), {
      message: "invalidDate",
    }),
  gender: z.enum(GENDERS, { message: "invalidGender" }),
  maritalStatus: z
    .enum(MARITAL_STATUSES, { message: "invalidMaritalStatus" })
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  email: emailField(),
  phone: phoneField(),
  phone2: z
    .string()
    .trim()
    .max(40, { message: "tooLong" })
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  address: z
    .string()
    .trim()
    .min(1, { message: "required" })
    .max(MAX_LENGTH, { message: "tooLong" }),
  relationship: z.enum(GUARDIAN_RELATIONSHIPS, { message: "invalidRelationship" }),
  canPickup: z.boolean(),
});

/**
 * Photo and video permissions are collected per child, so they belong to the
 * student and not to the request: a permission granted for one sibling must not
 * be applied to the other.
 */
const mediaConsentSchema = z.object({
  mediaOnline: z.boolean(),
  mediaPrint: z.boolean(),
  mediaPromotion: z.boolean(),
});

const studentSchema = z.object({
  firstName: nameField(),
  lastName: nameField(),
  birthDate: birthDateField(),
  gender: z.enum(GENDERS, { message: "invalidGender" }),
  estimatedLevel: z.enum(STUDENT_LEVELS, { message: "invalidLevel" }).optional(),
  notes: optionalTextField(),
  consents: mediaConsentSchema,
});

/**
 * Only the shape is enforced here. Whether the SEPA details are actually
 * required depends on `paymentEnabled`, so the field level checks live in
 * `superRefine` and keep the error paths identical to the form. Every field is
 * optional so that a request which skips the payment step is never rejected
 * because of a leftover or partial `payment` object.
 */
const paymentSchema = z.object({
  accountHolder: z.string().trim().max(MAX_LENGTH, { message: "tooLong" }).optional(),
  iban: z.string().trim().max(255, { message: "tooLong" }).optional(),
  bic: z.string().trim().max(20, { message: "tooLong" }).optional().or(z.literal("")),
  bank: optionalTextField(MAX_LENGTH),
  mandateAccepted: z.boolean().default(false),
});

const consentSchema = z.object({
  schoolRulesAccepted: z.literal(true, { message: "schoolRulesRequired" }),
});

export const educationRequestSchema = z
  .object({
    isMember: z.boolean().default(false),
    guardian: guardianSchema,
    secondaryGuardian: guardianSchema.optional(),
    students: z
      .array(studentSchema)
      .min(1, { message: "atLeastOneStudent" })
      .max(MAX_STUDENTS_PER_REQUEST, { message: "tooManyStudents" }),
    // `paymentEnabled` mirrors the opt-in checkbox of the payment step: without
    // it the request simply carries no SEPA data.
    paymentEnabled: z.boolean().default(true),
    payment: paymentSchema.optional(),
    consents: consentSchema,
    lang: z.enum(["de", "fr", "ar"]),
  })
  .superRefine((data, ctx) => {
    // Mirrors the `students_name_birth_unique_idx` unique index of db/schema.ts:
    // first_name + last_name + birth_date must be unique per request.
    const seen = new Map<string, number>();

    data.students.forEach((student, index) => {
      const key = studentKey(student.firstName, student.lastName, student.birthDate);
      const firstIndex = seen.get(key);
      if (firstIndex !== undefined) {
        ctx.addIssue({
          code: "custom",
          message: "duplicateStudent",
          path: ["students", index, "birthDate"],
        });
      } else {
        seen.set(key, index);
      }
    });

    if (
      data.secondaryGuardian &&
      data.secondaryGuardian.email.toLowerCase() === data.guardian.email.toLowerCase()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "duplicateGuardianEmail",
        path: ["secondaryGuardian", "email"],
      });
    }

    if (!data.paymentEnabled) return;

    const addPaymentIssue = (field: string, message: string) =>
      ctx.addIssue({ code: "custom", message, path: ["payment", field] });

    // A missing object still has to surface on the individual fields, otherwise
    // the wizard would land on the payment step without anything highlighted.
    const payment = data.payment;
    if (!payment) {
      addPaymentIssue("accountHolder", "required");
      addPaymentIssue("iban", "required");
      addPaymentIssue("mandateAccepted", "mandateRequired");
      return;
    }

    if (!payment.accountHolder) addPaymentIssue("accountHolder", "required");

    const iban = normalizeIban(payment.iban ?? "");
    if (!iban) addPaymentIssue("iban", "required");
    else if (!isValidIban(iban)) addPaymentIssue("iban", "invalidIban");

    const bic = payment.bic?.trim().toUpperCase() ?? "";
    if (bic && !isValidBic(bic)) addPaymentIssue("bic", "invalidBic");

    if (!payment.mandateAccepted) addPaymentIssue("mandateAccepted", "mandateRequired");
  });

export type EducationRequest = z.infer<typeof educationRequestSchema>;
export type EducationStudentRequest = z.infer<typeof studentSchema>;

// ---------------------------------------------------------------------------
// Step 1 verification
// ---------------------------------------------------------------------------

/**
 * Only the identity of a guardian is verified when the user leaves the first
 * step: the wizard has to know whether the people already exist (so their data
 * is updated instead of duplicated) and whether the first one is a member.
 */
const guardianIdentitySchema = z.object({
  firstName: nameField(),
  lastName: nameField(),
  email: emailField(),
});

export const guardianVerificationSchema = z.object({
  guardian: guardianIdentitySchema,
  secondaryGuardian: guardianIdentitySchema.optional(),
  isMember: z.boolean().default(false),
});

export type GuardianVerificationRequest = z.infer<
  typeof guardianVerificationSchema
>;

/** Result of one guardian lookup: `userId` is only informative for the client. */
export interface GuardianCheck {
  exists: boolean;
  /** The `users.id` the submit route will link the children to. */
  userId?: number;
  /** The name stored on the account, used to explain a mismatch. */
  storedName?: string;
  /** False when the account was found by e-mail but carries another name. */
  nameMatches?: boolean;
}

export interface GuardianVerificationResult {
  guardian: GuardianCheck;
  secondaryGuardian: GuardianCheck | null;
  /**
   * `hasMembership` mirrors the fee lookup of the submit route (any membership
   * row that is not soft-deleted), so the notice and the calculated fee can
   * never disagree.
   */
  membership: {
    hasMembership: boolean;
    userId?: number;
    storedName?: string;
    nameMatches?: boolean;
  };
}

/**
 * `students_name_birth_unique_idx` is a plain unique index, so the comparison
 * has to be case-insensitive to reliably detect near-duplicates in the UI.
 */
export function studentKey(
  firstName: string,
  lastName: string,
  birthDate: string,
): string {
  return `${firstName.trim().toLowerCase()}|${lastName.trim().toLowerCase()}|${birthDate}`;
}

// ---------------------------------------------------------------------------
// Legacy payload support
// ---------------------------------------------------------------------------

/**
 * The profile page still posts the previous flat payload
 * (requesterFirstName / children / sepaIban / …). This adapter converts it to
 * the structured shape; `normalizeEducationPayload` then validates it.
 */
export function normalizeEducationPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload;
  const raw = payload as Record<string, unknown>;

  if (raw.guardian && typeof raw.guardian === "object") return payload;

  const text = (value: unknown) => (typeof value === "string" ? value : "");

  const guardian = {
    firstName: text(raw.requesterFirstName),
    lastName: text(raw.requesterLastName),
    birthDate: "",
    gender: DEFAULT_GENDER,
    maritalStatus: "",
    email: text(raw.requesterEmail),
    phone: text(raw.requesterPhone),
    phone2: "",
    address: text(raw.requesterAddress),
    relationship: "Elternteil",
    canPickup: true,
  };

  // The legacy profile form always repeats the member's own contact details in
  // the "responsible person" block, so a second guardian is only derived when
  // the e-mail actually differs – otherwise it is the very same user row.
  const responsibleEmail = text(raw.responsibleEmail);
  const hasResponsible =
    (text(raw.responsibleFirstName) !== "" || responsibleEmail !== "") &&
    responsibleEmail.toLowerCase() !== guardian.email.toLowerCase();

  const children = Array.isArray(raw.children) ? raw.children : [];

  return {
    // The legacy flow is only reachable from the profile page, i.e. for members.
    isMember: true,
    guardian,
    secondaryGuardian: hasResponsible
      ? {
          firstName: text(raw.responsibleFirstName),
          lastName: text(raw.responsibleLastName),
          birthDate: "",
          gender: DEFAULT_GENDER,
          maritalStatus: "",
          email: responsibleEmail,
          phone: text(raw.responsiblePhone),
          phone2: "",
          address: text(raw.responsibleAddress),
          relationship: "Elternteil",
          canPickup: false,
        }
      : undefined,
    students: children.map((child) => {
      const entry = (child ?? {}) as Record<string, unknown>;
      return {
        firstName: text(entry.firstName),
        lastName: text(entry.lastName),
        birthDate: text(entry.birthDate),
        gender: text(entry.gender) || DEFAULT_GENDER,
        estimatedLevel: text(entry.estimatedLevel) || "preparatory",
        notes: "",
        // The legacy form asked the media questions once for all children, so
        // its single answer applies to every student of the request.
        consents: {
          mediaOnline: raw.consentMediaOnline === true,
          mediaPrint: raw.consentMediaPrint === true,
          mediaPromotion: raw.consentMediaPromotion === true,
        },
      };
    }),
    // The legacy form always collects the SEPA details, so the mandate stays
    // mandatory for it even though the wizard step is optional.
    paymentEnabled: true,
    payment: {
      accountHolder: text(raw.sepaAccountHolder) || guardian.firstName + " " + guardian.lastName,
      iban: text(raw.sepaIban),
      bic: text(raw.sepaBic),
      bank: text(raw.sepaBank),
      // Legacy callers send the mandate flag without the structured object.
      mandateAccepted: raw.sepaMandate === true,
    },
    consents: {
      schoolRulesAccepted: raw.schoolRulesAccepted === true,
    },
    lang: text(raw.lang) || "de",
  };
}

export function validateEducationRequest(
  payload: unknown,
): z.ZodSafeParseResult<EducationRequest> {
  return educationRequestSchema.safeParse(normalizeEducationPayload(payload));
}

/** Flattens zod issues into `{ "students.0.birthDate": "invalidDate" }`. */
export function collectFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.map(String).join(".");
    if (!fieldErrors[path]) {
      fieldErrors[path] = issue.message;
    }
  }

  return fieldErrors;
}
