import Hero from "./Hero";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

interface Article {
  id: number;
  title_de: string;
  title_fr: string;
  title_ar: string;
  content_de: string;
  content_fr: string;
  content_ar: string;
  image_url: string | null;
  status: string;
  author_id: number;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
}

interface HeroWithModalProps {
  articles: Article[];
  lang: Locale;
  dictionary: any;
}

export default async function HeroWithModal({
  articles,
  lang,
  dictionary,
}: HeroWithModalProps) {
  return <Hero articles={articles} lang={lang} dictionary={dictionary} />;
}
