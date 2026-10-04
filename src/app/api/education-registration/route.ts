import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import pool from "@/lib/db";
import { getOrCreateLookupId } from "@/lib/db-helpers";
import { sendEducationRegistrationConfirmation } from "@/lib/email";
import { calculateEducationFee, normalizeIban } from "@/lib/education";
import { DEFAULT_ADMISSION_STATUS, DEFAULT_MARITAL_STATUS } from "@/lib/enums";
import {
  collectFieldErrors,
  validateEducationRequest,
} from "@/lib/education-schema";
import type { EducationRequest } from "@/lib/education-schema";
import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

interface IdRow extends RowDataPacket {
  id: number;
}

interface ExistingStudentRow extends RowDataPacket {
  id: number;
  notes: string | null;
}

interface MembershipRow extends RowDataPacket {
  id: number;
}

const CONFIRMATION_PATH = "/api/education-registration/confirm";

interface MysqlError {
  code?: string;
  sqlMessage?: string;
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as MysqlError).code === "ER_DUP_ENTRY"
  );
}

/**
 * `users_name_birth_unique_idx` is a plain unique index, so an update can hit it
 * when the entered name belongs to a different account. That has to be reported
 * on the name fields instead of the generic duplicate error.
 */
function isGuardianNameConflict(error: unknown): boolean {
  return (
    isDuplicateKeyError(error) &&
    typeof (error as MysqlError).sqlMessage === "string" &&
    (error as MysqlError).sqlMessage!.includes("users_name_birth_unique_idx")
  );
}

/**
 * Inserts a user (or updates the existing one) and returns its id.
 * An existing account is matched on the e-mail and never duplicated: the wizard
 * announces the match beforehand, and the entered name, contact and SEPA data
 * replace what is stored.
 * `payment` is optional – a request without a SEPA mandate never touches the
 * banking columns of an existing account and inserts a new one with
 * `sepa_mandate_accepted = 0`.
 */
async function upsertGuardian(
  connection: PoolConnection,
  guardian: EducationRequest["guardian"],
  payment: EducationRequest["payment"],
): Promise<number> {
  const iban = normalizeIban(payment?.iban ?? "");

  const [existingRows] = await connection.query<IdRow[]>(
    "SELECT id FROM users WHERE email = ? AND deleted_at IS NULL",
    [guardian.email],
  );

  if (existingRows.length > 0) {
    const userId = existingRows[0].id;
    // The account already exists, so nothing is inserted: every value the
    // applicant entered becomes the stored one, optional fields included.
    await connection.query(
      `UPDATE users SET
         first_name = ?,
         last_name = ?,
         gender = ?,
         birth_date = COALESCE(?, birth_date),
         marital_status = COALESCE(?, marital_status),
         phone = COALESCE(?, phone),
         phone2 = COALESCE(?, phone2),
         address = COALESCE(?, address),
         bank = COALESCE(?, bank),
         iban = COALESCE(?, iban),
         bic = COALESCE(?, bic),
         bank_account_holder = COALESCE(?, bank_account_holder),
         sepa_mandate_accepted = COALESCE(?, sepa_mandate_accepted)
       WHERE id = ?`,
      [
        guardian.firstName,
        guardian.lastName,
        guardian.gender,
        guardian.birthDate ?? null,
        guardian.maritalStatus ?? null,
        guardian.phone || null,
        guardian.phone2 ?? null,
        guardian.address || null,
        payment?.bank || null,
        iban || null,
        payment?.bic || null,
        payment?.accountHolder || null,
        payment ? 1 : null,
        userId,
      ],
    );
    return userId;
  }

  const [result] = await connection.query<ResultSetHeader>(
    `INSERT INTO users (
       email, first_name, last_name, birth_date, gender, marital_status,
       phone, phone2, address, bank, iban, bic, bank_account_holder,
       sepa_mandate_accepted, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      guardian.email,
      guardian.firstName,
      guardian.lastName,
      guardian.birthDate ?? null,
      guardian.gender,
      guardian.maritalStatus || DEFAULT_MARITAL_STATUS,
      guardian.phone || null,
      guardian.phone2 || null,
      guardian.address || null,
      payment?.bank || null,
      iban || null,
      payment?.bic || null,
      payment?.accountHolder || null,
      payment ? 1 : 0,
    ],
  );

  return result.insertId;
}

async function findOrCreateUserForGuardian(
  connection: PoolConnection,
  guardian: NonNullable<EducationRequest["secondaryGuardian"]>,
): Promise<number> {
  const [existingRows] = await connection.query<IdRow[]>(
    "SELECT id FROM users WHERE email = ? AND deleted_at IS NULL",
    [guardian.email],
  );

  if (existingRows.length > 0) {
    await connection.query(
      `UPDATE users SET
         first_name = ?,
         last_name = ?,
         gender = ?,
         birth_date = COALESCE(?, birth_date),
         marital_status = COALESCE(?, marital_status),
         phone = COALESCE(?, phone),
         phone2 = COALESCE(?, phone2),
         address = COALESCE(?, address)
       WHERE id = ?`,
      [
        guardian.firstName,
        guardian.lastName,
        guardian.gender,
        guardian.birthDate ?? null,
        guardian.maritalStatus ?? null,
        guardian.phone || null,
        guardian.phone2 ?? null,
        guardian.address || null,
        existingRows[0].id,
      ],
    );
    return existingRows[0].id;
  }

  const [result] = await connection.query<ResultSetHeader>(
    `INSERT INTO users (
       email, first_name, last_name, birth_date, gender, marital_status,
       phone, phone2, address, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      guardian.email,
      guardian.firstName,
      guardian.lastName,
      guardian.birthDate ?? null,
      guardian.gender,
      guardian.maritalStatus || DEFAULT_MARITAL_STATUS,
      guardian.phone || null,
      guardian.phone2 ?? null,
      guardian.address || null,
    ],
  );

  return result.insertId;
}

interface ExistingStudentRequest {
  firstName: string;
  lastName: string;
  birthDate: string;
}

/**
 * Looks the child up case-insensitively, matching the collation of the
 * `students_name_birth_unique_idx` index.
 */
async function findExistingStudent(
  connection: PoolConnection,
  student: ExistingStudentRequest,
): Promise<{ id: number; notes: string | null } | null> {
  const [rows] = await connection.query<ExistingStudentRow[]>(
    `SELECT s.id, s.first_name, s.last_name, s.birth_date, s.notes
     FROM students s
     WHERE s.deleted_at IS NULL
       AND LOWER(s.first_name) = ?
       AND LOWER(s.last_name) = ?
       AND s.birth_date = ?
     LIMIT 1`,
    [
      student.firstName.trim().toLowerCase(),
      student.lastName.trim().toLowerCase(),
      student.birthDate,
    ],
  );

  return rows.length > 0 ? { id: rows[0].id, notes: rows[0].notes } : null;
}

/** `user_student_unique_idx` makes a second link for the same pair impossible. */
async function linkGuardian(
  connection: PoolConnection,
  studentId: number,
  userId: number,
  relationshipTypeId: number,
  isPrimary: boolean,
  canPickup: boolean,
  schoolRulesAccepted: boolean,
): Promise<void> {
  await connection.query(
    `INSERT INTO student_guardians (
       student_id, user_id, relationship_type_id, is_primary, can_pickup,
       school_rules_accepted, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       relationship_type_id = VALUES(relationship_type_id),
       is_primary = VALUES(is_primary),
       can_pickup = VALUES(can_pickup),
       school_rules_accepted = VALUES(school_rules_accepted),
       deleted_at = NULL`,
    [
      studentId,
      userId,
      relationshipTypeId,
      isPrimary,
      canPickup,
      schoolRulesAccepted,
    ],
  );
}

/**
 * Both consents are stored as columns (`students.media_*` and
 * `student_guardians.school_rules_accepted`), so `students.notes` only ever
 * holds the text the guardian typed. The helper drops a consent block written by
 * an older version, which would otherwise survive forever in the free text.
 */
function parentNotesOnly(notes: string | null | undefined): string | null {
  if (!notes) return null;
  const marker = notes.indexOf("[Einverständnis]");
  const parentNotes = (marker === -1 ? notes : notes.slice(0, marker)).trim();
  return parentNotes || null;
}

export async function POST(request: NextRequest) {
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "generic" }, { status: 400 });
    }

    const parsed = validateEducationRequest(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "generic",
          fieldErrors: collectFieldErrors(parsed.error),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const { guardian, secondaryGuardian, students, payment, consents } = data;

    await connection.beginTransaction();
    transactionStarted = true;

    // Guardians
    const guardianUserId = await upsertGuardian(connection, guardian, payment);
    const secondaryUserId = secondaryGuardian
      ? await findOrCreateUserForGuardian(connection, secondaryGuardian)
      : null;

    const primaryRelationshipId = await getOrCreateLookupId(
      connection,
      "relationship_types",
      guardian.relationship,
    );
    const secondaryRelationshipId = secondaryGuardian
      ? await getOrCreateLookupId(
          connection,
          "relationship_types",
          secondaryGuardian.relationship,
        )
      : null;

    // Students (+ guardian links). A child is identified by the unique index on
    // first_name + last_name + birth_date, so re-submitting an existing child
    // only adds the missing guardian links instead of creating a duplicate.
    let studentsCreated = 0;
    let studentsLinked = 0;

    for (const student of students) {
      const existing = await findExistingStudent(connection, student);
      let studentId: number;

      // The permissions are declared per child, so they are stored per child.
      const mediaFlags = [
        student.consents.mediaOnline,
        student.consents.mediaPrint,
        student.consents.mediaPromotion,
      ] as const;

      if (existing) {
        studentId = existing.id;
        studentsLinked += 1;
        // A re-submission restates the permissions, so the latest declaration
        // replaces the stored one.
        await connection.query(
          `UPDATE students SET
             media_online = ?,
             media_print = ?,
             media_promotion = ?,
             notes = ?
           WHERE id = ?`,
          [
            ...mediaFlags,
            // A note entered now replaces the stored one; without a new note the
            // previously entered text is kept.
            parentNotesOnly(student.notes) ?? parentNotesOnly(existing.notes),
            studentId,
          ],
        );
      } else {
        const [studentResult] = await connection.query<ResultSetHeader>(
          `INSERT INTO students (
             first_name, last_name, birth_date, gender, estimated_level,
             admission_status, media_online, media_print, media_promotion,
             notes, created_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            student.firstName,
            student.lastName,
            student.birthDate,
            student.gender,
            student.estimatedLevel ?? null,
            DEFAULT_ADMISSION_STATUS,
            ...mediaFlags,
            parentNotesOnly(student.notes),
          ],
        );
        studentId = studentResult.insertId;
        studentsCreated += 1;
      }

      // The first responsible person is the legal guardian and can always
      // collect the child; only a second person has to be authorised for it.
      await linkGuardian(
        connection,
        studentId,
        guardianUserId,
        primaryRelationshipId,
        true,
        true,
        consents.schoolRulesAccepted,
      );

      if (secondaryUserId && secondaryRelationshipId) {
        await linkGuardian(
          connection,
          studentId,
          secondaryUserId,
          secondaryRelationshipId,
          false,
          secondaryGuardian?.canPickup ?? false,
          consents.schoolRulesAccepted,
        );
      }
    }

    // The fee is derived from the database, never from the client payload.
    const [membershipRows] = await connection.query<MembershipRow[]>(
      `SELECT m.id FROM memberships m
       WHERE m.user_id = ? AND m.deleted_at IS NULL
       LIMIT 1`,
      [guardianUserId],
    );
    const isMember = membershipRows.length > 0;
    const fee = calculateEducationFee({ isMember, childCount: students.length });

    // Confirmation token for the education verification flow
    const confirmationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await connection.query(
      `INSERT INTO auth_tokens (user_id, token, token_type, expires_at, created_at)
       VALUES (?, ?, 'education_confirmation', ?, NOW())`,
      [guardianUserId, confirmationToken, expiresAt],
    );

    await connection.commit();
    transactionStarted = false;

    try {
      await sendEducationRegistrationConfirmation({
        email: guardian.email,
        firstName: guardian.firstName,
        lang: data.lang,
        confirmationUrl: `${process.env.BASE_URL}${CONFIRMATION_PATH}?token=${confirmationToken}&lang=${data.lang}`,
        students: students.map((student) => ({
          name: `${student.firstName} ${student.lastName}`,
          birthDate: student.birthDate,
        })),
        totalAmount: fee.total,
      });
      console.log(
        `✓ Education registration confirmation email sent to ${guardian.email}`,
      );
    } catch (emailError) {
      // Never fail the registration because of a mail problem.
      console.error("Failed to send confirmation email:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        userId: guardianUserId,
        studentsCreated,
        studentsLinked,
        fee: { total: fee.total, isMember },
      },
      { status: 201 },
    );
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }

    // The pre-checks above are case-insensitive lookups, so a concurrent
    // request can still win the race on the unique indexes.
    if (isGuardianNameConflict(error)) {
      return NextResponse.json(
        {
          error: "guardianNameTaken",
          fieldErrors: {
            "guardian.firstName": "guardianNameTaken",
            "guardian.lastName": "guardianNameTaken",
          },
        },
        { status: 409 },
      );
    }

    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { error: "duplicateStudent", fieldErrors: { students: "duplicateStudent" } },
        { status: 409 },
      );
    }

    console.error("Education registration error:", error);
    return NextResponse.json({ error: "serverError" }, { status: 500 });
  } finally {
    connection.release();
  }
}
