import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { sendMembershipConfirmation } from "@/lib/email";
import { z } from "zod";
import crypto from "crypto";

const membershipSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  birthDate: z.string().min(1, "Birth date is required"),
  gender: z.enum(["male", "female"]),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]),
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
    const [existingUser] = await connection.query(
      "SELECT id FROM users WHERE email = ? AND deleted_at IS NULL",
      [validatedData.email],
    );

    if ((existingUser as any[]).length > 0) {
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 400 },
      );
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString("hex");

    // Generate unique membership ID
    const year = new Date().getFullYear();
    const membershipId = `MEM${year}${Date.now().toString().slice(-6)}`;

    // Get gender_id from lookup table
    const [genderResult] = await connection.query(
      "SELECT id FROM genders WHERE code = ?",
      [validatedData.gender],
    );
    const genderId = (genderResult as any[])[0]?.id;

    // Get marital_status_id from lookup table
    const [maritalStatusResult] = await connection.query(
      "SELECT id FROM marital_statuses WHERE code = ?",
      [validatedData.maritalStatus],
    );
    const maritalStatusId = (maritalStatusResult as any[])[0]?.id;

    // Get membership_status_id for 'pending'
    const [statusResult] = await connection.query(
      "SELECT id FROM membership_statuses WHERE code = ?",
      ["pending"],
    );
    const statusId = (statusResult as any[])[0]?.id;

    // Get default membership_type_id (assuming 'individual' is default)
    const [typeResult] = await connection.query(
      "SELECT id FROM membership_types WHERE code = ?",
      ["individual"],
    );
    const typeId = (typeResult as any[])[0]?.id || 1; // fallback to 1 if not found

    await connection.beginTransaction();

    // Insert into users table first
    const [userResult] = await connection.query(
      `INSERT INTO users (
        email, first_name, last_name, birth_date, gender_id, 
        phone, address, marital_status_id, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        validatedData.email,
        validatedData.firstName,
        validatedData.lastName,
        validatedData.birthDate,
        genderId,
        validatedData.phone,
        validatedData.address,
        maritalStatusId,
        true,
      ],
    );

    const userId = (userResult as any).insertId;

    // Insert into memberships table
    await connection.query(
      `INSERT INTO memberships (
        membership_id, user_id, membership_type_id, status_id,
        sepa_account_holder, sepa_iban, sepa_bic, sepa_bank, 
        sepa_mandate_accepted, confirmation_token, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        membershipId,
        userId,
        typeId,
        statusId,
        validatedData.sepaAccountHolder,
        validatedData.sepaIban,
        validatedData.sepaBic || null,
        validatedData.sepaBank,
        validatedData.sepaMandate,
        confirmationToken,
      ],
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
