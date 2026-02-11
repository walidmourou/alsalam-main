import pool from "@/lib/db";
import type { Locale } from "@/i18n/config";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { locales } from "@/i18n/config";

// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300;

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

async function getArticle(id: number): Promise<Article | null> {
  const [result] = await pool.query(
    "SELECT * FROM articles WHERE id = ? AND status = 'published'",
    [id],
  );
  const articleRows = result as Article[];
  return articleRows.length > 0 ? articleRows[0] : null;
}

async function getAllArticleIds(): Promise<number[]> {
  const [result] = await pool.query(
    "SELECT id FROM articles WHERE status = 'published'",
  );
  return (result as { id: number }[]).map((row) => row.id);
}

// Generate static params for all articles and languages
export async function generateStaticParams() {
  const articleIds = await getAllArticleIds();

  const params = [];
  for (const locale of locales) {
    for (const id of articleIds) {
      params.push({
        lang: locale,
        id: id.toString(),
      });
    }
  }

  return params;
}

interface ArticlePageProps {
  params: Promise<{ lang: string; id: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { lang, id } = await params;
  const currentLang = lang as Locale;
  const articleId = parseInt(id);
  const dictionary = await getDictionary(currentLang);

  if (isNaN(articleId)) {
    notFound();
  }

  const article = await getArticle(articleId);

  if (!article) {
    notFound();
  }

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
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <Link
              href={`/${lang}`}
              className="hover:text-primary-purple transition-colors"
            >
              {dictionary.articles.breadcrumbHome}
            </Link>
          </li>
          <li className="flex items-center">
            <svg
              className="w-4 h-4 mx-2"
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
            <Link
              href={`/${lang}/articles`}
              className="hover:text-primary-purple transition-colors"
            >
              {dictionary.articles.breadcrumbArticles}
            </Link>
          </li>
          <li className="flex items-center">
            <svg
              className="w-4 h-4 mx-2"
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
            <span className="text-primary-purple font-medium">{title}</span>
          </li>
        </ol>
      </nav>

      {/* Article Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="bg-primary-purple/10 text-primary-purple px-3 py-1 rounded-full">
              {dictionary.articles.article}
            </span>
            <span>
              {dictionary.articles.publishedOn}{" "}
              {article.published_at &&
                new Date(article.published_at).toLocaleDateString(currentLang, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </span>
          </div>
          <div className="text-sm text-gray-500">ID: #{article.id}</div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-primary-purple to-primary-green bg-clip-text text-transparent mb-6">
          {title}
        </h1>

        {/* Featured Image */}
        {article.image_url && (
          <div className="mb-8">
            <img
              src={article.image_url}
              alt={title}
              className="w-full max-w-4xl mx-auto h-64 md:h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>
        )}
      </header>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            {content.split("\n\n").map((paragraph, index) => (
              <p
                key={index}
                className="mb-6 text-gray-800 leading-relaxed text-lg"
              >
                {paragraph.split("\n").map((line, lineIndex) => (
                  <span key={lineIndex}>
                    {line}
                    {lineIndex < paragraph.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>
      </article>

      {/* Navigation */}
      <nav className="max-w-4xl mx-auto mt-12 flex items-center justify-between">
        <Link
          href={`/${lang}/articles`}
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
          {dictionary.articles.allArticles}
        </Link>

        <Link
          href={`/${lang}`}
          className="inline-flex items-center px-6 py-3 bg-primary-purple text-white font-medium rounded-full hover:bg-primary-purple/90 transition-colors duration-300"
        >
          {dictionary.articles.backToHome}
          <svg
            className="w-5 h-5 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </Link>
      </nav>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps) {
  const { lang, id } = await params;
  const currentLang = lang as Locale;
  const articleId = parseInt(id);

  if (isNaN(articleId)) {
    return {
      title: "Article Not Found",
    };
  }

  const article = await getArticle(articleId);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  const title =
    currentLang === "de"
      ? article.title_de
      : currentLang === "fr"
        ? article.title_fr
        : article.title_ar;

  return {
    title: `${title} | Alsalam Loerrach`,
    description:
      currentLang === "de"
        ? article.content_de.substring(0, 160)
        : currentLang === "fr"
          ? article.content_fr.substring(0, 160)
          : article.content_ar.substring(0, 160),
    openGraph: {
      title: title,
      description:
        currentLang === "de"
          ? article.content_de.substring(0, 160)
          : currentLang === "fr"
            ? article.content_fr.substring(0, 160)
            : article.content_ar.substring(0, 160),
      images: article.image_url ? [article.image_url] : [],
    },
  };
}
