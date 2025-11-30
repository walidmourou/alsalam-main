"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import type { Locale } from "@/i18n/config";
import { useState, useEffect } from "react";

interface HeaderProps {
  locale: Locale;
  dictionary: any;
}

export default function Header({ locale, dictionary }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/profile");
      setIsAuthenticated(response.ok);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAuthenticated(false);
      router.push(`/${locale}`);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActivePath = (path: string) => {
    if (path === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.startsWith(path);
  };

  const navLinks = [
    { href: `/${locale}`, label: dictionary.nav.home },
    { href: `/${locale}/prayers`, label: dictionary.nav.prayers },
    { href: `/${locale}/education`, label: dictionary.nav.education },
    { href: `/${locale}/articles`, label: dictionary.nav.articles },
    { href: `/${locale}/support`, label: dictionary.nav.support },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top Bar - Logo, Navigation, and Actions */}
        <div className="flex items-center justify-between py-3 md:py-4 gap-4 md:gap-6 lg:gap-8">
          {/* Logo and Title */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="relative w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden ring-2 ring-primary-green/10 group-hover:ring-primary-green/30 transition-all">
              <Image
                src="/images/logo.svg"
                alt="Islamic Center Logo"
                fill
                className="object-contain p-1 transition-transform group-hover:scale-110"
                priority
              />
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg md:text-xl font-bold bg-linear-to-r from-primary-green to-primary-purple bg-clip-text text-transparent leading-tight">
                {dictionary.header.title}
              </h1>
            </div>
          </Link>

          {/* Navigation - Desktop - Centered */}
          <nav className="hidden 2xl:flex flex-1 justify-center">
            <ul className="flex items-center gap-0.5 md:gap-1 lg:gap-2 bg-gray-50/80 rounded-full px-2 py-1.5 backdrop-blur-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative px-3 md:px-4 lg:px-5 py-2 text-sm font-medium rounded-full transition-all ${
                      isActivePath(link.href)
                        ? "bg-white text-primary-green shadow-sm"
                        : "text-gray-600 hover:text-primary-green hover:bg-white/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Side - Auth Actions, Language Switcher + Mobile Menu */}
          <div className="flex items-center gap-1 md:gap-2 lg:gap-3 shrink-0">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <div className="hidden 2xl:flex items-center gap-2">
                    <Link
                      href={`/${locale}/profile`}
                      className="px-2 md:px-3 lg:px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-green hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {dictionary.nav?.profile || "Profile"}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-2 md:px-3 lg:px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {dictionary.nav?.logout || "Logout"}
                    </button>
                  </div>
                ) : (
                  <Link
                    href={`/${locale}/signin`}
                    className="hidden md:block px-2 md:px-3 lg:px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-green hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {dictionary.nav.signIn}
                  </Link>
                )}
              </>
            )}
            <LanguageSwitcher />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="2xl:hidden p-1.5 md:p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Slide Down with Animation */}
        <div
          className={`2xl:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="border-t border-gray-100 py-3">
            <ul className="space-y-1">
              {navLinks.map((link, index) => (
                <li
                  key={link.href}
                  style={{
                    animation: mobileMenuOpen
                      ? `slideIn 0.3s ease-out ${index * 0.05}s both`
                      : "none",
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all ${
                      isActivePath(link.href)
                        ? "bg-gradient-to-r from-primary-green to-primary-green/90 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-50 hover:text-primary-green hover:pl-6"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActivePath(link.href) ? "bg-white" : "bg-gray-300"
                      }`}
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
              <li
                style={{
                  animation: mobileMenuOpen
                    ? `slideIn 0.3s ease-out ${navLinks.length * 0.05}s both`
                    : "none",
                }}
              >
                {!isLoading && (
                  <>
                    {isAuthenticated ? (
                      <>
                        <Link
                          href={`/${locale}/profile`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-primary-green hover:pl-6 rounded-lg transition-all"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                          {dictionary.nav?.profile || "Profile"}
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 hover:pl-6 rounded-lg transition-all w-full text-left"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                          {dictionary.nav?.logout || "Logout"}
                        </button>
                      </>
                    ) : (
                      <Link
                        href={`/${locale}/signin`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-primary-green hover:pl-6 rounded-lg transition-all"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        {dictionary.nav.signIn}
                      </Link>
                    )}
                  </>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </header>
  );
}
