"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { useTransition } from "react";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Extract current locale from pathname
  const currentLocale = pathname.split("/")[1] as Locale;
  const isRTL = currentLocale === "ar";

  const switchLocale = (newLocale: Locale) => {
    if (!isPending && newLocale !== currentLocale) {
      startTransition(() => {
        // Set cookie for locale preference
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

        // Replace the locale in the pathname
        const segments = pathname.split("/");
        segments[1] = newLocale;
        const newPath = segments.join("/");

        router.push(newPath);
      });
    }
  };

  const languages = [
    { code: "de" as const, label: "DE", name: "Deutsch" },
    { code: "ar" as const, label: "عربي", name: "العربية" },
    { code: "fr" as const, label: "FR", name: "Français" },
  ];

  return (
    <div className="relative group">
      <div
        className={`flex items-center gap-1 px-2 md:px-3 py-2 rounded-xl bg-linear-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <svg
          className="w-4 h-4 text-gray-600 group-hover:text-[#009245] transition-colors duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div
          className={`flex gap-0.5 md:gap-1 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {languages.map(({ code, label, name }) => (
            <button
              key={code}
              onClick={() => switchLocale(code)}
              disabled={isPending}
              className={`relative px-2 md:px-3 py-1 md:py-1.5 text-sm font-medium rounded-lg transition-all duration-300 group/lang ${
                currentLocale === code
                  ? "text-white bg-linear-to-r from-[#009245] to-[#007a3a] shadow-lg shadow-[#009245]/25"
                  : "text-gray-600 hover:text-[#009245] hover:bg-white/60"
              } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
              title={name}
            >
              {label}
              {currentLocale === code && (
                <div className="absolute inset-0 bg-linear-to-r from-white/20 to-transparent rounded-lg"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
