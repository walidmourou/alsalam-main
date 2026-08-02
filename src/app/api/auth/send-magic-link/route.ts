import { NextRequest } from "next/server";
import crypto from "crypto";
import pool from "@/lib/db";
import { sendMagicLink } from "@/lib/email";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-helpers";
import type { User } from "@/types";

export async function POST(request: NextRequest) {
  const connection = await pool.getConnection();
  try {
    const { email, locale } = await request.json();

    if (!email || !locale) {
      return errorResponse("Email and locale are required", 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("Invalid email format", 400);
    }

    // Check if email exists in users table
    const [userRows] = await connection.query<User[]>(
      `SELECT u.id, u.first_name, u.last_name, u.email
       FROM users u
       WHERE u.email = ? AND u.is_active = true AND u.deleted_at IS NULL`,
      [email],
    );

    if ((userRows as User[]).length === 0) {
      return errorResponse("Email not found or account not active", 404);
    }

    const user = (userRows as User[])[0];

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in auth_tokens table
    try {
      await connection.query(
        `INSERT INTO auth_tokens (user_id, token, token_type, expires_at, created_at)
         VALUES (?, ?, 'magic_link', ?, NOW())`,
        [user.id, token, expiresAt],
      );
    } catch (dbError) {
      console.error("Database error when inserting auth token:", dbError);
      throw dbError;
    }

    // Send email
    const baseUrl = process.env.BASE_URL;

    if (!baseUrl) {
      console.error("BASE_URL environment variable is not set!");
      return errorResponse("Server configuration error", 500);
    }

    const loginUrl = `${baseUrl}/${locale}/auth/verify?token=${token}`;

    console.log("Generating magic link:");
    console.log("- BASE_URL:", baseUrl);
    console.log("- Login URL:", loginUrl);

    try {
      await sendMagicLink(email, locale, loginUrl);
      console.log("✓ Magic link email sent successfully");
    } catch (emailError) {
      // Log the error but don't fail the request - the token is still valid
      console.error(
        "⚠️ Email sending failed (but token was created):",
        emailError,
      );
      console.log("📋 Manual login URL for development:", loginUrl);

      // In development, return the login URL so user can manually navigate
      if (process.env.NODE_ENV === "development") {
        return successResponse(
          { loginUrl },
          "Magic link created (email sending failed - check console for URL)",
        );
      }
    }

    return successResponse(null, "Magic link sent successfully");
  } catch (error) {
    return handleApiError(error, "send-magic-link");
  } finally {
    connection.release();
  }
}
