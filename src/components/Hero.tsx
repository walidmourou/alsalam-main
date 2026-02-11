import type { Locale } from "@/i18n/config";
import Link from "next/link";

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

interface HeroProps {
  articles: Article[];
  lang: Locale;
  dictionary: any;
}

export default function Hero({ articles, lang, dictionary }: HeroProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-linear-to-br from-accent-light via-white to-accent-purple-light relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-5 left-5 w-24 h-24 bg-primary-green rounded-full blur-2xl"></div>
        <div className="absolute bottom-5 right-5 w-32 h-32 bg-primary-purple rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-r from-primary-green to-primary-purple rounded-full mb-4">
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
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-primary-purple to-primary-green bg-clip-text text-transparent mb-2">
            {dictionary.home.latestArticles}
          </h2>
          <p className="text-sm text-text-light max-w-xl mx-auto">
            {dictionary.home.latestArticlesDesc}
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article, index) => {
            const title =
              lang === "de"
                ? article.title_de
                : lang === "fr"
                  ? article.title_fr
                  : article.title_ar;
            const content =
              lang === "de"
                ? article.content_de
                : lang === "fr"
                  ? article.content_fr
                  : article.content_ar;
            const contentSnippet =
              content.length > 200
                ? content.substring(0, 200) + "..."
                : content;

            return (
              <Link
                key={article.id}
                href={`/${lang}/articles/${article.id}`}
                className="block"
              >
                <article className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
                  {/* Image Section */}
                  <div className="relative overflow-hidden">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={title}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-40 bg-linear-to-br from-primary-purple/10 to-primary-green/10 flex items-center justify-center">
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

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Date badge */}
                    {article.published_at && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-primary-purple">
                        {new Date(article.published_at).toLocaleDateString(
                          lang,
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-4">
                    <h3
                      className="text-lg font-bold text-primary-purple mb-2 group-hover:text-primary-green transition-colors duration-300 overflow-hidden"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {title}
                    </h3>

                    <p
                      className="text-text-light leading-relaxed mb-3 text-sm overflow-hidden"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {contentSnippet}
                    </p>

                    {/* Read more link */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-primary-green font-medium group-hover:text-primary-purple transition-colors duration-300">
                        <span className="text-xs">
                          {dictionary.articles.readMore}
                        </span>
                        <svg
                          className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300"
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
                      </div>

                      {/* Article number badge */}
                      <div className="bg-linear-to-r from-primary-green/10 to-primary-purple/10 rounded-full px-2 py-0.5">
                        <span className="text-xs font-medium text-primary-purple">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {/* View All Articles Button */}
        <div className="text-center mt-6">
          <Link
            href={`/${lang}/articles`}
            className="inline-flex items-center px-4 py-2 bg-linear-to-r from-primary-purple to-primary-green text-white font-medium text-sm rounded-full hover:shadow-md hover:scale-105 transition-all duration-300 group"
          >
            <span>{dictionary.home.viewAll}</span>
            <svg
              className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
