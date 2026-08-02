import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import PrayerTimesContent from "@/components/PrayerTimesContent";

// Revalidate every hour (3600 seconds) - prayer times change daily
export const revalidate = 3600;

interface PrayerTimesPageProps {
  params: Promise<{ lang: string }>;
}

// Server component
export default async function PrayersPage({ params }: PrayerTimesPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return <PrayerTimesContent locale={lang as Locale} dictionary={dictionary} />;
}
