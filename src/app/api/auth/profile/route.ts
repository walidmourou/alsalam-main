import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authEmail = cookieStore.get("auth_email")?.value;

    if (!authEmail) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is a membership member (exclude soft-deleted)
    const [membershipRows] = await pool.query(
      "SELECT * FROM memberships WHERE email = ? AND deleted_at IS NULL",
      [authEmail]
    );

    if ((membershipRows as any[]).length > 0) {
      const membership = (membershipRows as any[])[0];

      // Get associated education data for membership users
      const [educationRows] = await pool.query(
        "SELECT * FROM education_requesters WHERE email = ? AND deleted_at IS NULL",
        [authEmail]
      );

      let educationRequester = null;
      let students = [];

      if ((educationRows as any[]).length > 0) {
        educationRequester = (educationRows as any[])[0];

        // Get associated students (excluding soft-deleted ones)
        const [studentRows] = await pool.query(
          "SELECT * FROM education_students WHERE requester_id = ? AND deleted_at IS NULL",
          [educationRequester.id]
        );
        students = studentRows as any[];
      }

      return NextResponse.json({
        type: "membership",
        membership,
        educationRequester,
        students,
      });
    }

    // Check if user is an education requester (exclude soft-deleted)
    const [educationRows] = await pool.query(
      "SELECT * FROM education_requesters WHERE email = ? AND deleted_at IS NULL",
      [authEmail]
    );

    if ((educationRows as any[]).length > 0) {
      const educationRequester = (educationRows as any[])[0];

      // Get associated students (excluding soft-deleted ones)
      const [studentRows] = await pool.query(
        "SELECT * FROM education_students WHERE requester_id = ? AND deleted_at IS NULL",
        [educationRequester.id]
      );

      return NextResponse.json({
        type: "education",
        membership: null,
        educationRequester,
        students: studentRows as any[],
      });
    }

    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authEmail = cookieStore.get("auth_email")?.value;

    if (!authEmail) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const data = await request.json();

    if (data.type === "membership") {
      // Update membership data
      await pool.query(
        `UPDATE memberships SET
          first_name = ?, last_name = ?, birth_date = ?, gender = ?,
          address = ?, phone = ?, marital_status = ?,
          sepa_account_holder = ?, sepa_iban = ?, sepa_bic = ?, sepa_bank = ?,
          updated_at = NOW()
         WHERE email = ?`,
        [
          data.membership.first_name,
          data.membership.last_name,
          data.membership.birth_date,
          data.membership.gender,
          data.membership.address,
          data.membership.phone,
          data.membership.marital_status,
          data.membership.sepa_account_holder,
          data.membership.sepa_iban,
          data.membership.sepa_bic,
          data.membership.sepa_bank,
          authEmail,
        ]
      );
    } else if (data.type === "education") {
      // Update education requester data
      await pool.query(
        `UPDATE education_requesters SET
          first_name = ?, last_name = ?, address = ?, phone = ?,
          responsible_first_name = ?, responsible_last_name = ?,
          responsible_address = ?, responsible_email = ?, responsible_phone = ?,
          consent_media_online = ?, consent_media_print = ?, consent_media_promotion = ?,
          sepa_account_holder = ?, sepa_iban = ?, sepa_bic = ?, sepa_bank = ?,
          updated_at = NOW()
         WHERE email = ?`,
        [
          data.educationRequester.first_name,
          data.educationRequester.last_name,
          data.educationRequester.address,
          data.educationRequester.phone,
          data.educationRequester.responsible_first_name,
          data.educationRequester.responsible_last_name,
          data.educationRequester.responsible_address,
          data.educationRequester.responsible_email,
          data.educationRequester.responsible_phone,
          data.educationRequester.consent_media_online,
          data.educationRequester.consent_media_print,
          data.educationRequester.consent_media_promotion,
          data.educationRequester.sepa_account_holder,
          data.educationRequester.sepa_iban,
          data.educationRequester.sepa_bic,
          data.educationRequester.sepa_bank,
          authEmail,
        ]
      );

      // Update students if provided
      if (data.students && Array.isArray(data.students)) {
        // First, delete existing students
        const [requesterRows] = await pool.query(
          "SELECT id FROM education_requesters WHERE email = ?",
          [authEmail]
        );
        const requesterId = (requesterRows as any[])[0].id;

        await pool.query(
          "DELETE FROM education_students WHERE requester_id = ?",
          [requesterId]
        );

        // Insert updated students
        for (const student of data.students) {
          await pool.query(
            `INSERT INTO education_students (
              requester_id, first_name, last_name, birth_date, estimated_level
            ) VALUES (?, ?, ?, ?, ?)`,
            [
              requesterId,
              student.first_name,
              student.last_name,
              student.birth_date,
              student.estimated_level,
            ]
          );
        }
      }
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
