export const dynamic = "force-dynamic";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import HeroWithModal from "@/components/HeroWithModal";
import pool from "@/lib/db";
import MainHero from "@/components/MainHero";

interface Article {
  id: number;
  title_de: string;
  title_fr: string;
  title_ar: string;
  content_de: string;
  content_fr: string;
  content_ar: string;
  image_url: string | null;
  is_published: boolean;
  author_id: number;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
}

async function getArticles(): Promise<Article[]> {
  const [result] = await pool.query(
    "SELECT * FROM articles WHERE status = 'published' ORDER BY published_at DESC LIMIT 3",
  );
  return result as Article[];
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const articles = await getArticles();

  return (
    <>
      <MainHero params={params} />
      <div className="container mx-auto px-4 py-12">
        <HeroWithModal
          articles={articles}
          lang={lang as Locale}
          dictionary={dictionary}
        />

        <section className="grid md:grid-cols-3 gap-8">
          <div className="bg-accent-light border border-primary-green/20 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary-green rounded-full flex items-center justify-center mb-4">
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary-purple mb-2">
              {dictionary.home.educationTitle}
            </h3>
            <p className="text-text-light">{dictionary.home.educationDesc}</p>
          </div>

          <div className="bg-accent-purple-light border border-primary-purple/20 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary-purple rounded-full flex items-center justify-center mb-4">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary-purple mb-2">
              {dictionary.home.communityTitle}
            </h3>
            <p className="text-text-light">{dictionary.home.communityDesc}</p>
          </div>

          <div className="bg-accent-light border border-primary-green/20 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary-green rounded-full flex items-center justify-center mb-4">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary-purple mb-2">
              {dictionary.home.prayerTimesTitle}
            </h3>
            <p className="text-text-light">{dictionary.home.prayerTimesDesc}</p>
          </div>
        </section>
      </div>
    </>
  );
}
