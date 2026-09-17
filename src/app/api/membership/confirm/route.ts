import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getOrCreateLookupId } from "@/lib/db-helpers";
import type { RowDataPacket } from "mysql2/promise";

interface MembershipTokenRow extends RowDataPacket {
  id: number;
  user_id: number;
  expires_at: string;
  used_at: string | null;
  email: string;
}

interface MembershipIdRow extends RowDataPacket {
  id: number;
}

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

    // Find the membership confirmation token
    const [tokenRows] = await connection.query<MembershipTokenRow[]>(
      `SELECT at.id, at.user_id, at.expires_at, at.used_at, u.email
       FROM auth_tokens at
       JOIN users u ON at.user_id = u.id
       WHERE at.token = ? AND at.token_type = 'membership_confirmation'
       AND u.deleted_at IS NULL`,
      [token],
    );

    if (tokenRows.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired confirmation token" },
        { status: 404 },
      );
    }

    const tokenData = tokenRows[0];

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
        new URL("/de/support?confirmed=already", request.url),
      );
    }

    // Get status_id for 'active'
    const activeStatusId = await getOrCreateLookupId(
      connection,
      "membership_statuses",
      "Aktiv",
    );

    // Find the membership for this user and set it to active
    const [membershipRows] = await connection.query<MembershipIdRow[]>(
      "SELECT id FROM memberships WHERE user_id = ? AND deleted_at IS NULL LIMIT 1",
      [tokenData.user_id],
    );

    if (membershipRows.length > 0) {
      await connection.query(
        "UPDATE memberships SET membership_status_id = ?, updated_at = NOW() WHERE id = ?",
        [activeStatusId, membershipRows[0].id],
      );
    }

    // Mark token as used
    await connection.query(
      "UPDATE auth_tokens SET used_at = NOW() WHERE id = ?",
      [tokenData.id],
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