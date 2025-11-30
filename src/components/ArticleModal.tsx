"use client";

import { useState } from "react";
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

interface ArticleModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Locale;
  dictionary: any;
}

export default function ArticleModal({
  article,
  isOpen,
  onClose,
  lang,
  dictionary,
}: ArticleModalProps) {
  if (!isOpen || !article) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-primary-purple">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {article.image_url && (
            <img
              src={article.image_url}
              alt={title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}

          <div className="prose prose-lg max-w-none">
            {content.split("\n\n").map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph.split("\n").map((line, lineIndex) => (
                  <span key={lineIndex}>
                    {line}
                    {lineIndex < paragraph.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </p>
            ))}
          </div>

          {/* Article metadata */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
            <div>
              {dictionary.articles.publishedOn}:{" "}
              {article.published_at &&
                new Date(article.published_at).toLocaleDateString(lang, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </div>
            <div>ID: #{article.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
