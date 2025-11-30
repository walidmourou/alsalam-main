import { locales } from "@/i18n/config";

export default function sitemap() {
  const baseUrl = "https://islamisches-zentrum-brombach-loerrach.de";

  // Generate URLs for all locales
  const routes = ["", "/about", "/services", "/contact"];

  const urls = locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? "daily" : "weekly",
      priority: route === "" ? 1.0 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((loc) => [loc, `${baseUrl}/${loc}${route}`])
        ),
      },
    }))
  );

  return urls;
}
