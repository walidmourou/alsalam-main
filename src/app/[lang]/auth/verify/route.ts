import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const { lang } = await params;

    if (!token) {
      return NextResponse.redirect(
        new URL(`/${lang}/signin?error=invalid_token`, request.url)
      );
    }

    // Check token
    const [rows] = await pool.query(
      "SELECT email FROM auth_tokens WHERE token = ? AND expires_at > NOW() AND used = FALSE",
      [token]
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.redirect(
        new URL(`/${lang}/signin?error=invalid_token`, request.url)
      );
    }

    const email = (rows as any[])[0].email;

    // Mark token as used
    await pool.query("UPDATE auth_tokens SET used = TRUE WHERE token = ?", [
      token,
    ]);

    // Set cookie for authentication
    const response = NextResponse.redirect(
      new URL(`/${lang}/profile`, request.url)
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
      new URL("/de/signin?error=server_error", request.url)
    );
  }
}
