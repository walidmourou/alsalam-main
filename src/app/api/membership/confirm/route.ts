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

    // Find membership by token (exclude soft-deleted)
    const [memberships] = await pool.query(
      "SELECT id, email, first_name, last_name, confirmed_at FROM memberships WHERE confirmation_token = ? AND deleted_at IS NULL",
      [token]
    );

    if ((memberships as any[]).length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired confirmation token" },
        { status: 404 }
      );
    }

    const membership = (memberships as any[])[0] as {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      confirmed_at: Date | null;
    };

    // Check if already confirmed
    if (membership.confirmed_at) {
      // Redirect to success page
      return NextResponse.redirect(
        new URL("/de/support?confirmed=already", request.url)
      );
    }

    // Update membership status to active and set confirmed_at
    await pool.query(
      "UPDATE memberships SET status = 'active', confirmed_at = NOW(), confirmation_token = NULL WHERE id = ?",
      [membership.id]
    );

    // Redirect to success page
    return NextResponse.redirect(
      new URL("/de/support?confirmed=success", request.url)
    );
  } catch (error) {
    console.error("Membership confirmation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
