import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function DELETE(request: NextRequest) {
  const connection = await pool.getConnection();
  try {
    const cookieStore = await cookies();
    const authEmail = cookieStore.get("auth_email")?.value;

    if (!authEmail) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 },
      );
    }

    // Verify the student belongs to the authenticated user and is not already deleted
    const [studentRows] = await connection.query(
      `SELECT s.id 
       FROM students s
       JOIN student_guardians sg ON s.id = sg.student_id
       JOIN users u ON sg.user_id = u.id
       WHERE s.id = ? AND u.email = ? AND s.deleted_at IS NULL`,
      [studentId, authEmail],
    );

    if ((studentRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Student not found or access denied" },
        { status: 404 },
      );
    }

    // Soft delete the student
    await connection.query(
      "UPDATE students SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL",
      [studentId],
    );

    return NextResponse.json({
      message: "Student education registration cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling student education:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}

export async function POST(request: NextRequest) {
  const connection = await pool.getConnection();
  try {
    const cookieStore = await cookies();
    const authEmail = cookieStore.get("auth_email")?.value;

    if (!authEmail) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { first_name, last_name, birth_date, gender_code } =
      await request.json();

    // Validate required fields
    if (!first_name || !last_name || !birth_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await connection.beginTransaction();

    // Get the user ID for the authenticated user
    const [userRows] = await connection.query(
      "SELECT id FROM users WHERE email = ? AND deleted_at IS NULL",
      [authEmail],
    );

    if ((userRows as any[]).length === 0) {
      await connection.rollback();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = (userRows as any[])[0].id;

    // Get gender_id if provided
    let genderId = null;
    if (gender_code) {
      const [genderRows] = await connection.query(
        "SELECT id FROM genders WHERE code = ?",
        [gender_code],
      );
      genderId = (genderRows as any[])[0]?.id;
    }

    // Insert the new student
    const [studentResult] = await connection.query(
      `INSERT INTO students (first_name, last_name, birth_date, gender_id, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [first_name, last_name, birth_date, genderId],
    );

    const newStudentId = (studentResult as any).insertId;

    // Get relationship_type_id for 'parent'
    const [relationshipRows] = await connection.query(
      "SELECT id FROM relationship_types WHERE code = ?",
      ["parent"],
    );
    const relationshipTypeId = (relationshipRows as any[])[0]?.id || 1;

    // Link student to guardian
    await connection.query(
      `INSERT INTO student_guardians (student_id, user_id, relationship_type_id, is_primary, can_pickup, created_at)
       VALUES (?, ?, ?, true, true, NOW())`,
      [newStudentId, userId, relationshipTypeId],
    );

    await connection.commit();

    return NextResponse.json({
      message: "New child added successfully",
      studentId: newStudentId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error adding new child:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
