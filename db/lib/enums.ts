// db/lib/enums.ts
// Canonical enum value sets. These are the values that are persisted in MySQL
// ENUM columns and lookup tables, so every other module (Drizzle schema, API
// routes, forms) must import them from here instead of redeclaring them.

export const GENDERS = ["Männlich", "Weiblich"] as const;
export type Gender = (typeof GENDERS)[number];
export const DEFAULT_GENDER: Gender = "Männlich";

export const MARITAL_STATUSES = [
  "Ledig",
  "Verheiratet",
  "Geschieden",
  "Verwitwet",
] as const;
export type MaritalStatus = (typeof MARITAL_STATUSES)[number];
export const DEFAULT_MARITAL_STATUS: MaritalStatus = "Ledig";

export const ADMISSION_STATUSES = [
  "Eingeschrieben",
  "Exmatrikulation",
  "Ruhen der Rechte",
  "Zulassungsantrag",
  "Antrag abgelehnt",
] as const;
export const DEFAULT_ADMISSION_STATUS: AdmissionStatus = "Zulassungsantrag";
export type AdmissionStatus = (typeof ADMISSION_STATUSES)[number];

export const TEACHER_STATUSES = [
  "Antrag ausstehend",
  "Antrag storniert",
  "Lehrend",
  "Ausgeschieden",
  "Ausgeschlossen",
] as const;
export const DEFAULT_TEACHER_STATUS: TeacherStatus = "Antrag ausstehend";
export type TeacherStatus = (typeof TEACHER_STATUSES)[number];

export const ATTENDANCE_STATUSES = [
  "present",
  "absent_with_reason",
  "absent_without_reason",
] as const;
export const DEFAULT_ATTENDANCE_STATUS: AttendanceStatus = "present";
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const DEFAULT_MEMBERSHIP_STATUS = "Ausstehend" as const;
export const MEMBERSHIP_STATUS_ACTIVE = "Aktiv" as const;
export const DEFAULT_MEMBERSHIP_TYPE = "Aktivmitglied" as const;
export const MEMBERSHIP_TYPE_SINGLE = "Einzelmitgliedschaft" as const;

/**
 * `relationship_types.label` is a lookup table, not an ENUM column, but the
 * education/profile flows always store the same canonical label.
 */
export const RELATIONSHIP_PARENT = "Elternteil" as const;