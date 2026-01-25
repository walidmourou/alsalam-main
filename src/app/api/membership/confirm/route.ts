import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  const connection = await pool.getConnection();
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Confirmation token is required" },
        { status: 400 },
      );
    }

    // Find membership by token (exclude soft-deleted)
    const [membershipRows] = await connection.query(
      `SELECT m.id, u.email, u.first_name, u.last_name, m.confirmed_at 
       FROM memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.confirmation_token = ? AND m.deleted_at IS NULL AND u.deleted_at IS NULL`,
      [token],
    );

    if ((membershipRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired confirmation token" },
        { status: 404 },
      );
    }

    const membership = (membershipRows as any[])[0];

    // Check if already confirmed
    if (membership.confirmed_at) {
      // Redirect to success page
      return NextResponse.redirect(
        new URL("/de/support?confirmed=already", request.url),
      );
    }

    // Get status_id for 'active'
    const [statusRows] = await connection.query(
      "SELECT id FROM membership_statuses WHERE code = ?",
      ["active"],
    );
    const activeStatusId = (statusRows as any[])[0]?.id;

    // Update membership status to active and set confirmed_at
    await connection.query(
      `UPDATE memberships 
       SET status_id = ?, confirmed_at = NOW(), confirmation_token = NULL 
       WHERE id = ?`,
      [activeStatusId, membership.id],
    );

    // Redirect to success page
    return NextResponse.redirect(
      new URL("/de/support?confirmed=success", request.url),
    );
  } catch (error) {
    console.error("Membership confirmation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
