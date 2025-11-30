import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import transporter from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const {
      requesterFirstName,
      requesterLastName,
      requesterAddress,
      requesterEmail,
      requesterPhone,
      responsibleFirstName,
      responsibleLastName,
      responsibleAddress,
      responsibleEmail,
      responsiblePhone,
      children,
      totalAmount,
      consentMediaOnline,
      consentMediaPrint,
      consentMediaPromotion,
      schoolRulesAccepted,
      sepaAccountHolder,
      sepaIban,
      sepaBic,
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
        { status: 400 }
      );
    }

    const connection = pool;

    // Debug: Check database connection
    console.log("Attempting database connection...");
    try {
      const [tables] = await connection.execute(
        'SHOW TABLES LIKE "education_%"'
      );
      const tableRows = tables as any[];
      console.log("Education tables found:", tableRows);
      console.log("Number of education tables:", tableRows.length);

      if (tableRows.length === 0) {
        console.log("No education tables found, creating them...");

        // Create education_requesters table
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS education_requesters (
            id INT AUTO_INCREMENT PRIMARY KEY,
            education_id VARCHAR(50) UNIQUE,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            address TEXT NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            responsible_first_name VARCHAR(100),
            responsible_last_name VARCHAR(100),
            responsible_address TEXT,
            responsible_email VARCHAR(255),
            responsible_phone VARCHAR(50),
            consent_media_online BOOLEAN NOT NULL DEFAULT FALSE,
            consent_media_print BOOLEAN NOT NULL DEFAULT FALSE,
            consent_media_promotion BOOLEAN NOT NULL DEFAULT FALSE,
            school_rules_accepted BOOLEAN NOT NULL DEFAULT FALSE,
            sepa_account_holder VARCHAR(255) NOT NULL,
            sepa_iban VARCHAR(34) NOT NULL,
            sepa_bic VARCHAR(11),
            sepa_bank VARCHAR(255) NOT NULL,
            sepa_mandate BOOLEAN NOT NULL DEFAULT FALSE,
            lang VARCHAR(2) NOT NULL DEFAULT 'de',
            status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
            confirmation_token VARCHAR(64) UNIQUE,
            confirmed_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_status (status),
            INDEX idx_confirmation_token (confirmation_token),
            INDEX idx_created_at (created_at)
          ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci
        `);

        // Create education_students table
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS education_students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            requester_id INT NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            birth_date DATE NOT NULL,
            estimated_level ENUM('preparatory','level1','level2','level3','level4') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (requester_id) REFERENCES education_requesters(id) ON DELETE CASCADE,
            INDEX idx_requester_id (requester_id),
            INDEX idx_birth_date (birth_date)
          ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci
        `);

        console.log("Education tables created successfully in API");
      }
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Generate unique education ID
    const year = new Date().getFullYear();
    const educationId = `EDU${year}${Date.now().toString().slice(-6)}`;

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString("hex");

    // Insert education requester
    const [requesterResult] = await connection.execute(
      `INSERT INTO education_requesters (
        education_id, first_name, last_name, address, email, phone,
        responsible_first_name, responsible_last_name, responsible_address,
        responsible_email, responsible_phone,
        consent_media_online,
        consent_media_print, consent_media_promotion, school_rules_accepted,
        sepa_account_holder, sepa_iban, sepa_bic, sepa_bank, sepa_mandate,
        lang, status, confirmation_token, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW())`,
      [
        educationId,
        requesterFirstName,
        requesterLastName,
        requesterAddress,
        requesterEmail,
        requesterPhone,
        responsibleFirstName || null,
        responsibleLastName || null,
        responsibleAddress || null,
        responsibleEmail || null,
        responsiblePhone || null,
        consentMediaOnline,
        consentMediaPrint,
        consentMediaPromotion,
        schoolRulesAccepted,
        sepaAccountHolder,
        sepaIban,
        sepaBic || null,
        sepaBank,
        sepaMandate,
        lang,
        confirmationToken,
      ]
    );

    const requesterId = (requesterResult as any).insertId;

    // Insert students
    for (const child of children) {
      await connection.execute(
        `INSERT INTO education_students (
          requester_id, first_name, last_name, birth_date, estimated_level
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          requesterId,
          child.firstName,
          child.lastName,
          child.birthDate,
          child.estimatedLevel,
        ]
      );
    }

    // Send confirmation email
    try {
      const subject =
        lang === "de"
          ? "Bildungsanmeldung bestätigen - AL-SALAM E.V."
          : lang === "ar"
          ? "تأكيد التسجيل في التعليم - جمعية السلام"
          : "Confirmer l'inscription éducation - AL-SALAM E.V.";

      const confirmationUrl = `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/education-registration/confirm?token=${confirmationToken}`;

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

      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: requesterEmail,
        subject,
        html,
      });
      console.log(
        "✓ Education registration confirmation email sent successfully"
      );
    } catch (emailError) {
      console.error(
        "Failed to send confirmation email:",
        (emailError as Error).message
      );
      // Don't fail the registration if email fails - log and continue
    }

    return NextResponse.json({
      success: true,
      message: "Education registration submitted successfully",
      requesterId,
      educationId,
    });
  } catch (error) {
    console.error("Education registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
