import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { sendMembershipConfirmation } from "@/lib/email";
import { getOrCreateLookupId } from "@/lib/db-helpers";
import { GENDERS, MARITAL_STATUSES } from "@/lib/enums";
import { z } from "zod";
import crypto from "crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

interface IdRow extends RowDataPacket {
  id: number;
}

const membershipSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  birthDate: z.string().min(1, "Birth date is required"),
  gender: z.enum(GENDERS),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  maritalStatus: z.enum(MARITAL_STATUSES),
  sepaAccountHolder: z.string().min(1, "Account holder name is required"),
  sepaIban: z.string().min(15, "Valid IBAN is required"),
  sepaBic: z.string().optional(),
  sepaBank: z.string().min(1, "Bank name is required"),
  sepaMandate: z.boolean().refine((val) => val === true, {
    message: "You must accept the SEPA mandate",
  }),
  lang: z.enum(["de", "ar", "fr"]),
});

export async function POST(request: NextRequest) {
  const connection = await pool.getConnection();
  try {
    const body = await request.json();

    // Validate input
    const validatedData = membershipSchema.parse(body);

    // Check if email already exists in users table
    const [existingUser] = await connection.query<IdRow[]>(
      "SELECT id FROM users WHERE email = ? AND deleted_at IS NULL",
      [validatedData.email],
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 400 },
      );
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString("hex");

    // Resolve membership type and status lookup ids (get-or-create by label)
    const membershipTypeId = await getOrCreateLookupId(
      connection,
      "membership_types",
      "Einzelmitgliedschaft",
    );
    const pendingStatusId = await getOrCreateLookupId(
      connection,
      "membership_statuses",
      "Beantragt",
    );

    await connection.beginTransaction();

    // Insert into users table (SEPA data lives on users in the new schema)
    const [userResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO users (
        email, first_name, last_name, birth_date, gender,
        phone, address, marital_status,
        bank, iban, bic, bank_account_holder, sepa_mandate_accepted,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        validatedData.email,
        validatedData.firstName,
        validatedData.lastName,
        validatedData.birthDate,
        validatedData.gender,
        validatedData.phone,
        validatedData.address,
        validatedData.maritalStatus,
        validatedData.sepaBank,
        validatedData.sepaIban,
        validatedData.sepaBic || null,
        validatedData.sepaAccountHolder,
        validatedData.sepaMandate,
      ],
    );

    const userId = userResult.insertId;

    // Insert into memberships table
    await connection.query(
      `INSERT INTO memberships (
        user_id, membership_type_id, membership_status_id,
        start_date, created_at
      ) VALUES (?, ?, ?, CURDATE(), NOW())`,
      [userId, membershipTypeId, pendingStatusId],
    );

    // Store confirmation token for the membership verification flow
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await connection.query(
      `INSERT INTO auth_tokens (user_id, token, token_type, expires_at, created_at)
       VALUES (?, ?, 'membership_confirmation', ?, NOW())`,
      [userId, confirmationToken, expiresAt],
    );

    await connection.commit();

    // Send confirmation email
    try {
      await sendMembershipConfirmation(
        validatedData.email,
        validatedData.firstName,
        validatedData.lastName,
        validatedData.lang,
        confirmationToken,
      );
      console.log(`✓ Confirmation email sent to ${validatedData.email}`);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the registration if email fails
      // The user is still registered, just didn't get the email
    }

    return NextResponse.json(
      {
        success: true,
        message: "Membership registration successful",
      },
      { status: 201 },
    );
  } catch (error) {
    await connection.rollback();
    console.error("Membership registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}