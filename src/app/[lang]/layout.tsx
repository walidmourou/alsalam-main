import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { OrganizationSchema } from "@/components/OrganizationSchema";
import { LangSetter } from "@/components/LangSetter";
import { locales, localeDirections, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return {
    title: dictionary.seo.title,
    description: dictionary.seo.description,
    metadataBase: new URL("https://islamisches-zentrum-brombach-loerrach.de"),
    alternates: {
      canonical: `/${lang}`,
      languages: {
        de: "/de",
        fr: "/fr",
        ar: "/ar",
      },
    },
    openGraph: {
      title: dictionary.seo.title,
      description: dictionary.seo.description,
      locale: lang,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dictionary.seo.title,
      description: dictionary.seo.description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const dir = localeDirections[lang as Locale];

  return (
    <>
      <LangSetter lang={lang} dir={dir} />
      <OrganizationSchema locale={lang as Locale} />
      <Header locale={lang as Locale} dictionary={dictionary} />
      <main className="min-h-screen bg-white">{children}</main>
      <Footer locale={lang as Locale} translations={dictionary} />
    </>
  );
}
