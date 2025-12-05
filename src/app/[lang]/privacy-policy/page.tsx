import type { Metadata } from "next";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return {
    title: `${dictionary.privacy?.pageTitle || "Privacy Policy"} - ${
      dictionary.seo.title
    }`,
    description:
      dictionary.privacy?.metaDescription ||
      "Privacy policy and data protection information for Islamic Center Brombach-Lörrach",
    robots: "index, follow",
  };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const t = dictionary.privacy || {};
  const isRTL = lang === "ar";

  return (
    <div className="min-h-screen bg-gray-50 py-12" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <h1 className="text-3xl font-bold text-[#262262] mb-2">
            {t.pageTitle || "Privacy Policy"}
          </h1>
          <p className="text-gray-600 mb-8">
            {t.lastUpdated || "Last Updated"}:{" "}
            {t.updateDate || "December 5, 2025"}
          </p>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.introTitle || "1. Introduction"}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.introText ||
                "Islamic Center Brombach-Lörrach ('we', 'us', or 'our') is committed to protecting your privacy and personal data. This privacy policy explains how we collect, use, and protect your information in accordance with the European General Data Protection Regulation (GDPR) and other applicable data protection laws."}
            </p>
          </section>

          {/* Data Controller */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.controllerTitle || "2. Data Controller"}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              {t.controllerText ||
                "The data controller responsible for your personal data is:"}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800 font-medium">
                Islamisches Zentrum Brombach-Lörrach
              </p>
              <p className="text-gray-600">Brombach, Lörrach, Germany</p>
              <p className="text-gray-600">
                Email: info@islamisches-zentrum-brombach-loerrach.de
              </p>
            </div>
          </section>

          {/* Data Collection */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.collectionTitle || "3. Data We Collect"}
            </h2>

            {/* Membership Form */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {t.membershipFormTitle || "3.1 Membership Registration Form"}
              </h3>
              <p className="text-gray-700 mb-3">
                {t.membershipFormDesc ||
                  "When you register for membership, we collect:"}
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  {t.membershipData1 || "Full name (first and last name)"}
                </li>
                <li>{t.membershipData2 || "Date of birth"}</li>
                <li>
                  {t.membershipData3 ||
                    "Complete address (street, house number, postal code, city)"}
                </li>
                <li>{t.membershipData4 || "Email address"}</li>
                <li>{t.membershipData5 || "Phone number"}</li>
                <li>
                  {t.membershipData6 ||
                    "Membership type (individual, family, student, senior)"}
                </li>
                <li>
                  {t.membershipData7 ||
                    "Payment information (IBAN for direct debit)"}
                </li>
              </ul>
            </div>

            {/* Education Form */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {t.educationFormTitle || "3.2 Education Registration Form"}
              </h3>
              <p className="text-gray-700 mb-3">
                {t.educationFormDesc ||
                  "When you register a student for educational programs, we collect:"}
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  {t.educationData1 ||
                    "Parent/Guardian information (full name, email, phone)"}
                </li>
                <li>
                  {t.educationData2 ||
                    "Student information (full name, date of birth, gender, medical conditions, allergies)"}
                </li>
                <li>{t.educationData3 || "Emergency contact details"}</li>
                <li>
                  {t.educationData4 ||
                    "Media consent (permission to take photos/videos)"}
                </li>
                <li>
                  {t.educationData5 ||
                    "Educational background and special needs"}
                </li>
              </ul>
            </div>

            {/* Website Data */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {t.websiteDataTitle || "3.3 Website Usage Data"}
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>{t.websiteData1 || "IP address (anonymized)"}</li>
                <li>{t.websiteData2 || "Browser type and version"}</li>
                <li>{t.websiteData3 || "Operating system"}</li>
                <li>{t.websiteData4 || "Date and time of access"}</li>
                <li>{t.websiteData5 || "Pages visited"}</li>
                <li>{t.websiteData6 || "Language preference"}</li>
              </ul>
            </div>
          </section>

          {/* Legal Basis */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.legalBasisTitle || "4. Legal Basis for Processing"}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.legalBasisText ||
                "We process your personal data based on the following legal grounds under GDPR Article 6:"}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>
                <strong>{t.consent || "Consent (Art. 6(1)(a))"}</strong>:{" "}
                {t.consentDesc ||
                  "When you explicitly consent to the processing of your data"}
              </li>
              <li>
                <strong>{t.contract || "Contract (Art. 6(1)(b))"}</strong>:{" "}
                {t.contractDesc ||
                  "Processing necessary for membership or educational services"}
              </li>
              <li>
                <strong>
                  {t.legalObligation || "Legal Obligation (Art. 6(1)(c))"}
                </strong>
                :{" "}
                {t.legalObligationDesc ||
                  "Compliance with legal and tax obligations"}
              </li>
              <li>
                <strong>
                  {t.legitimateInterest || "Legitimate Interest (Art. 6(1)(f))"}
                </strong>
                :{" "}
                {t.legitimateInterestDesc ||
                  "Website security and service improvement"}
              </li>
            </ul>
          </section>

          {/* Purpose */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.purposeTitle || "5. Purpose of Data Processing"}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>
                {t.purpose1 ||
                  "Processing membership applications and renewals"}
              </li>
              <li>
                {t.purpose2 || "Managing educational program registrations"}
              </li>
              <li>
                {t.purpose3 ||
                  "Communicating important updates and information"}
              </li>
              <li>{t.purpose4 || "Processing payments and donations"}</li>
              <li>
                {t.purpose5 || "Ensuring safety and security of participants"}
              </li>
              <li>{t.purpose6 || "Complying with legal obligations"}</li>
              <li>{t.purpose7 || "Improving our services and website"}</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.retentionTitle || "6. Data Retention"}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.retentionText ||
                "We retain your personal data only for as long as necessary:"}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>
                {t.retention1 ||
                  "Membership data: Duration of membership plus 3 years for legal obligations"}
              </li>
              <li>
                {t.retention2 ||
                  "Education data: Duration of enrollment plus 1 year"}
              </li>
              <li>
                {t.retention3 ||
                  "Financial records: 10 years as required by German tax law"}
              </li>
              <li>{t.retention4 || "Website logs: 90 days"}</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.sharingTitle || "7. Data Sharing"}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.sharingText ||
                "We do not sell your personal data. We may share your data with:"}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>
                {t.sharing1 ||
                  "Payment processors (for secure payment processing)"}
              </li>
              <li>
                {t.sharing2 ||
                  "Email service providers (for communication purposes)"}
              </li>
              <li>
                {t.sharing3 || "Legal authorities (when required by law)"}
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              {t.sharingNote ||
                "All third-party processors are GDPR-compliant and process data only according to our instructions."}
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.rightsTitle || "8. Your Rights"}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.rightsText || "Under GDPR, you have the following rights:"}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>
                <strong>{t.rightAccess || "Right of Access"}</strong>:{" "}
                {t.rightAccessDesc || "Request a copy of your personal data"}
              </li>
              <li>
                <strong>
                  {t.rightRectification || "Right to Rectification"}
                </strong>
                : {t.rightRectificationDesc || "Correct inaccurate data"}
              </li>
              <li>
                <strong>{t.rightErasure || "Right to Erasure"}</strong>:{" "}
                {t.rightErasureDesc || "Request deletion of your data"}
              </li>
              <li>
                <strong>{t.rightRestriction || "Right to Restriction"}</strong>:{" "}
                {t.rightRestrictionDesc || "Limit how we use your data"}
              </li>
              <li>
                <strong>
                  {t.rightPortability || "Right to Data Portability"}
                </strong>
                :{" "}
                {t.rightPortabilityDesc ||
                  "Receive your data in a structured format"}
              </li>
              <li>
                <strong>{t.rightObject || "Right to Object"}</strong>:{" "}
                {t.rightObjectDesc || "Object to certain types of processing"}
              </li>
              <li>
                <strong>
                  {t.rightWithdraw || "Right to Withdraw Consent"}
                </strong>
                :{" "}
                {t.rightWithdrawDesc ||
                  "Withdraw consent at any time where we rely on consent"}
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              {t.exerciseRights ||
                "To exercise any of these rights, please contact us at info@islamisches-zentrum-brombach-loerrach.de"}
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.cookiesTitle || "9. Cookies"}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.cookiesText ||
                "We use minimal cookies to ensure the website functions properly. For detailed information about our cookie usage, please see our Cookie Policy."}
            </p>
          </section>

          {/* Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.securityTitle || "10. Data Security"}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t.securityText ||
                "We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments."}
            </p>
          </section>

          {/* Children */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.childrenTitle || "11. Children's Privacy"}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t.childrenText ||
                "For educational programs involving children under 16, we require parental consent. Parents/guardians have the right to access, modify, or delete their child's information at any time."}
            </p>
          </section>

          {/* Changes */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.changesTitle || "12. Changes to This Policy"}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t.changesText ||
                "We may update this privacy policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the 'Last Updated' date."}
            </p>
          </section>

          {/* Complaints */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.complaintsTitle || "13. Complaints"}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t.complaintsText ||
                "If you believe your data protection rights have been violated, you have the right to lodge a complaint with your local supervisory authority. In Germany, this is the Landesbeauftragte für Datenschutz (State Data Protection Officer)."}
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.contactTitle || "14. Contact Us"}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.contactText ||
                "If you have any questions about this privacy policy or our data practices, please contact us:"}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800">
                <strong>Email:</strong>{" "}
                info@islamisches-zentrum-brombach-loerrach.de
              </p>
              <p className="text-gray-800">
                <strong>{t.address || "Address"}:</strong> Islamisches Zentrum
                Brombach-Lörrach, Brombach, Lörrach, Germany
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
