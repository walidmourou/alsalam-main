import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// Create reusable transporter with lazy initialization
let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (!transporter) {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // Check if SMTP is configured
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn(
        "SMTP not fully configured. Email functionality may be limited.",
      );
      // Return a test transporter for development
      if (process.env.NODE_ENV === "development") {
        console.log("Using test transporter for development");
      }
    }

    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth:
        smtpHost && smtpUser && smtpPass
          ? {
              user: smtpUser,
              pass: smtpPass,
            }
          : undefined,
    });
  }

  return transporter;
};

// Email sending helper with error handling
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  from = "AL-SALAM E.V. <info@alsalam-loerrach.org>",
): Promise<void> {
  const transporter = getTransporter();

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send email");
  }
}

export async function sendMembershipConfirmation(
  email: string,
  firstName: string,
  lastName: string,
  lang: string,
  confirmationToken: string,
): Promise<void> {
  const subject =
    {
      de: "Mitgliedschaftsregistrierung bestätigen - AL-SALAM E.V.",
      fr: "Confirmez votre inscription - AL-SALAM E.V.",
      ar: "تأكيد التسجيل - AL-SALAM E.V.",
    }[lang] || "Confirm Membership Registration - AL-SALAM E.V.";

  const confirmationUrl = `${process.env.BASE_URL}/api/membership/confirm?token=${confirmationToken}`;

  const htmlContent =
    {
      de: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #262262;">Vielen Dank für Ihre Registrierung!</h2>
        <p>Liebe(r) ${firstName} ${lastName},</p>
        <p>Wir haben Ihre Mitgliedschaftsregistrierung bei AL-SALAM E.V. erhalten.</p>
        <p><strong>Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie auf den folgenden Link klicken:</strong></p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationUrl}" style="background-color: #262262; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Mitgliedschaft bestätigen</a>
        </div>
        <p>Nach der Bestätigung wird Ihr Status auf "Aktiv" gesetzt und wir können mit dem Einzug des monatlichen Mitgliedsbeitrags beginnen.</p>
        <p><strong>Mitgliedsbeitrag:</strong> 30 Euro monatlich</p>
        <p>Bei Fragen können Sie uns jederzeit unter <a href="mailto:info@alsalam-loerrach.org">info@alsalam-loerrach.org</a> kontaktieren.</p>
        <br>
        <p>Mit freundlichen Grüßen,<br>Ihr AL-SALAM E.V. Team</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Islamisches Zentrum Brombach-Lörrach<br>
        Schopfheimer Str. 25 (2 OG)<br>
        79541 Lörrach (Brombach), Deutschland</p>
      </div>
    `,
      fr: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #262262;">Merci pour votre inscription!</h2>
        <p>Cher(e) ${firstName} ${lastName},</p>
        <p>Nous avons reçu votre demande d'adhésion à AL-SALAM E.V.</p>
        <p><strong>Veuillez confirmer votre adresse e-mail en cliquant sur le lien suivant:</strong></p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationUrl}" style="background-color: #262262; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Confirmer l'adhésion</a>
        </div>
        <p>Après confirmation, votre statut sera défini sur "Actif" et nous pourrons procéder au prélèvement de la cotisation mensuelle.</p>
        <p><strong>Cotisation:</strong> 30 Euro par mois</p>
        <p>Pour toute question, n'hésitez pas à nous contacter à <a href="mailto:info@alsalam-loerrach.org">info@alsalam-loerrach.org</a>.</p>
        <br>
        <p>Cordialement,<br>L'équipe AL-SALAM E.V.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Centre Islamique de Brombach-Lörrach<br>
        Schopfheimer Str. 25 (2 OG)<br>
        79541 Lörrach (Brombach), Allemagne</p>
      </div>
    `,
      ar: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
        <h2 style="color: #262262;">شكراً لتسجيلك!</h2>
        <p>عزيزي ${firstName} ${lastName}،</p>
        <p>لقد استلمنا طلب عضويتك في جمعية السلام.</p>
        <p><strong>يرجى تأكيد عنوان بريدك الإلكتروني بالنقر على الرابط التالي:</strong></p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationUrl}" style="background-color: #262262; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">تأكيد العضوية</a>
        </div>
        <p>بعد التأكيد، سيتم تعيين حالتك على "نشط" ويمكننا البدء في تحصيل رسوم العضوية الشهرية.</p>
        <p><strong>رسوم العضوية:</strong> 30 يورو شهرياً</p>
        <p>لأي استفسار، يمكنك التواصل معنا على <a href="mailto:info@alsalam-loerrach.org">info@alsalam-loerrach.org</a>.</p>
        <br>
        <p>مع أطيب التحيات،<br>فريق جمعية السلام</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">المركز الإسلامي برمباخ - لوراخ<br>
        Schopfheimer Str. 25 (2 OG)<br>
        79541 Lörrach (Brombach), ألمانيا</p>
      </div>
    `,
    }[lang] || "";

  await sendEmail(email, subject, htmlContent);
}

export async function sendMagicLink(
  email: string,
  lang: string,
  loginUrl: string,
): Promise<void> {
  const subject =
    {
      de: "Ihr Anmeldelink - AL-SALAM E.V.",
      fr: "Votre lien de connexion - AL-SALAM E.V.",
      ar: "رابط تسجيل الدخول الخاص بك - AL-SALAM E.V.",
    }[lang] || "Your Login Link - AL-SALAM E.V.";

  console.log("Sending magic link email:");
  console.log("- To:", email);
  console.log("- From:", process.env.FROM_EMAIL);
  console.log("- Subject:", subject);
  console.log("- Login URL:", loginUrl);

  const subject =
    {
      de: "Ihr Anmeldelink - AL-SALAM E.V.",
      fr: "Votre lien de connexion - AL-SALAM E.V.",
      ar: "رابط تسجيل الدخول - AL-SALAM E.V.",
    }[lang] || "Your Login Link - AL-SALAM E.V.";

  const htmlContent =
    {
      de: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #262262;">Ihr Anmeldelink</h2>
        <p>Klicken Sie auf den folgenden Link, um sich anzumelden:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #262262; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Anmelden</a>
        </div>
        <p>Dieser Link ist 24 Stunden gültig.</p>
        <p>Falls Sie diese E-Mail nicht angefordert haben, ignorieren Sie sie bitte.</p>
        <br>
        <p>Mit freundlichen Grüßen,<br>Ihr AL-SALAM E.V. Team</p>
      </div>
    `,
      fr: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #262262;">Votre lien de connexion</h2>
        <p>Cliquez sur le lien suivant pour vous connecter:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #262262; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Se connecter</a>
        </div>
        <p>Ce lien est valide pendant 24 heures.</p>
        <p>Si vous n'avez pas demandé cet e-mail, veuillez l'ignorer.</p>
        <br>
        <p>Cordialement,<br>L'équipe AL-SALAM E.V.</p>
      </div>
    `,
      ar: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
        <h2 style="color: #262262;">رابط تسجيل الدخول الخاص بك</h2>
        <p>انقر على الرابط التالي لتسجيل الدخول:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #262262; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">تسجيل الدخول</a>
        </div>
        <p>هذا الرابط صالح لمدة 24 ساعة.</p>
        <p>إذا لم تطلب هذا البريد الإلكتروني، يرجى تجاهله.</p>
        <br>
        <p>مع أطيب التحيات،<br>فريق جمعية السلام</p>
      </div>
    `,
    }[lang] || "";

  await sendEmail(email, subject, htmlContent);
}

export default getTransporter;
