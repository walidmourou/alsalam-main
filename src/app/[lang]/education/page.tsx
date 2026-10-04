import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import EducationRegistrationSection from "@/components/EducationRegistrationSection";

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
  const t = dictionary.education;
  const form = t.form;
  const page = t.page;

  const facts = [
    {
      key: "schedule",
      title: t.scheduleTitle,
      body: [t.schedule],
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      ),
      tone: "bg-blue-100 text-blue-600",
    },
    {
      key: "levels",
      title: t.levelsTitle,
      body: [t.levels],
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      ),
      tone: "bg-green-100 text-green-600",
    },
    {
      key: "timeSlots",
      title: t.timeSlotsTitle,
      body: t.timeSlots.split(", "),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      tone: "bg-purple-100 text-purple-600",
    },
    {
      key: "ageGroups",
      title: t.ageGroupsTitle,
      body: [t.ageGroups],
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 012-2h2.644M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      ),
      tone: "bg-orange-100 text-orange-600",
    },
    {
      key: "fees",
      title: t.freeTitle,
      body: [t.freeForMembers, form.membership.guestFeeHint],
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      ),
      tone: "bg-yellow-100 text-yellow-600",
    },
    {
      key: "registration",
      title: t.registrationTitle,
      body: [t.registrationRequired],
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      ),
      tone: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary-green to-primary-green/80 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">{t.title}</h1>
            <p className="text-xl leading-relaxed opacity-90 md:text-2xl">
              {t.description}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {confirmed === "success" && (
          <div
            role="status"
            className="mb-8 rounded-lg border border-green-200 bg-green-50 p-6 text-center"
          >
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-500">
              <svg
                className="size-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-green-800">
              {page.confirmedTitle}
            </h3>
            <p className="mx-auto max-w-2xl text-green-700">
              {page.confirmedText}
            </p>
          </div>
        )}

        {confirmed === "already" && (
          <div
            role="status"
            className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6 text-center"
          >
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-500">
              <svg
                className="size-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-blue-800">
              {page.alreadyTitle}
            </h3>
            <p className="mx-auto max-w-2xl text-blue-700">{page.alreadyText}</p>
          </div>
        )}

        {/* One column below `lg`, two explicit columns from `lg` upwards:
            call to action and lessons on the left, organisation details and
            contact on the right. */}
        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <EducationRegistrationSection locale={lang as Locale} labels={form} />

            <section className="rounded-2xl bg-white p-8 shadow-lg transition-shadow hover:shadow-xl">
              <div className="mb-6 flex items-center">
                <div className="me-4 flex size-12 items-center justify-center rounded-lg bg-primary-green/10">
                  <svg
                    className="size-6 text-primary-green"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                  {t.arabicLessonsTitle}
                </h2>
              </div>
              <p className="leading-relaxed text-gray-600">
                {t.arabicLessonsDesc}
              </p>
            </section>

            <section className="rounded-2xl bg-white p-8 shadow-lg transition-shadow hover:shadow-xl">
              <div className="mb-6 flex items-center">
                <div className="me-4 flex size-12 items-center justify-center rounded-lg bg-primary-purple/10">
                  <svg
                    className="size-6 text-primary-purple"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                  {t.quranLessonsTitle}
                </h2>
              </div>
              <p className="leading-relaxed text-gray-600">
                {t.quranLessonsDesc}
              </p>
            </section>
          </div>

          <div className="space-y-8">
            <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
                {t.organizationTitle}
              </h2>

              <div className="grid gap-6 sm:grid-cols-2">
                {facts.map((fact) => (
                  <div key={fact.key} className="flex items-start space-x-4">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${fact.tone}`}
                    >
                      <svg
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        {fact.icon}
                      </svg>
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-gray-900">
                        {fact.title}
                      </h3>
                      <div className="space-y-1 text-gray-600">
                        {fact.body.map((line) => (
                          <p key={line} className="text-sm">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary-green/10">
                <svg
                  className="size-6 text-primary-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                {page.contactCta}
              </h2>
              <p className="mx-auto max-w-2xl text-gray-600">{t.contactText}</p>
              <a
                href="mailto:info@alsalam-loerrach.org"
                className="mt-4 inline-block font-semibold text-primary-green underline hover:no-underline"
              >
                info@alsalam-loerrach.org
              </a>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
