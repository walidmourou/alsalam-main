import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function GET() {
  const connection = await pool.getConnection();
  try {
    const cookieStore = await cookies();
    const authEmail = cookieStore.get("auth_email")?.value;

    if (!authEmail) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user data from users table
    const [userRows] = await connection.query(
      `SELECT u.*
       FROM users u
       WHERE u.email = ?`,
      [authEmail],
    );

    if ((userRows as any[]).length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const user = (userRows as any[])[0];

    // Get membership data by matching email
    const [membershipRows] = await connection.query(
      `SELECT m.*
       FROM memberships m
       WHERE m.email = ?`,
      [user.email],
    );

    let membership = null;
    if ((membershipRows as any[]).length > 0) {
      membership = (membershipRows as any[])[0];
    }

    // Get students if user is a parent/guardian
    const [studentsRows] = await connection.query(
      `SELECT s.*, sg.relationship_type_id, sg.is_primary, sg.can_pickup
       FROM students s
       JOIN student_guardians sg ON s.id = sg.student_id
       WHERE sg.user_id = ? AND s.deleted_at IS NULL`,
      [user.id],
    );

    const students = studentsRows;

    // Determine user type and format response accordingly
    let responseData: any;

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
          (studentsRows as any[]).length > 0
            ? {
                ...user,
              }
            : null,
        students: students,
      };
    } else if ((studentsRows as any[]).length > 0) {
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

    const data = await request.json();

    await connection.beginTransaction();

    // Get user_id
    const [userRows] = await connection.query(
      "SELECT id FROM users WHERE email = ? AND deleted_at IS NULL",
      [authEmail],
    );

    if ((userRows as any[]).length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = (userRows as any[])[0].id;

    // Update user data
    if (data.user) {
      // Get gender_id if gender code provided
      let genderId = null;
      if (data.user.gender_code) {
        const [genderRows] = await connection.query(
          "SELECT id FROM genders WHERE code = ?",
          [data.user.gender_code],
        );
        genderId = (genderRows as any[])[0]?.id;
      }

      // Get marital_status_id if provided
      let maritalStatusId = null;
      if (data.user.marital_status_code) {
        const [maritalStatusRows] = await connection.query(
          "SELECT id FROM marital_statuses WHERE code = ?",
          [data.user.marital_status_code],
        );
        maritalStatusId = (maritalStatusRows as any[])[0]?.id;
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
            const [genderRows] = await connection.query(
              "SELECT id FROM genders WHERE code = ?",
              [student.gender_code],
            );
            genderId = (genderRows as any[])[0]?.id;
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
