import type { Locale } from "@/i18n/config";

interface OrganizationSchemaProps {
  locale: Locale;
}

export function OrganizationSchema({ locale }: OrganizationSchemaProps) {
  const baseUrl = "https://islamisches-zentrum-brombach-loerrach.de";

  const names = {
    de: "Islamisches Zentrum Brombach-Lörrach",
    fr: "Centre Islamique de Brombach-Lörrach",
    ar: "المركز الإسلامي برمباخ - لوراخ",
  };

  const descriptions = {
    de: "Islamisches Zentrum in Brombach-Lörrach. Gemeinde für Gebet, Bildung und spirituelles Wachstum.",
    fr: "Centre Islamique à Brombach-Lörrach. Communauté pour la prière, l'éducation et la croissance spirituelle.",
    ar: "المركز الإسلامي في برمباخ - لوراخ. مجتمع للصلاة والتعليم والنمو الروحي.",
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "ReligiousOrganization",
    name: names[locale],
    alternateName: [
      "Islamisches Zentrum Brombach-Lörrach",
      "Centre Islamique de Brombach-Lörrach",
      "المركز الإسلامي برمباخ - لوراخ",
    ],
    description: descriptions[locale],
    url: `${baseUrl}/${locale}`,
    logo: `${baseUrl}/images/logo.svg`,
    image: `${baseUrl}/images/all-together.jpg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lörrach",
      addressRegion: "Baden-Württemberg",
      addressCountry: "DE",
    },
    sameAs: [
      // Add social media links here when available
    ],
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/${locale}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
