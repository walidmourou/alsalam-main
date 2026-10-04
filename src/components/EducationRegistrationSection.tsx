"use client";

// src/components/EducationRegistrationSection.tsx
// The "request a place now" block of the education page. It carries the call to
// action and hosts the multi-step wizard inside a modal, so the page itself
// stays a set of blocks instead of one very long form.
import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type deDictionary from "@/i18n/dictionaries/de.json";
import Modal from "@/components/Modal";
import EducationRegistrationForm from "@/components/EducationRegistrationForm";

type FormLabels = typeof deDictionary.education.form;

interface EducationRegistrationSectionProps {
  locale: Locale;
  labels: FormLabels;
}

export default function EducationRegistrationSection({
  locale,
  labels,
}: EducationRegistrationSectionProps) {
  const t = labels;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section
        id="registration-form"
        className="flex scroll-mt-24 flex-col justify-center rounded-2xl bg-gradient-to-br from-primary-green to-primary-purple p-8 text-white shadow-lg md:p-10"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold md:text-3xl">{t.cta.title}</h2>
          <p className="mt-3 text-base opacity-90 md:text-lg">{t.cta.description}</p>

          <ul className="mt-6 grid gap-3 text-start sm:grid-cols-3">
            {t.cta.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2 rounded-lg bg-white/10 p-3 text-sm"
              >
                <svg
                  className="mt-0.5 size-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {benefit}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm opacity-90">{t.cta.feeHint}</p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-haspopup="dialog"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-primary-green transition-colors hover:bg-gray-50"
            >
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              {t.cta.button}
            </button>
            <Link
              href={`/${locale}/support`}
              className="text-sm font-medium underline opacity-90 hover:no-underline"
            >
              {t.cta.membershipLink}
            </Link>
          </div>
        </div>
      </section>

      {/* The wizard brings its own title and close button, so the modal hides
          its header and `title` only names the dialog for screen readers. */}
      {isOpen && (
        <Modal
          isOpen
          onClose={() => setIsOpen(false)}
          title={t.title}
          closeLabel={t.close}
          panelClassName="max-w-4xl"
          showHeader={false}
        >
          <EducationRegistrationForm
            locale={locale}
            labels={t}
            inModal
            onRequestClose={() => setIsOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}