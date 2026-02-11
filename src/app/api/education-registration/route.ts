import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import transporter from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const connection = await pool.getConnection();
  try {
    const {
      requesterFirstName,
      requesterLastName,
      requesterAddress,
      requesterEmail,
      requesterPhone,
      children,
      totalAmount,
      schoolRulesAccepted,
      sepaAccountHolder,
      sepaIban,
      sepaBank,
      sepaMandate,
      lang,
    } = await request.json();

    // Validate required fields
    if (
      !requesterFirstName ||
      !requesterLastName ||
      !requesterAddress ||
      !requesterEmail ||
      !requesterPhone ||
      !children ||
      children.length === 0 ||
      !schoolRulesAccepted ||
      !sepaAccountHolder ||
      !sepaIban ||
      !sepaBank ||
      !sepaMandate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await connection.beginTransaction();

    // Check if user already exists by email
    let userId;
    const [existingUserRows] = await connection.query(
      "SELECT id FROM users WHERE email = ? AND deleted_at IS NULL",
      [requesterEmail],
    );

    if ((existingUserRows as any[]).length > 0) {
      userId = (existingUserRows as any[])[0].id;
    } else {
      // Create new user (guardian/parent)
      const [userResult] = await connection.query(
        `INSERT INTO users (
          email, first_name, last_name, phone, address, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, true, NOW())`,
        [
          requesterEmail,
          requesterFirstName,
          requesterLastName,
          requesterPhone,
          requesterAddress,
        ],
      );
      userId = (userResult as any).insertId;

      // Assign 'parent' role to the user
      await connection.query(
        `INSERT INTO user_roles (user_id, role_code, granted_at, is_active)
         VALUES (?, 'parent', NOW(), true)`,
        [userId],
      );
    }

    // Get relationship_type_id for 'parent' (primary guardian)
    const [relationshipRows] = await connection.query(
      "SELECT id FROM relationship_types WHERE code = ?",
      ["parent"],
    );
    const relationshipTypeId = (relationshipRows as any[])[0]?.id || 1;

    // Insert students and link them to the guardian
    for (const child of children) {
      // Get gender_id
      let genderId = null;
      if (child.gender) {
        const [genderRows] = await connection.query(
          "SELECT id FROM genders WHERE code = ?",
          [child.gender],
        );
        genderId = (genderRows as any[])[0]?.id;
      }

      // Insert student
      const [studentResult] = await connection.query(
        `INSERT INTO students (
          first_name, last_name, birth_date, gender_id, created_at
        ) VALUES (?, ?, ?, ?, NOW())`,
        [child.firstName, child.lastName, child.birthDate, genderId],
      );
      const studentId = (studentResult as any).insertId;

      // Link student to guardian
      await connection.query(
        `INSERT INTO student_guardians (
          student_id, user_id, relationship_type_id, is_primary, can_pickup, created_at
        ) VALUES (?, ?, ?, true, true, NOW())`,
        [studentId, userId, relationshipTypeId],
      );

      // If estimated level is provided, enroll student in a class
      // (This would require finding or creating appropriate classes)
      // For now, we'll just store the information in notes
      // You may need to create a temporary table or store this differently
    }

    await connection.commit();

    // Generate confirmation token and send email
    const confirmationToken = crypto.randomBytes(32).toString("hex");

    // Store confirmation token in auth_tokens table for verification
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await connection.query(
      `INSERT INTO auth_tokens (user_id, token, token_type, expires_at, created_at)
       VALUES (?, ?, 'education_confirmation', ?, NOW())`,
      [userId, confirmationToken, expiresAt],
    );

    // Send confirmation email
    try {
      const subject =
        lang === "de"
          ? "Bildungsanmeldung bestätigen - AL-SALAM E.V."
          : lang === "ar"
            ? "تأكيد التسجيل في التعليم - جمعية السلام"
            : "Confirmer l'inscription éducation - AL-SALAM E.V.";

      const confirmationUrl = `${process.env.BASE_URL}/api/education-registration/confirm?token=${confirmationToken}`;

      const html =
        lang === "de"
          ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Bildungsanmeldung bestätigen</h2>
          <p>Liebe/r ${requesterFirstName} ${requesterLastName},</p>
          <p>Wir haben Ihre Anmeldung für das Bildungsprogramm erhalten.</p>
          <p><strong>Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie auf den folgenden Link klicken:</strong></p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="background-color: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Anmeldung bestätigen</a>
          </div>
          <p>Nach der Bestätigung wird Ihre Anmeldung bearbeitet und wir werden uns mit Ihnen in Verbindung setzen.</p>
          <p><strong>Anzahl der Kinder:</strong> ${children.length}</p>
          <p><strong>Gesamtbetrag:</strong> ${totalAmount}€</p>
          <p>Bei Fragen können Sie uns jederzeit unter <a href="mailto:info@alsalam-loerrach.org">info@alsalam-loerrach.org</a> kontaktieren.</p>
          <br>
          <p>Mit freundlichen Grüßen,<br>AL-SALAM E.V. Team</p>
        </div>
      `
          : lang === "ar"
            ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
          <h2 style="color: #059669;">تأكيد التسجيل في التعليم</h2>
          <p>عزيزي ${requesterFirstName} ${requesterLastName}،</p>
          <p>لقد استلمنا طلب تسجيلك في برنامج التعليم.</p>
          <p><strong>يرجى تأكيد عنوان بريدك الإلكتروني بالنقر على الرابط التالي:</strong></p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="background-color: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">تأكيد التسجيل</a>
          </div>
          <p>بعد التأكيد، سيتم معالجة طلبك وسنتواصل معك.</p>
          <p><strong>عدد الأطفال:</strong> ${children.length}</p>
          <p><strong>المبلغ الإجمالي:</strong> ${totalAmount} يورو</p>
          <p>لأي استفسار، يمكنك التواصل معنا على <a href="mailto:info@alsalam-loerrach.org">info@alsalam-loerrach.org</a>.</p>
          <br>
          <p>مع خالص التحية،<br>فريق جمعية السلام</p>
        </div>
      `
            : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Confirmer l'inscription éducation</h2>
          <p>Cher/Chère ${requesterFirstName} ${requesterLastName},</p>
          <p>Nous avons reçu votre demande d'inscription au programme éducatif.</p>
          <p><strong>Veuillez confirmer votre adresse e-mail en cliquant sur le lien suivant:</strong></p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="background-color: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Confirmer l'inscription</a>
          </div>
          <p>Après confirmation, votre inscription sera traitée et nous vous contacterons.</p>
          <p><strong>Nombre d'enfants:</strong> ${children.length}</p>
          <p><strong>Montant total:</strong> ${totalAmount}€</p>
          <p>Pour toute question, n'hésitez pas à nous contacter à <a href="mailto:info@alsalam-loerrach.org">info@alsalam-loerrach.org</a>.</p>
          <br>
          <p>Cordialement,<br>L'équipe AL-SALAM E.V.</p>
        </div>
      `;

      await transporter().sendMail({
        from: process.env.FROM_EMAIL,
        to: requesterEmail,
        subject,
        html,
      });
      console.log(
        "✓ Education registration confirmation email sent successfully",
      );
    } catch (emailError) {
      console.error(
        "Failed to send confirmation email:",
        (emailError as Error).message,
      );
      // Don't fail the registration if email fails - log and continue
    }

    return NextResponse.json({
      success: true,
      message: "Education registration submitted successfully",
      userId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Education registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
