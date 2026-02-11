import type { Metadata } from "next";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { locales } from "@/i18n/config";

// Static generation for all languages
export async function generateStaticParams() {
  return locales.map((locale) => ({
    lang: locale,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return {
    title: `${dictionary.cookiePolicy?.pageTitle || "Cookie Policy"} - ${
      dictionary.seo.title
    }`,
    description:
      dictionary.cookiePolicy?.metaDescription ||
      "Cookie policy for Islamic Center Brombach-Lörrach website",
    robots: "index, follow",
  };
}

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const t = dictionary.cookiePolicy || {};
  const isRTL = lang === "ar";

  return (
    <div className="min-h-screen bg-gray-50 py-12" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <h1 className="text-3xl font-bold text-[#262262] mb-2">
            {t.pageTitle || "Cookie Policy"}
          </h1>
          <p className="text-gray-600 mb-8">
            {t.lastUpdated || "Last Updated"}:{" "}
            {t.updateDate || "December 5, 2025"}
          </p>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.introTitle || "1. What Are Cookies?"}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.introText ||
                "Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help websites remember your preferences and improve your browsing experience."}
            </p>
          </section>

          {/* How We Use Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.howWeUseTitle || "2. How We Use Cookies"}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.howWeUseText ||
                "We use cookies to provide essential website functionality and improve your user experience. We are committed to minimal data collection and only use cookies that are necessary or enhance your experience with your consent."}
            </p>
          </section>

          {/* Types of Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.typesTitle || "3. Types of Cookies We Use"}
            </h2>

            {/* Necessary Cookies */}
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs mr-2">
                  {t.alwaysActive || "ALWAYS ACTIVE"}
                </span>
                {t.necessaryCookiesTitle || "3.1 Necessary Cookies"}
              </h3>
              <p className="text-gray-700 mb-3">
                {t.necessaryCookiesDesc ||
                  "These cookies are essential for the website to function properly. They cannot be disabled as they are required for basic site operations."}
              </p>
              <div className="bg-white rounded p-3 mt-3">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {t.examples || "Examples"}:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  <li>
                    <strong>cookie-consent</strong>:{" "}
                    {t.cookieConsentDesc || "Stores your cookie preferences"}
                  </li>
                  <li>
                    <strong>session</strong>:{" "}
                    {t.sessionDesc || "Maintains your session when logged in"}
                  </li>
                  <li>
                    <strong>NEXT_LOCALE</strong>:{" "}
                    {t.localeDesc || "Remembers your language preference"}
                  </li>
                </ul>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>{t.duration || "Duration"}:</strong>{" "}
                  {t.sessionDuration || "Session or up to 1 year"}
                </p>
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t.functionalCookiesTitle || "3.2 Functional Cookies"}
              </h3>
              <p className="text-gray-700 mb-3">
                {t.functionalCookiesDesc ||
                  "These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings."}
              </p>
              <div className="bg-white rounded p-3 mt-3">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {t.examples || "Examples"}:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  <li>
                    <strong>theme-preference</strong>:{" "}
                    {t.themeDesc ||
                      "Remembers your theme choice (if applicable)"}
                  </li>
                  <li>
                    <strong>user-preferences</strong>:{" "}
                    {t.userPrefDesc || "Stores your personalized settings"}
                  </li>
                </ul>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>{t.duration || "Duration"}:</strong>{" "}
                  {t.functionalDuration || "Up to 1 year"}
                </p>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t.analyticsCookiesTitle || "3.3 Analytics Cookies"}
              </h3>
              <p className="text-gray-700 mb-3">
                {t.analyticsCookiesDesc ||
                  "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously."}
              </p>
              <div className="bg-white rounded p-3 mt-3">
                <p className="text-gray-700 text-sm">
                  {t.analyticsNote ||
                    "Currently, we do not use analytics cookies. If we decide to implement analytics in the future, we will update this policy and request your consent."}
                </p>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="mb-6 bg-purple-50 border-l-4 border-purple-500 p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t.marketingCookiesTitle || "3.4 Marketing Cookies"}
              </h3>
              <p className="text-gray-700 mb-3">
                {t.marketingCookiesDesc ||
                  "These cookies track your online activity to help deliver more relevant advertising or to limit how many times you see an ad."}
              </p>
              <div className="bg-white rounded p-3 mt-3">
                <p className="text-gray-700 text-sm">
                  {t.marketingNote ||
                    "We do not use marketing or advertising cookies on our website."}
                </p>
              </div>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.thirdPartyTitle || "4. Third-Party Cookies"}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.thirdPartyText ||
                "We minimize the use of third-party cookies. Any third-party services we use are carefully selected and comply with GDPR requirements."}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">
                {t.currentThirdParty || "Current Third-Party Services"}:
              </h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  {t.emailService ||
                    "Email service provider (Resend) - for transactional emails only"}
                </li>
                <li>
                  {t.hostingService ||
                    "Hosting provider - for website infrastructure"}
                </li>
              </ul>
            </div>
          </section>

          {/* Managing Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.managingTitle || "5. Managing Your Cookie Preferences"}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.managingText ||
                "You have full control over the cookies we use on our website (except necessary cookies). You can manage your preferences in the following ways:"}
            </p>

            <div className="space-y-4">
              {/* Cookie Banner */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {t.cookieBanner || "Cookie Consent Banner"}
                </h4>
                <p className="text-gray-700 text-sm">
                  {t.cookieBannerDesc ||
                    "When you first visit our website, you'll see a cookie consent banner. You can choose to accept all cookies, only necessary cookies, or customize your preferences."}
                </p>
              </div>

              {/* Browser Settings */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {t.browserSettings || "Browser Settings"}
                </h4>
                <p className="text-gray-700 text-sm mb-2">
                  {t.browserSettingsDesc ||
                    "You can also control cookies through your browser settings. Here's how to manage cookies in popular browsers:"}
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                  <li>
                    <strong>Chrome:</strong>{" "}
                    {t.chromeInstructions ||
                      "Settings > Privacy and security > Cookies"}
                  </li>
                  <li>
                    <strong>Firefox:</strong>{" "}
                    {t.firefoxInstructions ||
                      "Settings > Privacy & Security > Cookies"}
                  </li>
                  <li>
                    <strong>Safari:</strong>{" "}
                    {t.safariInstructions || "Preferences > Privacy > Cookies"}
                  </li>
                  <li>
                    <strong>Edge:</strong>{" "}
                    {t.edgeInstructions || "Settings > Privacy > Cookies"}
                  </li>
                </ul>
              </div>

              {/* Clearing Cookies */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {t.clearingCookies || "Clearing Cookies"}
                </h4>
                <p className="text-gray-700 text-sm">
                  {t.clearingCookiesDesc ||
                    "You can delete all cookies stored on your device through your browser settings. Please note that this may affect your browsing experience on our website and other websites."}
                </p>
              </div>
            </div>
          </section>

          {/* Updates */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.updatesTitle || "6. Updates to This Cookie Policy"}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t.updatesText ||
                "We may update this cookie policy from time to time to reflect changes in our practices or for legal reasons. We will notify you of any significant changes by updating the 'Last Updated' date at the top of this page."}
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.contactTitle || "7. Contact Us"}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.contactText ||
                "If you have any questions about our use of cookies, please contact us:"}
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

          {/* GDPR Compliance */}
          <section className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t.gdprTitle || "GDPR Compliance"}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t.gdprText ||
                "This cookie policy is designed to comply with the European General Data Protection Regulation (GDPR) and the ePrivacy Directive. We are committed to protecting your privacy and giving you control over your personal data."}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
