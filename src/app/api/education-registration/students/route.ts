import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function DELETE(request: NextRequest) {
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
        { status: 400 }
      );
    }

    // Verify the student belongs to the authenticated user and is not already deleted
    const [studentRows] = await pool.query(
      `SELECT es.id FROM education_students es
       JOIN education_requesters er ON es.requester_id = er.id
       WHERE es.id = ? AND er.email = ? AND es.deleted_at IS NULL`,
      [studentId, authEmail]
    );

    if ((studentRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Student not found or access denied" },
        { status: 404 }
      );
    }

    // Soft delete the student
    await pool.query(
      "UPDATE education_students SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL",
      [studentId]
    );

    return NextResponse.json({
      message: "Student education registration cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling student education:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authEmail = cookieStore.get("auth_email")?.value;

    if (!authEmail) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { first_name, last_name, birth_date, estimated_level } =
      await request.json();

    // Validate required fields
    if (!first_name || !last_name || !birth_date || !estimated_level) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the requester ID for the authenticated user
    const [requesterRows] = await pool.query(
      "SELECT id FROM education_requesters WHERE email = ?",
      [authEmail]
    );

    if ((requesterRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Education requester not found" },
        { status: 404 }
      );
    }

    const requesterId = (requesterRows as any[])[0].id;

    // Insert the new student
    const [result] = await pool.query(
      `INSERT INTO education_students (
        requester_id, first_name, last_name, birth_date, estimated_level
      ) VALUES (?, ?, ?, ?, ?)`,
      [requesterId, first_name, last_name, birth_date, estimated_level]
    );

    const newStudentId = (result as any).insertId;

    return NextResponse.json({
      message: "New child added successfully",
      studentId: newStudentId,
    });
  } catch (error) {
    console.error("Error adding new child:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
