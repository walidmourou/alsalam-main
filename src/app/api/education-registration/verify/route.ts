import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  collectFieldErrors,
  guardianVerificationSchema,
  type GuardianCheck,
  type GuardianVerificationResult,
} from "@/lib/education-schema";
import type { RowDataPacket } from "mysql2/promise";

interface GuardianRow extends RowDataPacket {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  has_membership: number;
}

/** Lowercased so the comparison matches the case-insensitive DB collation. */
function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function namesMatch(row: GuardianRow, firstName: string, lastName: string): boolean {
  return (
    normalize(row.first_name) === normalize(firstName) &&
    normalize(row.last_name) === normalize(lastName)
  );
}

/**
 * Looks one person up by e-mail (the unique key of `users`) and reports whether
 * an account already exists plus whether it carries a membership.
 *
 * The returned `userId` is informational only: the submit route resolves the
 * guardian again from the e-mail, so a tampered id can never attach children to
 * a foreign account.
 */
async function findGuardian(
  firstName: string,
  lastName: string,
  email: string,
): Promise<{ check: GuardianCheck; hasMembership: boolean; userId?: number; storedName?: string; nameMatches?: boolean }> {
  console.log("[findGuardian] Looking up:", { firstName, lastName, email });
  const [rows] = await pool.query<GuardianRow[]>(
    `SELECT u.id,
            u.first_name,
            u.last_name,
            u.email,
            EXISTS (
              SELECT 1 FROM memberships m
              WHERE m.user_id = u.id AND m.deleted_at IS NULL
            ) AS has_membership
     FROM users u
     WHERE u.email = ? AND u.deleted_at IS NULL
     LIMIT 1`,
    [email.trim()],
  );
  console.log("[findGuardian] Query result rows:", rows.length);

  if (rows.length === 0) {
    console.log("[findGuardian] No user found");
    return { check: { exists: false }, hasMembership: false };
  }

  const row = rows[0];
  console.log("[findGuardian] Found user:", { id: row.id, email: row.email, has_membership: row.has_membership });
  const storedName = `${row.first_name} ${row.last_name}`.trim();
  const nameMatches = namesMatch(row, firstName, lastName);

  // Ensure has_membership is treated as boolean (MySQL EXISTS returns 1/0)
  const hasMembership = Boolean(row.has_membership);

  return {
    check: { exists: true, userId: row.id, storedName, nameMatches },
    hasMembership,
    userId: row.id,
    storedName,
    nameMatches,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    console.log("[verify] Request body:", JSON.stringify(body));
    const parsed = guardianVerificationSchema.safeParse(body);

    if (!parsed.success) {
      console.log("[verify] Validation failed:", parsed.error.flatten());
      return NextResponse.json(
        { error: "generic", fieldErrors: collectFieldErrors(parsed.error) },
        { status: 400 },
      );
    }

    const { guardian, secondaryGuardian, isMember } = parsed.data;
    console.log("[verify] Parsed data:", { guardian, secondaryGuardian, isMember });

    const primary = await findGuardian(
      guardian.firstName,
      guardian.lastName,
      guardian.email,
    );
    console.log("[verify] Primary result:", primary);

    const secondary = secondaryGuardian
      ? await findGuardian(
          secondaryGuardian.firstName,
          secondaryGuardian.lastName,
          secondaryGuardian.email,
        )
      : null;
    console.log("[verify] Secondary result:", secondary);

    const result: GuardianVerificationResult = {
      guardian: primary.check,
      secondaryGuardian: secondary ? secondary.check : null,
      membership: {
        hasMembership: primary.hasMembership,
        ...(primary.userId !== undefined ? { userId: primary.userId } : {}),
        ...(primary.storedName !== undefined
          ? { storedName: primary.storedName }
          : {}),
        ...(primary.nameMatches !== undefined
          ? { nameMatches: primary.nameMatches }
          : {}),
      },
    };

    // The membership checkbox must agree with the record, otherwise the fee
    // preview would contradict what is charged at the end of the flow.
    const membershipSelectionMismatch =
      (isMember && !primary.hasMembership) || (!isMember && primary.hasMembership);

    return NextResponse.json({
      ...result,
      membershipSelectionMismatch,
    });
  } catch (error) {
    // Log full error details for debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Education registration verification error:", {
      message: errorMessage,
      stack: errorStack,
      // Include request info for debugging (without sensitive data)
      timestamp: new Date().toISOString(),
    });

    // In development, include error details in response for easier debugging
    const isDevelopment = process.env.NODE_ENV === "development";
    return NextResponse.json(
      {
        error: "serverError",
        ...(isDevelopment ? { details: errorMessage, stack: errorStack } : {}),
      },
      { status: 500 },
    );
  }
}