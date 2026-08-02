import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  gender_id: number | null;
  address: string | null;
  phone: string | null;
  marital_status_id: number | null;
}

interface MembershipRow extends RowDataPacket {
  membership_type: string | null;
  status: string | null;
  start_date: string | null;
}

interface StudentRow extends RowDataPacket {
  id: number;
  relationship_type_id: number | null;
  is_primary: number | null;
  can_pickup: number | null;
}

interface ProfileUpdatePayload {
  user?: {
    first_name: string;
    last_name: string;
    birth_date: string | null;
    gender_code?: string;
    address: string | null;
    phone: string | null;
    marital_status_code?: string;
  };
  membership?: {
    sepa_account_holder: string | null;
    sepa_iban: string | null;
    sepa_bic: string | null;
    sepa_bank: string | null;
  };
  students?: Array<{
    id?: number;
    first_name: string;
    last_name: string;
    birth_date: string | null;
    gender_code?: string;
    emergency_contact: string | null;
    emergency_phone: string | null;
    medical_info: string | null;
    notes: string | null;
  }>;
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
       WHERE u.email = ?`,
      [authEmail],
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const user = userRows[0];

    // Get membership data by matching email
    const [membershipRows] = await connection.query<MembershipRow[]>(
      `SELECT m.*
       FROM memberships m
       WHERE m.email = ?`,
      [user.email],
    );

    let membership: MembershipRow | null = null;
    if (membershipRows.length > 0) {
      membership = membershipRows[0];
    }

    // Get students if user is a parent/guardian
    const [studentsRows] = await connection.query<StudentRow[]>(
      `SELECT s.*, sg.relationship_type_id, sg.is_primary, sg.can_pickup
       FROM students s
       JOIN student_guardians sg ON s.id = sg.student_id
       WHERE sg.user_id = ? AND s.deleted_at IS NULL`,
      [user.id],
    );

    const students = studentsRows;

    // Determine user type and format response accordingly
    let responseData:
      | {
          type: "membership";
          membership: UserRow &
            MembershipRow & {
              membership_type: string | null;
              status: string | null;
              membership_date: string | null;
            };
          educationRequester: UserRow | null;
          students: StudentRow[];
        }
      | {
          type: "education";
          educationRequester: UserRow;
          students: StudentRow[];
        }
      | {
          type: null;
          user: UserRow;
        };

    if (membership) {
      // User has membership - they are a member
      responseData = {
        type: "membership",
        membership: {
          ...user,
          ...membership,
          membership_type: membership.membership_type,
          status: membership.status,
          membership_date: membership.start_date,
        },
        educationRequester:
          studentsRows.length > 0
            ? {
                ...user,
              }
            : null,
        students: students,
      };
    } else if (studentsRows.length > 0) {
      // User has students but no membership - they are education only
      responseData = {
        type: "education",
        educationRequester: {
          ...user,
        },
        students: students,
      };
    } else {
      // User has neither membership nor students - return basic user info
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
    const [userRows] = await connection.query<UserRow[]>(
      "SELECT id FROM users WHERE email = ? AND deleted_at IS NULL",
      [authEmail],
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userRows[0].id;

    // Update user data
    if (data.user) {
      // Get gender_id if gender code provided
      let genderId = null;
      if (data.user.gender_code) {
        const [genderRows] = await connection.query<Array<{ id: number } & RowDataPacket>>(
          "SELECT id FROM genders WHERE code = ?",
          [data.user.gender_code],
        );
        genderId = genderRows[0]?.id ?? null;
      }

      // Get marital_status_id if provided
      let maritalStatusId = null;
      if (data.user.marital_status_code) {
        const [maritalStatusRows] = await connection.query<Array<{ id: number } & RowDataPacket>>(
          "SELECT id FROM marital_statuses WHERE code = ?",
          [data.user.marital_status_code],
        );
        maritalStatusId = maritalStatusRows[0]?.id ?? null;
      }

      await connection.query(
        `UPDATE users SET
          first_name = ?, last_name = ?, birth_date = ?, gender_id = ?,
          address = ?, phone = ?, marital_status_id = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          data.user.first_name,
          data.user.last_name,
          data.user.birth_date,
          genderId,
          data.user.address,
          data.user.phone,
          maritalStatusId,
          userId,
        ],
      );
    }

    // Update membership data if provided
    if (data.membership) {
      await connection.query(
        `UPDATE memberships SET
          sepa_account_holder = ?, sepa_iban = ?, sepa_bic = ?, sepa_bank = ?,
          updated_at = NOW()
         WHERE user_id = ?`,
        [
          data.membership.sepa_account_holder,
          data.membership.sepa_iban,
          data.membership.sepa_bic,
          data.membership.sepa_bank,
          userId,
        ],
      );
    }

    // Update students if provided
    if (data.students && Array.isArray(data.students)) {
      for (const student of data.students) {
        if (student.id) {
          // Update existing student
          let genderId = null;
          if (student.gender_code) {
            const [genderRows] = await connection.query<Array<{ id: number } & RowDataPacket>>(
              "SELECT id FROM genders WHERE code = ?",
              [student.gender_code],
            );
            genderId = genderRows[0]?.id ?? null;
          }

          await connection.query(
            `UPDATE students SET
              first_name = ?, last_name = ?, birth_date = ?, gender_id = ?,
              emergency_contact = ?, emergency_phone = ?, medical_info = ?, notes = ?,
              updated_at = NOW()
             WHERE id = ?`,
            [
              student.first_name,
              student.last_name,
              student.birth_date,
              genderId,
              student.emergency_contact,
              student.emergency_phone,
              student.medical_info,
              student.notes,
              student.id,
            ],
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
