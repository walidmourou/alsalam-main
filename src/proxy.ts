import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales, type Locale } from "./i18n/config";

const isLocale = (value: string | undefined): value is Locale =>
  Boolean(value) && (locales as readonly string[]).includes(value);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Check if there is any supported locale in the cookies
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : null;

  // Check if there is any supported locale in the Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  const headerLocale = acceptLanguage?.split(",")[0]?.split("-")[0];

  // Determine which locale to use
  const selectedLocale =
    locale ||
    (isLocale(headerLocale) ? headerLocale : null) ||
    defaultLocale;

  // Redirect to locale-prefixed path
  request.nextUrl.pathname = `/${selectedLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, images, etc)
    "/((?!api|_next/static|_next/image|images|favicon.ico|manifest.json).*)",
  ],
};
