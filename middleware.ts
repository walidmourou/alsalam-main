import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./src/i18n/config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) return;

  // Check if there is any supported locale in the cookies
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const locale = locales.includes(cookieLocale as any) ? cookieLocale : null;

  // Check if there is any supported locale in the Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  const headerLocale = acceptLanguage?.split(",")[0]?.split("-")[0];

  // Determine which locale to use
  const selectedLocale =
    locale ||
    (locales.includes(headerLocale as any) ? headerLocale : null) ||
    defaultLocale;

  // Redirect to locale-prefixed path
  request.nextUrl.pathname = `/${selectedLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (public files)
     * - /images (static images)
     * - /api (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|api|manifest.json).*)",
  ],
};
