"use client";

import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";

interface FooterProps {
  locale: Locale;
  translations: any;
}

export default function Footer({ locale, translations: t }: FooterProps) {
  const isRTL = locale === "ar";

  // Helper function to get nested translation
  const getTranslation = (key: string) => {
    const keys = key.split(".");
    let result: any = t;
    for (const k of keys) {
      result = result?.[k];
    }
    return result || key;
  };

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {/* Logo and About Section */}
          <div className="lg:col-span-2">
            <div
              className={`flex items-center mb-4 ${
                isRTL ? "justify-end" : "justify-start"
              }`}
            >
              <Image
                src="/images/logo.svg"
                width={150}
                height={50}
                alt="Alsalam Logo"
                className="h-12 w-auto"
              />
            </div>
            <p className="text-gray-600 mb-4 leading-relaxed">
              {getTranslation("footer.footerText") ||
                "A place of meeting, prayer and learning"}
            </p>
            <p className="text-sm text-gray-500">
              {getTranslation("footer.subtitle") || "Islamic Center"}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-[#262262] mb-4">
              {getTranslation("footer.quickLinks") || "Quick Links"}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/prayers`}
                  className="text-gray-600 hover:text-[#009245] transition-colors"
                >
                  {getTranslation("footer.prayerTimesLink") || "Prayer Times"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/support`}
                  className="text-gray-600 hover:text-[#009245] transition-colors"
                >
                  {getTranslation("nav.support") || "Support"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/articles`}
                  className="text-gray-600 hover:text-[#009245] transition-colors"
                >
                  {getTranslation("nav.articles") || "Articles"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/education`}
                  className="text-gray-600 hover:text-[#009245] transition-colors"
                >
                  {getTranslation("footer.educationPage") || "Education"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-[#262262] mb-4">
              {getTranslation("footer.contact") || "Contact Us"}
            </h3>
            <div className="space-y-4">
              {/* Email */}
              <div
                className={`flex items-center ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <svg
                  className={`h-5 w-5 text-[#009245] shrink-0 ${
                    isRTL ? "mr-0 ml-3" : "mr-3"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href="mailto:info@alsalam-loerrach.org"
                  className="text-gray-600 hover:text-[#009245] transition-colors text-sm"
                >
                  info@alsalam-loerrach.org
                </a>
              </div>

              {/* WhatsApp */}
              <div
                className={`flex items-start ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <svg
                  className={`h-5 w-5 text-[#009245] shrink-0 mt-0.5 ${
                    isRTL ? "mr-0 ml-3" : "mr-3"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <a
                  href="https://chat.whatsapp.com/DrdjKhcPAmULfTklnMuhM9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#009245] transition-colors text-sm"
                >
                  WhatsApp Group
                </a>
              </div>

              {/* Address */}
              <div
                className={`flex items-start ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <svg
                  className={`h-5 w-5 text-[#009245] shrink-0 mt-0.5 ${
                    isRTL ? "mr-0 ml-3" : "mr-3"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-gray-600 text-sm leading-relaxed">
                  Schopfheimer Str. 25 (2 OG)
                  <br />
                  79541 Lörrach (Brombach)
                  <br />
                  Deutschland
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className={`border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between ${
            isRTL ? "md:flex-row-reverse" : ""
          }`}
        >
          <div
            className={`flex items-center text-sm text-gray-500 mb-4 md:mb-0 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <span>© {new Date().getFullYear()}</span>
            <span className="mx-2">•</span>
            <span>{getTranslation("footer.subtitle") || "Islamic Center"}</span>
            <span className="mx-2">•</span>
            <span>
              {getTranslation("footer.allRightsReserved") ||
                "All rights reserved"}
            </span>
          </div>

          <div className="text-sm text-gray-500">
            <span>{getTranslation("footer.madeWith") || "Made with"}</span>
            <span className="text-red-500 mx-1">♥</span>
            <span>
              {getTranslation("footer.forCommunity") || "for our community"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
