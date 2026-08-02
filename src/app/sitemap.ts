import { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import pool from "@/lib/db";
import type { Article } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.alsalam-loerrach.org";

  // Static routes
  const routes = [
    "",
    "/prayers",
    "/education",
    "/articles",
    "/support",
    "/signin",
    "/cookie-policy",
    "/privacy-policy",
  ];

  // Generate URLs for all static routes in all locales
  const staticUrls = locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: (route === ""
        ? "daily"
        : route === "/articles"
          ? "daily"
          : "weekly") as
        | "always"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "never",
      priority: route === "" ? 1.0 : route === "/articles" ? 0.9 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((loc) => [loc, `${baseUrl}/${loc}${route}`]),
        ),
      },
    })),
  );

  // Fetch published articles for dynamic URLs
  try {
    const [articles] = await pool.query<Article[]>(
      "SELECT id, updated_at FROM articles WHERE status = 'published' ORDER BY published_at DESC",
    );

    const articleUrls = locales.flatMap((locale) =>
      (articles as Article[]).map((article) => ({
        url: `${baseUrl}/${locale}/articles/${article.id}`,
        lastModified: new Date(article.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [
              loc,
              `${baseUrl}/${loc}/articles/${article.id}`,
            ]),
          ),
        },
      })),
    );

    return [...staticUrls, ...articleUrls];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticUrls; // Return static URLs if database query fails
  }
}
