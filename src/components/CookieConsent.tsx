"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";

interface CookieConsentProps {
  locale: Locale;
  translations: any;
}

// Helper function to get a cookie value
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

// Helper function to set a cookie
function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export default function CookieConsent({
  locale,
  translations: t,
}: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const isRTL = locale === "ar";

  useEffect(() => {
    // Check if user has already made a choice
    const consent = getCookie("cookie-consent");
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consentData = JSON.stringify({
      necessary: true,
      functional: true,
      analytics: false, // Set to true if you use analytics
      marketing: false,
      timestamp: new Date().toISOString(),
    });
    setCookie("cookie-consent", consentData);
    setShowBanner(false);
  };

  const handleAcceptNecessary = () => {
    const consentData = JSON.stringify({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    });
    setCookie("cookie-consent", consentData);
    setShowBanner(false);
  };

  const handleDenyAll = () => {
    const consentData = JSON.stringify({
      necessary: true, // Necessary cookies can't be denied
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    });
    setCookie("cookie-consent", consentData);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          {/* Main Content */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t.cookies?.title || "Cookie Settings"}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t.cookies?.description ||
                  "We use cookies to improve your experience on our website. You can accept all cookies, only necessary cookies, or customize your preferences."}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 items-center text-xs">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-[#009245] hover:underline font-medium"
                >
                  {showDetails
                    ? t.cookies?.hideDetails || "Hide Details"
                    : t.cookies?.showDetails || "Show Details"}
                </button>
                <span className="text-gray-400">•</span>
                <Link
                  href={`/${locale}/privacy-policy`}
                  className="text-[#009245] hover:underline font-medium"
                >
                  {t.cookies?.privacyPolicy || "Privacy Policy"}
                </Link>
                <span className="text-gray-400">•</span>
                <Link
                  href={`/${locale}/cookie-policy`}
                  className="text-[#009245] hover:underline font-medium"
                >
                  {t.cookies?.cookiePolicy || "Cookie Policy"}
                </Link>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 sm:flex-nowrap">
              <button
                onClick={handleDenyAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap"
              >
                {t.cookies?.denyAll || "Deny All"}
              </button>
              <button
                onClick={handleAcceptNecessary}
                className="px-4 py-2 text-sm font-medium text-[#262262] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap"
              >
                {t.cookies?.necessaryOnly || "Necessary Only"}
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2 text-sm font-medium text-white bg-[#009245] hover:bg-[#007a39] rounded-lg transition-colors whitespace-nowrap"
              >
                {t.cookies?.acceptAll || "Accept All"}
              </button>
            </div>
          </div>

          {/* Detailed Cookie Information */}
          {showDetails && (
            <div className="border-t border-gray-200 pt-4 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {/* Necessary Cookies */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {t.cookies?.necessary || "Necessary"}
                    </h4>
                    <span className="text-xs text-green-600 font-medium">
                      {t.cookies?.alwaysActive || "Always Active"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {t.cookies?.necessaryDesc ||
                      "Essential for the website to function properly. Cannot be disabled."}
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {t.cookies?.functional || "Functional"}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {t.cookies?.functionalDesc ||
                      "Remember your preferences like language selection."}
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {t.cookies?.analytics || "Analytics"}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {t.cookies?.analyticsDesc ||
                      "Help us understand how visitors interact with our website."}
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {t.cookies?.marketing || "Marketing"}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {t.cookies?.marketingDesc ||
                      "Used to track visitors across websites for marketing purposes."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
