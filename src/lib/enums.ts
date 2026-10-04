// src/lib/enums.ts
// UI layer for the database enums.
//
// The canonical value sets live in db/lib/enums.ts – that file defines what is
// persisted in MySQL ENUM columns and lookup tables. This module re-exports
// them (so there is exactly one source of truth) and adds the localized labels
// the UI needs for `<select>` inputs. Never declare an enum value here that
// does not exist in db/lib/enums.ts.
import type { Locale } from "@/i18n/config";
import type {
  AdmissionStatus,
  AttendanceStatus,
  Gender,
  MaritalStatus,
  TeacherStatus,
} from "../../db/lib/enums";
import {
  ADMISSION_STATUSES,
  ATTENDANCE_STATUSES,
  MARITAL_STATUSES,
  TEACHER_STATUSES,
} from "../../db/lib/enums";

export * from "../../db/lib/enums";

export const GENDER_LABELS: Record<Gender, Record<Locale, string>> = {
  Männlich: { de: "Männlich", fr: "Masculin", ar: "ذكر" },
  Weiblich: { de: "Weiblich", fr: "Féminin", ar: "أنثى" },
};

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, Record<Locale, string>> = {
  Ledig: { de: "Ledig", fr: "Célibataire", ar: "أعزب" },
  Verheiratet: { de: "Verheiratet", fr: "Marié(e)", ar: "متزوج" },
  Geschieden: { de: "Geschieden", fr: "Divorcé(e)", ar: "مطلق" },
  Verwitwet: { de: "Verwitwet", fr: "Veuf/Veuve", ar: "أرمل" },
};

/** `students.admission_status` */
export const ADMISSION_STATUS_LABELS: Record<
  AdmissionStatus,
  Record<Locale, string>
> = {
  Eingeschrieben: { de: "Eingeschrieben", fr: "Inscrit", ar: "مسجل" },
  Exmatrikulation: { de: "Exmatrikulation", fr: "Exmatriculé", ar: "مستبعد" },
  "Ruhen der Rechte": {
    de: "Ruhen der Rechte",
    fr: "Droits suspendus",
    ar: "تعليق الحقوق",
  },
  Zulassungsantrag: {
    de: "Zulassungsantrag",
    fr: "Demande d'admission",
    ar: "طلب القبول",
  },
  "Antrag abgelehnt": {
    de: "Antrag abgelehnt",
    fr: "Demande refusée",
    ar: "تم رفض الطلب",
  },
};

/** `teachers.status` */
export const TEACHER_STATUS_LABELS: Record<TeacherStatus, Record<Locale, string>> = {
  "Antrag ausstehend": {
    de: "Antrag ausstehend",
    fr: "Demande en attente",
    ar: "طلب قيد الانتظار",
  },
  "Antrag storniert": {
    de: "Antrag storniert",
    fr: "Demande annulée",
    ar: "تم إلغاء الطلب",
  },
  Lehrend: { de: "Lehrend", fr: "Enseignant", ar: "مدرّس" },
  Ausgeschieden: { de: "Ausgeschieden", fr: "Retraité", ar: "متقاعد" },
  Ausgeschlossen: { de: "Ausgeschlossen", fr: "Exclu", ar: "مستبعد" },
};

/** `session_students.attendance` */
export const ATTENDANCE_STATUS_LABELS: Record<
  AttendanceStatus,
  Record<Locale, string>
> = {
  present: { de: "Anwesend", fr: "Présent", ar: "حاضر" },
  absent_with_reason: {
    de: "Abwesend (entschuldigt)",
    fr: "Absent (justifié)",
    ar: "غائب بعذر",
  },
  absent_without_reason: {
    de: "Abwesend (ohne Grund)",
    fr: "Absent (non justifié)",
    ar: "غائب بدون عذر",
  },
};

const asLabelEntries = <T extends string>(
  values: readonly T[],
  labels: Record<T, Record<Locale, string>>,
  locale: Locale,
): { value: T; label: string }[] =>
  values.map((value) => ({ value, label: labels[value][locale] }));

/** Ready-to-render options for a status `<select>`. */
export const admissionStatusOptions = (locale: Locale) =>
  asLabelEntries(ADMISSION_STATUSES, ADMISSION_STATUS_LABELS, locale);

export const teacherStatusOptions = (locale: Locale) =>
  asLabelEntries(TEACHER_STATUSES, TEACHER_STATUS_LABELS, locale);

export const attendanceStatusOptions = (locale: Locale) =>
  asLabelEntries(ATTENDANCE_STATUSES, ATTENDANCE_STATUS_LABELS, locale);

export const maritalStatusOptions = (locale: Locale) =>
  asLabelEntries(MARITAL_STATUSES, MARITAL_STATUS_LABELS, locale);
