import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import MembershipForm from "@/components/MembershipForm";

export default async function SupportPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const { lang } = await params;
  const { confirmed } = await searchParams;
  const dictionary = await getDictionary(lang as Locale);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Confirmation Messages */}
        {confirmed === "success" && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-green-800">
                {dictionary.support.confirmationSuccess}
              </h2>
            </div>
            <p className="text-green-700">
              {dictionary.support.confirmationSuccessMessage}
            </p>
          </div>
        )}

        {confirmed === "already" && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-blue-800">
                {dictionary.support.alreadyConfirmed}
              </h2>
            </div>
            <p className="text-blue-700">
              {dictionary.support.alreadyConfirmedMessage}
            </p>
          </div>
        )}

        {/* Header Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-purple mb-4">
            {dictionary.support.title}
          </h1>
          <p className="text-lg text-text-light max-w-2xl mx-auto">
            {dictionary.support.description}
          </p>
        </section>

        {/* Main Content Grid - Membership Left, Donations Right */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Membership Section - Main Content (Left, 2 columns) */}
          <section className="lg:col-span-2 bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-purple rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 00-9.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-primary-purple">
                {dictionary.support.membership}
              </h2>
            </div>

            <p className="text-gray-600 mb-6">
              {dictionary.support.membershipDescription}
            </p>

            <div className="bg-accent-purple-light p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-primary-purple mb-4">
                {dictionary.support.membershipBenefits}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-primary-green shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {dictionary.support.benefit1}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-primary-green shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {dictionary.support.benefit2}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-primary-green shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {dictionary.support.benefit3}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-primary-green shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {dictionary.support.benefit4}
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-accent-light p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-1">
                {dictionary.support.membershipFee}
              </p>
              <p className="text-2xl font-bold text-primary-purple">
                {dictionary.support.feeAmount}
              </p>
            </div>

            {/* Membership Registration Form */}
            <MembershipForm locale={lang as Locale} dictionary={dictionary} />
          </section>

          {/* Donation Cards - Right Side (1 column) */}
          <div className="space-y-6">
            {/* Bank Transfer Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-green rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-primary-purple">
                  {dictionary.support.bankTransfer}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="bg-accent-light p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">
                    {dictionary.support.accountHolder}
                  </p>
                  <p
                    className="text-sm font-semibold text-primary-purple"
                    dir="ltr"
                  >
                    AL-SALAM E.V.
                  </p>
                </div>

                <div className="bg-accent-light p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">
                    {dictionary.support.iban}
                  </p>
                  <p className="text-sm font-mono font-semibold text-primary-green break-all">
                    DE81 6835 0048 0001 1153 85
                  </p>
                </div>

                <div className="bg-accent-light p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">
                    {dictionary.support.creditorId}
                  </p>
                  <p className="text-sm font-mono font-semibold text-gray-800">
                    DE05ZZZ00002617424
                  </p>
                </div>

                <div className="bg-accent-light p-3 rounded flex flex-col items-center">
                  <p className="text-xs text-gray-600 mb-2">
                    {dictionary.support.bankQR}
                  </p>
                  <img
                    src="/images/alsalam-epc-qr-code.png"
                    alt="Bank Transfer QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* PayPal Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-purple rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-primary-purple">
                  {dictionary.support.paypal}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="bg-accent-purple-light p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">
                    {dictionary.support.paypalEmail}
                  </p>
                  <p className="text-sm font-semibold text-primary-purple break-all">
                    alsalame.v19@gmail.com
                  </p>
                </div>

                <div className="bg-accent-purple-light p-3 rounded flex flex-col items-center">
                  <p className="text-xs text-gray-600 mb-2">
                    {dictionary.support.paypalQR}
                  </p>
                  <img
                    src="/images/paypal_qrcode.png"
                    alt="PayPal QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>

                <a
                  href="https://www.paypal.com/paypalme/alsalam575"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary-purple text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-purple/90 transition-colors shadow-md text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852a.932.932 0 0 1 .922-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.76-4.461z" />
                  </svg>
                  {dictionary.support.donateNow}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="text-center p-6 bg-accent-light rounded-lg">
          <p className="text-lg text-primary-purple font-semibold">
            {dictionary.support.thankYou}
          </p>
          <p className="text-text-light mt-2">{dictionary.support.blessings}</p>
        </div>
      </div>
    </div>
  );
}
