// src/lib/date.ts
// Date helpers shared by every form.
//
// Forms and the database always keep the ISO representation (`YYYY-MM-DD`);
// only the input and the review screens use `dd/mm/yyyy`. A native
// `<input type="date">` cannot be pinned to a fixed order because the browser
// renders it with the locale of the operating system, which is why the date
// fields are masked text inputs built from the helpers below.

/** Everything the form can be handed: an ISO string, a full ISO timestamp or a Date. */
export type DateLike = string | Date | null | undefined;

const DISPLAY_SEPARATOR = "/";
const DATE_DIGITS = 8;

/** Parses `YYYY-MM-DD` into a local Date, avoiding UTC parsing quirks. */
export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/** `2005-04-12` / `2005-04-12T10:00:00Z` / `Date` -> `12/04/2005`. */
export function formatDateForDisplay(value: DateLike): string {
  if (!value) return "";

  const iso =
    value instanceof Date
      ? toIsoDate(value)
      : value.split("T")[0].trim();

  const date = parseIsoDate(iso);
  if (!date) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}${DISPLAY_SEPARATOR}${month}${DISPLAY_SEPARATOR}${date.getFullYear()}`;
}

/** `Date` -> `YYYY-MM-DD` in local time. */
export function toIsoDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Drops digits that cannot belong to the date being typed: an out-of-range day
 * or month shifts the segment up, so `45` becomes `5` instead of trapping the
 * user in an impossible value.
 */
function sanitizeDigits(digits: string): string {
  let result = digits.slice(0, DATE_DIGITS);

  while (result.length > 0) {
    const day = result.slice(0, 2);
    const month = result.slice(2, 4);
    const dayOutOfRange = day.length === 2 && Number(day) > 31;
    const monthOutOfRange = month.length === 2 && Number(month) > 12;

    if (!dayOutOfRange && !monthOutOfRange) return result;
    result = dayOutOfRange
      ? result.slice(1)
      : result.slice(0, 2) + result.slice(3);
  }

  return result;
}

/** Inserts the separators while typing: `12042005` -> `12/04/2005`. */
export function formatDateInput(text: string): string {
  const digits = sanitizeDigits(text.replace(/\D/g, ""));

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}${DISPLAY_SEPARATOR}${digits.slice(2)}`;
  }
  return [
    digits.slice(0, 2),
    digits.slice(2, 4),
    digits.slice(4),
  ].join(DISPLAY_SEPARATOR);
}

export interface ParsedDateInput {
  /** ISO `YYYY-MM-DD`, or `null` while the date is incomplete or impossible. */
  iso: string | null;
  /** `true` once day, month and year have all been entered. */
  complete: boolean;
  /** `true` when `complete` and the value is a real calendar date. */
  valid: boolean;
}

/** Inverse of {@link formatDateInput}. */
export function parseDateInput(text: string): ParsedDateInput {
  const digits = text.replace(/\D/g, "").slice(0, DATE_DIGITS);
  if (digits.length < DATE_DIGITS) {
    return { iso: null, complete: false, valid: false };
  }

  const iso = `${digits.slice(4)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
  return { iso, complete: true, valid: parseIsoDate(iso) !== null };
}

/**
 * Index of the caret that sits directly after the nth digit of `text`, so the
 * mask can keep the cursor in place while separators are inserted.
 */
export function caretAfterDigit(text: string, digitCount: number): number {
  if (digitCount <= 0) return 0;

  let seen = 0;
  for (let index = 0; index < text.length; index += 1) {
    if (/\d/.test(text[index])) {
      seen += 1;
      if (seen === digitCount) return index + 1;
    }
  }
  return text.length;
}
