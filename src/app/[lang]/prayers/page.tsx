import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import PrayerTimesContent from "@/components/PrayerTimesContent";

interface PrayerTimesPageProps {
  params: Promise<{ lang: string }>;
}

// Server component
export default async function PrayersPage({ params }: PrayerTimesPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return <PrayerTimesContent locale={lang as Locale} dictionary={dictionary} />;
}
