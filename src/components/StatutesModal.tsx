"use client";

import type { Locale } from "@/i18n/config";
import { STATUTES_DATA } from "@/lib/statutes-data";

interface StatutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  title: string;
}

export default function StatutesModal({
  isOpen,
  onClose,
  locale,
  title,
}: StatutesModalProps) {
  const content = STATUTES_DATA[locale];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal panel */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-4xl">
          {/* Header */}
          <div className="bg-primary-purple px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white" id="modal-title">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
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
          <div className="px-6 py-8 max-h-[75vh] overflow-y-auto bg-gray-50">
            <div
              className="bg-white p-6 rounded-lg shadow-sm"
              dir={locale === "ar" ? "rtl" : "ltr"}
            >
              <div className="prose prose-sm max-w-none prose-headings:text-primary-purple prose-p:text-gray-700 prose-p:leading-relaxed">
                <div className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-7">
                  {content}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="bg-primary-purple text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-purple/90 transition-colors"
            >
              {locale === "de"
                ? "Schließen"
                : locale === "fr"
                ? "Fermer"
                : "إغلاق"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
