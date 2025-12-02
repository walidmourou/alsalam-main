import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function POST(request: NextRequest) {
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

    try {
      if (type === "membership") {
        // Soft delete membership by setting deleted_at timestamp
        const [result] = await pool.query(
          "UPDATE memberships SET deleted_at = NOW(), updated_at = NOW() WHERE email = ? AND deleted_at IS NULL",
          [authEmail]
        );

        if ((result as any).affectedRows === 0) {
          return NextResponse.json(
            { error: "Membership not found or already cancelled" },
            { status: 404 }
          );
        }

        // Also cancel any related education requests and their children
        const [requesters] = await pool.query(
          "SELECT id FROM education_requesters WHERE email = ? AND deleted_at IS NULL",
          [authEmail]
        );

        for (const requester of requesters as any[]) {
          // Soft delete all students for this requester
          await pool.query(
            "UPDATE education_students SET deleted_at = NOW(), updated_at = NOW() WHERE requester_id = ? AND deleted_at IS NULL",
            [requester.id]
          );

          // Soft delete the requester
          await pool.query(
            "UPDATE education_requesters SET deleted_at = NOW(), updated_at = NOW() WHERE id = ?",
            [requester.id]
          );
        }
      } else if (type === "education") {
        // Get the requester ID first
        const [requesterRows] = await pool.query(
          "SELECT id FROM education_requesters WHERE email = ? AND deleted_at IS NULL",
          [authEmail]
        );

        if ((requesterRows as any[]).length === 0) {
          return NextResponse.json(
            { error: "Education request not found or already cancelled" },
            { status: 404 }
          );
        }

        const requesterId = (requesterRows as any[])[0].id;

        // Soft delete all related students
        await pool.query(
          "UPDATE education_students SET deleted_at = NOW(), updated_at = NOW() WHERE requester_id = ? AND deleted_at IS NULL",
          [requesterId]
        );

        // Soft delete education requester by setting deleted_at timestamp
        await pool.query(
          "UPDATE education_requesters SET deleted_at = NOW(), updated_at = NOW() WHERE id = ?",
          [requesterId]
        );
      }

      return NextResponse.json({
        message: "Cancellation request submitted successfully",
      });
    } catch (error) {
      console.error("Cancellation error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Cancellation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
