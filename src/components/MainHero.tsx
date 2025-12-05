import { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Book, Clock, Users } from "lucide-react";
import Link from "next/link";

export default async function MainHero({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return (
    <section className="relative lg:h-[600px] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=2000&q=80"
          alt="Mosque Interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#262262]/60"></div>
      </div>
      <div
        className={`relative container mx-auto p-4 h-full flex items-center ${
          lang === "ar" ? "justify-end" : "justify-start"
        }`}
      >
        <div className="max-w-2xl text-white">
          <h2 className="text-5xl font-bold mb-6">
            {dictionary.main_hero.heroTitle}
          </h2>
          <p className="text-xl mb-8">{dictionary.main_hero.heroSubtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg flex flex-col">
              <Clock className="h-8 w-8 text-[#009245] mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {dictionary.main_hero.dailyPrayers}
              </h3>
              <p className="text-gray-200 mb-4 grow">
                {dictionary.main_hero.prayersDesc}
              </p>
              <Link
                href={`/${lang}/prayers`}
                className="inline-block bg-[#009245] hover:bg-[#007a38] text-white font-medium py-2 px-4 rounded transition-colors text-center"
              >
                {dictionary.main_hero.prayersButton}
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg flex flex-col">
              <Book className="h-8 w-8 text-[#009245] mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {dictionary.main_hero.quranLessons}
              </h3>
              <p className="text-gray-200 mb-4 grow">
                {dictionary.main_hero.lessonsDesc}
              </p>
              <Link
                href={`/${lang}/education#registration-form`}
                className="inline-block bg-[#009245] hover:bg-[#007a38] text-white font-medium py-2 px-4 rounded transition-colors text-center"
              >
                {dictionary.main_hero.lessonsButton}
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg flex flex-col">
              <Users className="h-8 w-8 text-[#009245] mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {dictionary.main_hero.community}
              </h3>
              <p className="text-gray-200 mb-4 grow">
                {dictionary.main_hero.communityDesc}
              </p>
              <Link
                href={`/${lang}/support`}
                className="inline-block bg-[#009245] hover:bg-[#007a38] text-white font-medium py-2 px-4 rounded transition-colors text-center"
              >
                {dictionary.main_hero.communityButton}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
