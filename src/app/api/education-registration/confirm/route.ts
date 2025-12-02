import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Confirmation token is required" },
        { status: 400 }
      );
    }

    // Find education registration by token (exclude soft-deleted)
    const [registrations] = await pool.query(
      "SELECT id, email, first_name, last_name, confirmed_at FROM education_requesters WHERE confirmation_token = ? AND deleted_at IS NULL",
      [token]
    );

    if ((registrations as any[]).length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired confirmation token" },
        { status: 404 }
      );
    }

    const registration = (registrations as any[])[0] as {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      confirmed_at: Date | null;
    };

    // Check if already confirmed
    if (registration.confirmed_at) {
      // Redirect to success page
      return NextResponse.redirect(
        new URL("/de/education?confirmed=already", request.url)
      );
    }

    // Update registration status to confirmed and set confirmed_at
    await pool.query(
      "UPDATE education_requesters SET status = 'confirmed', confirmed_at = NOW(), confirmation_token = NULL WHERE id = ?",
      [registration.id]
    );

    // Redirect to success page
    return NextResponse.redirect(
      new URL("/de/education?confirmed=success", request.url)
    );
  } catch (error) {
    console.error("Education registration confirmation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
