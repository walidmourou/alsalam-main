export const dynamic = "force-dynamic";
import pool from "@/lib/db";
import type { Locale } from "@/i18n/config";
import Link from "next/link";
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

async function getAllArticles(): Promise<Article[]> {
  const [rows] = await pool.execute(
    "SELECT * FROM articles WHERE status = 'published' ORDER BY published_at DESC"
  );
  return rows as Article[];
}

interface ArticlesPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ArticlesPage({
  params,
  searchParams,
}: ArticlesPageProps) {
  const { lang } = await params;
  const articles = await getAllArticles();
  const currentLang = lang as Locale;
  const dictionary = await getDictionary(currentLang);

  // Get search parameters
  const { search, sort } = await searchParams;
  const searchQuery = typeof search === "string" ? search : "";
  const sortBy = typeof sort === "string" ? sort : "newest";

  // Filter articles based on search
  let filteredArticles = articles;
  if (searchQuery) {
    filteredArticles = articles.filter((article) => {
      const title =
        currentLang === "de"
          ? article.title_de
          : currentLang === "fr"
          ? article.title_fr
          : article.title_ar;
      const content =
        currentLang === "de"
          ? article.content_de
          : currentLang === "fr"
          ? article.content_fr
          : article.content_ar;
      return (
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }

  // Sort articles
  if (sortBy === "oldest") {
    filteredArticles.sort(
      (a, b) =>
        new Date(a.published_at || 0).getTime() -
        new Date(b.published_at || 0).getTime()
    );
  } else if (sortBy === "title") {
    filteredArticles.sort((a, b) => {
      const titleA =
        currentLang === "de"
          ? a.title_de
          : currentLang === "fr"
          ? a.title_fr
          : a.title_ar;
      const titleB =
        currentLang === "de"
          ? b.title_de
          : currentLang === "fr"
          ? b.title_fr
          : b.title_ar;
      return titleA.localeCompare(titleB);
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-linear-to-r from-primary-purple to-primary-green bg-clip-text text-transparent mb-4">
          {dictionary.articles.title}
        </h1>
        <p className="text-lg text-text-light max-w-2xl mx-auto">
          {dictionary.articles.subtitle}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <form
          id="searchForm"
          method="GET"
          className="flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                name="search"
                placeholder={dictionary.articles.searchPlaceholder}
                defaultValue={searchQuery}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {dictionary.articles.sortLabel}
            </span>
            <select
              name="sort"
              defaultValue={sortBy}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
            >
              <option value="newest">{dictionary.articles.newest}</option>
              <option value="oldest">{dictionary.articles.oldest}</option>
              <option value="title">{dictionary.articles.byTitle}</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-primary-purple/90 transition-colors"
            >
              {dictionary.articles.filter}
            </button>
          </div>
        </form>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredArticles.length} {dictionary.articles.resultsFound}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {dictionary.articles.noArticlesFound}
          </h3>
          <p className="text-gray-500">
            {dictionary.articles.tryDifferentSearch}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => {
            const title =
              currentLang === "de"
                ? article.title_de
                : currentLang === "fr"
                ? article.title_fr
                : article.title_ar;
            const content =
              currentLang === "de"
                ? article.content_de
                : currentLang === "fr"
                ? article.content_fr
                : article.content_ar;
            const contentSnippet =
              content.length > 150
                ? content.substring(0, 150) + "..."
                : content;

            return (
              <article
                key={article.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Image Section */}
                <div className="relative overflow-hidden">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-linear-to-br from-primary-purple/10 to-primary-green/10 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-primary-purple/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Date badge */}
                  {article.published_at && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-primary-purple">
                      {new Date(article.published_at).toLocaleDateString(
                        currentLang,
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-primary-purple mb-3">
                    {title}
                  </h3>

                  <p className="text-text-light leading-relaxed mb-4 text-sm">
                    {contentSnippet}
                  </p>

                  {/* Read more link */}
                  <Link
                    href={`/${lang}/articles/${article.id}`}
                    className="inline-flex items-center text-primary-green font-medium hover:text-primary-purple transition-colors duration-300"
                  >
                    <span className="text-sm">
                      {dictionary.articles.readMore}
                    </span>
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Back to Home */}
      <div className="text-center mt-12">
        <Link
          href={`/${lang}`}
          className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full transition-colors duration-300"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          {dictionary.articles.backToHome}
        </Link>
      </div>
    </div>
  );
}
