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
  try {
    const body = await request.json();

    // Validate input
    const validatedData = membershipSchema.parse(body);

    // Check if email already exists
    const [existingMembers] = await pool.query(
      "SELECT id FROM memberships WHERE email = ?",
      [validatedData.email]
    );

    if ((existingMembers as any[]).length > 0) {
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 400 }
      );
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString("hex");

    // Generate unique membership ID
    const year = new Date().getFullYear();
    const membershipId = `MEM${year}${Date.now().toString().slice(-6)}`;

    // Insert into database
    await pool.query(
      `INSERT INTO memberships (
        membership_id, first_name, last_name, birth_date, gender, address, 
        email, phone, marital_status, sepa_account_holder, 
        sepa_iban, sepa_bic, sepa_bank, sepa_mandate_accepted,
        confirmation_token, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        membershipId,
        validatedData.firstName,
        validatedData.lastName,
        validatedData.birthDate,
        validatedData.gender,
        validatedData.address,
        validatedData.email,
        validatedData.phone,
        validatedData.maritalStatus,
        validatedData.sepaAccountHolder,
        validatedData.sepaIban,
        validatedData.sepaBic || null,
        validatedData.sepaBank,
        validatedData.sepaMandate,
        confirmationToken,
      ]
    );

    // Send confirmation email
    try {
      await sendMembershipConfirmation(
        validatedData.email,
        validatedData.firstName,
        validatedData.lastName,
        validatedData.lang,
        confirmationToken
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
      { status: 201 }
    );
  } catch (error) {
    console.error("Membership registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
