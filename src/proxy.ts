import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/proxy";

const handleInternationalization =
  createMiddleware(routing);

export async function proxy(
  request: NextRequest,
) {
  const pathname = request.nextUrl.pathname;

  const isAdminRoute =
    pathname.startsWith("/admin");

  const isApiRoute =
    pathname.startsWith("/api");

  if (isAdminRoute || isApiRoute) {
    return updateSession(request);
  }

  const internationalizedResponse =
    handleInternationalization(request);

  return updateSession(
    request,
    internationalizedResponse,
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};