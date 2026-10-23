import createMiddleware from "next-intl/middleware";
import {
  NextResponse,
  type NextRequest,
} from "next/server";

import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/proxy";

const internationalizationMiddleware =
  createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  /*
   * Admin pages do not use localized URLs.
   * Supabase refreshes the session and verifies that
   * the authenticated email is an approved administrator.
   */
  if (pathname.startsWith("/admin")) {
    return updateSession(request);
  }

  /*
   * API routes and technical SEO files must not receive
   * a /fr or /en prefix.
   */
  if (
    pathname.startsWith("/api") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  /*
   * Public website routes use next-intl.
   * "/" redirects to "/fr" because French is the
   * configured default language.
   */
  return internationalizationMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};