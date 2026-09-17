import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { getOrCreateLookupId } from "@/lib/db-helpers";
import { GENDERS, MARITAL_STATUSES } from "@/lib/enums";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string | null;
  address: string | null;
  phone: string | null;
  marital_status: string;
  bank: string | null;
  iban: string | null;
  bic: string | null;
  bank_account_holder: string | null;
  sepa_mandate_accepted: number | boolean;
}

interface MembershipRow extends RowDataPacket {
  status_label: string;
  membership_type: string;
  start_date: string | null;
}

interface StudentRow extends RowDataPacket {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  notes: string | null;
  estimated_level: string | null;
  admission_status: string;
}

interface ProfileUpdatePayload {
  type?: "membership" | "education";
  membership?: {
    first_name?: string;
    last_name?: string;
    birth_date?: string | null;
    gender?: string;
    address?: string;
    phone?: string;
    marital_status?: string;
    sepa_account_holder?: string;
    sepa_iban?: string;
    sepa_bic?: string;
    sepa_bank?: string;
  };
  educationRequester?: {
    first_name?: string;
    last_name?: string;
    birth_date?: string | null;
    gender?: string;
    address?: string;
    phone?: string;
    marital_status?: string;
    sepa_account_holder?: string;
    sepa_iban?: string;
    sepa_bic?: string;
    sepa_bank?: string;
  };
  students?: Array<{
    id?: number;
    first_name?: string;
    last_name?: string;
    birth_date?: string;
    gender?: string;
    notes?: string;
    estimated_level?: string;
  }>;
}

const VALID_GENDERS = new Set<string>(GENDERS);
const VALID_MARITAL_STATUSES = new Set<string>(MARITAL_STATUSES);

function mapUserToClient(user: UserRow) {
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    birth_date: user.birth_date,
    gender: user.gender,
    address: user.address,
    phone: user.phone,
    marital_status: user.marital_status,
    sepa_account_holder: user.bank_account_holder,
    sepa_iban: user.iban,
    sepa_bic: user.bic,
    sepa_bank: user.bank,
  };
}

export async function GET() {
  const connection = await pool.getConnection();
  try {
    const cookieStore = await cookies();
    const authEmail = cookieStore.get("auth_email")?.value;

    if (!authEmail) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user data from users table
    const [userRows] = await connection.query<UserRow[]>(
      `SELECT u.*
       FROM users u
       WHERE u.email = ? AND u.deleted_at IS NULL`,
      [authEmail],
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const user = userRows[0];

    // Get membership data linked to the user
    const [membershipRows] = await connection.query<MembershipRow[]>(
      `SELECT ms.label AS status_label, mt.label AS membership_type, m.start_date
       FROM memberships m
       JOIN membership_statuses ms ON m.membership_status_id = ms.id
       JOIN membership_types mt ON m.membership_type_id = mt.id
       WHERE m.user_id = ? AND m.deleted_at IS NULL
       LIMIT 1`,
      [user.id],
    );

    const membership = membershipRows[0] ?? null;

    // Get students if user is a parent/guardian
    const [studentsRows] = await connection.query<StudentRow[]>(
      `SELECT s.*
       FROM students s
       JOIN student_guardians sg ON s.id = sg.student_id
       WHERE sg.user_id = ? AND s.deleted_at IS NULL`,
      [user.id],
    );

    const membershipData = membership
      ? {
          ...mapUserToClient(user),
          status: membership.status_label,
          membership_type: membership.membership_type,
          start_date: membership.start_date,
        }
      : null;

    const educationRequesterData =
      userRows.length > 0
        ? {
            ...mapUserToClient(user),
            education_id: null,
            responsible_first_name: "",
            responsible_last_name: "",
            responsible_address: "",
            responsible_email: "",
            responsible_phone: "",
            consent_media_online: false,
            consent_media_print: false,
            consent_media_promotion: false,
            status: studentsRows[0]?.admission_status ?? "Zulassungsantrag",
          }
        : null;

    let responseData:
      | {
          type: "membership";
          membership: typeof membershipData & { membership_type: string };
          educationRequester: typeof educationRequesterData;
          students: StudentRow[];
        }
      | {
          type: "education";
          educationRequester: typeof educationRequesterData;
          students: StudentRow[];
        }
      | {
          type: null;
          user: typeof user;
        };

    if (membership) {
      responseData = {
        type: "membership",
        membership: membershipData as typeof membershipData & {
          membership_type: string;
        },
        educationRequester:
          studentsRows.length > 0 ? educationRequesterData : null,
        students: studentsRows,
      };
    } else if (studentsRows.length > 0) {
      responseData = {
        type: "education",
        educationRequester: educationRequesterData,
        students: studentsRows,
      };
    } else {
      responseData = {
        type: null,
        user,
      };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}

export async function PUT(request: NextRequest) {
  const connection = await pool.getConnection();
  try {
    const cookieStore = await cookies();
    const authEmail = cookieStore.get("auth_email")?.value;

    if (!authEmail) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const data = (await request.json()) as ProfileUpdatePayload;

    await connection.beginTransaction();

    // Get user_id
    const [userRows] = await connection.query<Array<{ id: number } & RowDataPacket>>(
      "SELECT id FROM users WHERE email = ? AND deleted_at IS NULL",
      [authEmail],
    );

    if (userRows.length === 0) {
      await connection.rollback();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userRows[0].id;

    const source =
      data.type === "membership" ? data.membership : data.educationRequester;

    // Update user data (personal + banking fields from either membership or
    // education requester source objects)
    if (source) {
      const gender =
        source.gender && VALID_GENDERS.has(source.gender)
          ? source.gender
          : undefined;
      const maritalStatus =
        source.marital_status && VALID_MARITAL_STATUSES.has(source.marital_status)
          ? source.marital_status
          : undefined;

      // SEPA lives on users in the new schema
      const bank = source.sepa_bank ?? undefined;
      const iban = source.sepa_iban ?? undefined;
      const bic = source.sepa_bic ?? undefined;
      const bankAccountHolder = source.sepa_account_holder ?? undefined;

      await connection.query(
        `UPDATE users SET
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          birth_date = COALESCE(?, birth_date),
          gender = ?, address = COALESCE(?, address),
          phone = COALESCE(?, phone),
          marital_status = COALESCE(?, marital_status),
          bank = COALESCE(?, bank),
          iban = COALESCE(?, iban),
          bic = COALESCE(?, bic),
          bank_account_holder = COALESCE(?, bank_account_holder),
          updated_at = NOW()
         WHERE id = ?`,
        [
          source.first_name ?? undefined,
          source.last_name ?? undefined,
          source.birth_date ?? undefined,
          gender ?? undefined,
          source.address ?? undefined,
          source.phone ?? undefined,
          maritalStatus ?? undefined,
          bank ?? undefined,
          iban ?? undefined,
          bic ?? undefined,
          bankAccountHolder ?? undefined,
          userId,
        ],
      );
    }

    // Update students if provided
    if (data.students && Array.isArray(data.students)) {
      for (const student of data.students) {
        const studentGender =
          student.gender && VALID_GENDERS.has(student.gender)
            ? student.gender
            : undefined;

        if (student.id) {
          // Update existing student (only if the authenticated user is a guardian)
          await connection.query(
            `UPDATE students SET
              first_name = COALESCE(?, first_name),
              last_name = COALESCE(?, last_name),
              birth_date = COALESCE(?, birth_date),
              gender = ?, estimated_level = COALESCE(?, estimated_level),
              notes = COALESCE(?, notes),
              updated_at = NOW()
             WHERE id = ? AND deleted_at IS NULL
             AND EXISTS (
               SELECT 1 FROM student_guardians sg
               WHERE sg.student_id = students.id AND sg.user_id = ?
             )`,
            [
              student.first_name ?? undefined,
              student.last_name ?? undefined,
              student.birth_date ?? undefined,
              studentGender ?? undefined,
              student.estimated_level ?? undefined,
              student.notes ?? undefined,
              student.id,
              userId,
            ],
          );
        } else if (student.first_name && student.last_name && student.birth_date) {
          // Insert new student linked to the authenticated user
          const [studentResult] = await connection.query<ResultSetHeader>(
            `INSERT INTO students (
              first_name, last_name, birth_date, gender, estimated_level, notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
              student.first_name,
              student.last_name,
              student.birth_date,
              studentGender ?? "Keine Angabe",
              student.estimated_level ?? null,
              student.notes ?? null,
            ],
          );
          const studentId = studentResult.insertId;

          const relationshipTypeId = await getOrCreateLookupId(
            connection,
            "relationship_types",
            "Elternteil",
          );

          await connection.query(
            `INSERT INTO student_guardians (
              student_id, user_id, relationship_type_id, is_primary, can_pickup, created_at
            ) VALUES (?, ?, ?, true, true, NOW())`,
            [studentId, userId, relationshipTypeId],
          );
        }
      }
    }

    await connection.commit();

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}