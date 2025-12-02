import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import pool from "@/lib/db";
import { sendMagicLink } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email, locale } = await request.json();

    if (!email || !locale) {
      return NextResponse.json(
        { error: "Email and locale are required" },
        { status: 400 }
      );
    }

    // Check if email exists in memberships table
    const [membershipRows] = await pool.query(
      "SELECT id, first_name, last_name FROM memberships WHERE email = ? AND status IN ('active', 'approved')",
      [email]
    );

    // Check if email exists in education_requesters table
    const [educationRows] = await pool.query(
      "SELECT id, first_name, last_name FROM education_requesters WHERE email = ? AND status IN ('confirmed')",
      [email]
    );

    if (
      (membershipRows as any[]).length === 0 &&
      (educationRows as any[]).length === 0
    ) {
      return NextResponse.json(
        { error: "Email not found or account not active" },
        { status: 404 }
      );
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token
    await pool.query(
      "INSERT INTO auth_tokens (email, token, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE email = VALUES(email), expires_at = VALUES(expires_at), used = FALSE",
      [email, token, expiresAt]
    );

    // Send email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const loginUrl = `${baseUrl}/${locale}/auth/verify?token=${token}`;

    await sendMagicLink(email, locale, loginUrl);

    return NextResponse.json({ message: "Magic link sent" });
  } catch (error) {
    console.error("Error sending magic link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
