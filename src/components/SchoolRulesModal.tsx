"use client";

// src/components/SchoolRulesModal.tsx
// Read-only view of the Vereinsschule "Schulordnung". Parents must accept it
// (consents.schoolRulesAccepted) before a registration can be submitted.
import { useEffect, useRef } from "react";
import type { Locale } from "@/i18n/config";
import { SCHOOL_RULES } from "@/lib/school-rules";
import { isTopOverlay, popOverlay, pushOverlay } from "@/lib/overlay";

interface SchoolRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  labels: { close: string };
}

export default function SchoolRulesModal({
  isOpen,
  onClose,
  locale,
  labels,
}: SchoolRulesModalProps) {
  const content = SCHOOL_RULES[locale];
  const tokenRef = useRef<symbol | null>(null);
  if (tokenRef.current === null) tokenRef.current = Symbol("school-rules");

  useEffect(() => {
    if (!isOpen) return;

    // Opens on top of the registration modal, which stays mounted underneath.
    const token = tokenRef.current ?? Symbol("school-rules");
    pushOverlay(token);

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only the topmost overlay reacts, so Escape closes this one first.
      if (event.key === "Escape" && isTopOverlay(token)) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      popOverlay(token);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-gray-900/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-start justify-center p-4 sm:items-center">
        <div className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="flex items-center justify-between gap-4 bg-orange-500 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">{content.title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-white transition-colors hover:bg-white/20"
              aria-label={labels.close}
            >
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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

          <div
            className="max-h-[70vh] overflow-y-auto bg-gray-50 px-6 py-6"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <p className="mb-6 text-sm leading-relaxed text-gray-700">
                {content.intro}
              </p>

              <div className="space-y-6">
                {content.sections.map((section) => (
                  <div key={section.title}>
                    <h4 className="mb-2 text-base font-semibold text-gray-900">
                      {section.title}
                    </h4>
                    <ul className="list-disc space-y-1 ps-5 text-sm leading-relaxed text-gray-700">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-orange-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-orange-600"
            >
              {labels.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
