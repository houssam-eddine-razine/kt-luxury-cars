"use client";

import { useEffect, useRef } from "react";

const recoveryRequestPath =
  "/admin/forgot-password?recovery=invalid";

export function PasswordRecoveryHandler() {
  const handled = useRef(false);

  useEffect(() => {
    function handleRecovery() {
      if (handled.current) {
        return;
      }

      const fragment = new URLSearchParams(
        window.location.hash.slice(1),
      );

      const recovery =
        fragment.get("type") === "recovery";

      const expired =
        fragment.get("error_code") === "otp_expired";

      if (!recovery && !expired) {
        return;
      }

      handled.current = true;

      const accessToken =
        fragment.get("access_token");

      const refreshToken =
        fragment.get("refresh_token");

      // Remove session credentials from the address bar.
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}`,
      );

      if (
        expired ||
        fragment.has("error") ||
        !accessToken ||
        !refreshToken
      ) {
        window.location.replace(recoveryRequestPath);
        return;
      }

      void (async () => {
        let destination = recoveryRequestPath;

        try {
          const { createClient } = await import(
            "@/lib/supabase/client"
          );

          const { data, error } =
            await createClient().auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

          if (!error && data.session) {
            destination = "/admin/reset-password";
          }
        } catch {
          // Invalid sessions return to the recovery request form.
        }

        // Authentication cookies are saved before opening the form.
        window.location.replace(destination);
      })();
    }

    window.addEventListener(
      "hashchange",
      handleRecovery,
    );

    handleRecovery();

    return () => {
      window.removeEventListener(
        "hashchange",
        handleRecovery,
      );
    };
  }, []);

  return null;
}