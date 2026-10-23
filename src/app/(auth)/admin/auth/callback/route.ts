import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (
    value &&
    value.startsWith("/") &&
    !value.startsWith("//")
  ) {
    return value;
  }

  return "/admin/reset-password";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(
    requestUrl.searchParams.get("next"),
  );

  if (code) {
    const supabase = await createClient();

    const { error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(
        new URL(next, requestUrl.origin),
      );
    }

    console.error(
      "Password recovery code exchange failed:",
      error,
    );
  }

  const loginUrl = new URL(
    "/admin/login",
    requestUrl.origin,
  );

  loginUrl.searchParams.set(
    "recovery",
    "invalid",
  );

  return NextResponse.redirect(loginUrl);
}