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

    // Find token in auth_tokens table
    const [tokenRows] = await connection.query(
      `SELECT at.id, at.user_id, at.used_at, at.expires_at, u.email, u.first_name, u.last_name
       FROM auth_tokens at
       JOIN users u ON at.user_id = u.id
       WHERE at.token = ? AND at.token_type = 'education_confirmation' AND u.deleted_at IS NULL`,
      [token],
    );

    if ((tokenRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired confirmation token" },
        { status: 404 },
      );
    }

    const tokenData = (tokenRows as any[])[0];

    // Check if token has expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Confirmation token has expired" },
        { status: 400 },
      );
    }

    // Check if already confirmed
    if (tokenData.used_at) {
      // Redirect to success page
      return NextResponse.redirect(
        new URL("/de/education?confirmed=already", request.url),
      );
    }

    // Mark token as used
    await connection.query(
      "UPDATE auth_tokens SET used_at = NOW() WHERE id = ?",
      [tokenData.id],
    );

    // Redirect to success page
    return NextResponse.redirect(
      new URL("/de/education?confirmed=success", request.url),
    );
  } catch (error) {
    console.error("Education registration confirmation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
