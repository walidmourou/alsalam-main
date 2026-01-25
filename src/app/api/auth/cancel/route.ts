import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function POST(request: NextRequest) {
  const connection = await pool.getConnection();
  try {
    const cookieStore = await cookies();
    const authEmail = cookieStore.get("auth_email")?.value;

    if (!authEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type } = await request.json();
    if (!type || !["membership", "education"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    await connection.beginTransaction();

    try {
      // Get user_id
      const [userRows] = await connection.query(
        "SELECT id FROM users WHERE email = ? AND deleted_at IS NULL",
        [authEmail],
      );

      if ((userRows as any[]).length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const userId = (userRows as any[])[0].id;

      if (type === "membership") {
        // Soft delete membership by setting deleted_at timestamp
        const [result] = await connection.query(
          "UPDATE memberships SET deleted_at = NOW(), updated_at = NOW() WHERE user_id = ? AND deleted_at IS NULL",
          [userId],
        );

        if ((result as any).affectedRows === 0) {
          await connection.rollback();
          return NextResponse.json(
            { error: "Membership not found or already cancelled" },
            { status: 404 },
          );
        }

        // Soft delete all students linked to this user as guardian
        const [studentGuardiansRows] = await connection.query(
          "SELECT student_id FROM student_guardians WHERE user_id = ?",
          [userId],
        );

        for (const row of studentGuardiansRows as any[]) {
          await connection.query(
            "UPDATE students SET deleted_at = NOW(), updated_at = NOW() WHERE id = ? AND deleted_at IS NULL",
            [row.student_id],
          );
        }
      } else if (type === "education") {
        // Get students linked to this user
        const [studentGuardiansRows] = await connection.query(
          "SELECT student_id FROM student_guardians WHERE user_id = ?",
          [userId],
        );

        if ((studentGuardiansRows as any[]).length === 0) {
          await connection.rollback();
          return NextResponse.json(
            { error: "Education request not found or already cancelled" },
            { status: 404 },
          );
        }

        // Soft delete all related students
        for (const row of studentGuardiansRows as any[]) {
          await connection.query(
            "UPDATE students SET deleted_at = NOW(), updated_at = NOW() WHERE id = ? AND deleted_at IS NULL",
            [row.student_id],
          );
        }
      }

      await connection.commit();

      return NextResponse.json({
        message: "Cancellation request submitted successfully",
      });
    } catch (error) {
      await connection.rollback();
      console.error("Cancellation error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Cancellation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
