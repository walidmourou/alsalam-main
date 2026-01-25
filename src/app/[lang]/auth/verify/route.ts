import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string }> },
) {
  const connection = await pool.getConnection();
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const { lang } = await params;

    if (!token) {
      return NextResponse.redirect(
        new URL(`/${lang}/signin?error=invalid_token`, request.url),
      );
    }

    // Check token
    const [tokenRows] = await connection.query(
      `SELECT at.user_id, u.email 
       FROM auth_tokens at
       JOIN users u ON at.user_id = u.id
       WHERE at.token = ? AND at.expires_at > NOW() AND at.used_at IS NULL
       AND u.deleted_at IS NULL`,
      [token],
    );

    if ((tokenRows as any[]).length === 0) {
      return NextResponse.redirect(
        new URL(`/${lang}/signin?error=invalid_token`, request.url),
      );
    }

    const { user_id, email } = (tokenRows as any[])[0];

    // Mark token as used
    await connection.query(
      "UPDATE auth_tokens SET used_at = NOW() WHERE token = ?",
      [token],
    );

    // Update last connection time
    await connection.query(
      "UPDATE users SET last_connection_at = NOW() WHERE id = ?",
      [user_id],
    );

    // Set cookie for authentication
    const baseUrl = process.env.BASE_URL || new URL(request.url).origin;
    const response = NextResponse.redirect(
      new URL(`/${lang}/profile`, baseUrl),
    );
    response.cookies.set("auth_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.redirect(
      new URL("/de/signin?error=server_error", request.url),
    );
  } finally {
    connection.release();
  }
}
