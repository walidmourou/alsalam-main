// src/lib/enums.ts
// Enum value sets used by the Drizzle schema (db/schema.ts) and by the
// membership / education / profile flows.

export const GENDERS = ["Männlich", "Weiblich"] as const;
export type Gender = (typeof GENDERS)[number];

export const MARITAL_STATUSES = [
  "Ledig",
  "Verheiratet",
  "Geschieden",
  "Verwitwet",
] as const;
export type MaritalStatus = (typeof MARITAL_STATUSES)[number];

export const ADMISSION_STATUSES = [
  "Zulassungsantrag",
  "Angenommen",
  "Abgelehnt",
  "Warteliste",
  "Abgemeldet",
] as const;
export type AdmissionStatus = (typeof ADMISSION_STATUSES)[number];

export const TEACHER_STATUSES = [
  "Antrag ausstehend",
  "Aktiv",
  "Inaktiv",
  "Abgelehnt",
] as const;
export type TeacherStatus = (typeof TEACHER_STATUSES)[number];

export const ATTENDANCE_STATUSES = ["present", "absent", "late", "excused"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

type Lang = "de" | "fr" | "ar";

export const GENDER_LABELS: Record<Gender, Record<Lang, string>> = {
  Männlich: { de: "Männlich", fr: "Masculin", ar: "ذكر" },
  Weiblich: { de: "Weiblich", fr: "Féminin", ar: "أنثى" },
};

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, Record<Lang, string>> = {
  Ledig: { de: "Ledig", fr: "Célibataire", ar: "أعزب" },
  Verheiratet: { de: "Verheiratet", fr: "Marié(e)", ar: "متزوج" },
  Geschieden: { de: "Geschieden", fr: "Divorcé(e)", ar: "مطلق" },
  Verwitwet: { de: "Verwitwet", fr: "Veuf/Veuve", ar: "أرمل" },
};