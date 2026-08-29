import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function copyCookies(
  source: NextResponse,
  destination: NextResponse,
) {
  source.cookies.getAll().forEach((cookie) => {
    destination.cookies.set(cookie);
  });

  return destination;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getClaims();

  const claims = error ? null : data?.claims;
  const pathname = request.nextUrl.pathname;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  if (isAdminRoute && !isLoginPage && !claims) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );

    return copyCookies(
      response,
      NextResponse.redirect(loginUrl),
    );
  }

  if (isLoginPage && claims) {
    const adminUrl = request.nextUrl.clone();

    adminUrl.pathname = "/admin";
    adminUrl.search = "";

    return copyCookies(
      response,
      NextResponse.redirect(adminUrl),
    );
  }

  return response;
}