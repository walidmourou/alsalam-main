import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import EducationRegistrationForm from "@/components/EducationRegistrationForm";

export default async function EducationPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  const { confirmed } = await searchParams;
  const dictionary = await getDictionary(lang as Locale);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-green to-primary-green/80 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {dictionary.education?.title}
            </h1>
            <p className="text-xl md:text-2xl opacity-90 leading-relaxed">
              {dictionary.education?.description}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Confirmation Messages */}
        {confirmed === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
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
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              {lang === "de"
                ? "Bildungsanmeldung bestätigt!"
                : lang === "ar"
                ? "تم تأكيد التسجيل في التعليم!"
                : "Inscription éducation confirmée!"}
            </h3>
            <p className="text-green-700">
              {lang === "de"
                ? "Ihre Anmeldung wurde erfolgreich bestätigt. Wir werden uns in Kürze mit Ihnen in Verbindung setzen, um die nächsten Schritte zu besprechen."
                : lang === "ar"
                ? "تم تأكيد تسجيلك بنجاح. سنتواصل معك قريباً لمناقشة الخطوات التالية."
                : "Votre inscription a été confirmée avec succès. Nous vous contacterons bientôt pour discuter des prochaines étapes."}
            </p>
          </div>
        )}

        {confirmed === "already" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
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
            </div>
            <h3 className="text-xl font-bold text-blue-800 mb-2">
              {lang === "de"
                ? "Bereits bestätigt"
                : lang === "ar"
                ? "تم التأكيد مسبقاً"
                : "Déjà confirmé"}
            </h3>
            <p className="text-blue-700">
              {lang === "de"
                ? "Ihre Anmeldung wurde bereits bestätigt."
                : lang === "ar"
                ? "تم تأكيد تسجيلك مسبقاً."
                : "Votre inscription a déjà été confirmée."}
            </p>
          </div>
        )}

        {/* Programs Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Arabic Lessons Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary-green/10 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-primary-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {dictionary.education?.arabicLessonsTitle}
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {dictionary.education?.arabicLessonsDesc}
            </p>
          </div>

          {/* Quran Lessons Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary-purple/10 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-primary-purple"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {dictionary.education?.quranLessonsTitle}
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {dictionary.education?.quranLessonsDesc}
            </p>
          </div>
        </div>

        {/* Organization Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {dictionary.education?.organizationTitle}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Schedule */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {dictionary.education?.scheduleTitle}
                </h3>
                <p className="text-gray-600">
                  {dictionary.education?.schedule}
                </p>
              </div>
            </div>

            {/* Levels */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {dictionary.education?.levelsTitle}
                </h3>
                <p className="text-gray-600">{dictionary.education?.levels}</p>
              </div>
            </div>

            {/* Time Slots */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {dictionary.education?.timeSlotsTitle}
                </h3>
                <div className="text-gray-600 space-y-1">
                  {dictionary.education?.timeSlots
                    ?.split(", ")
                    .map((slot, index) => (
                      <div key={index} className="text-sm">
                        {slot}
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Age Groups */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {dictionary.education?.ageGroupsTitle}
                </h3>
                <p className="text-gray-600">
                  {dictionary.education?.ageGroups}
                </p>
              </div>
            </div>

            {/* Free for Members */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {dictionary.education?.freeTitle}
                </h3>
                <p className="text-gray-600">
                  {dictionary.education?.freeForMembers}
                </p>
              </div>
            </div>

            {/* Registration */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {dictionary.education?.registrationTitle}
                </h3>
                <p className="text-gray-600">
                  {dictionary.education?.registrationRequired}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Section */}
        <EducationRegistrationForm
          locale={lang as Locale}
          dictionary={dictionary}
        />
      </div>
    </div>
  );
}
