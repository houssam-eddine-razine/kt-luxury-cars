"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Send,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submitResetRequest(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPending(true);
    setError("");

    const supabase = createClient();

    const redirectTo =
      `${window.location.origin}/admin/auth/callback` +
      "?next=/admin/reset-password";

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo,
        },
      );

    setPending(false);

    if (resetError) {
      console.error(
        "Password recovery request failed:",
        resetError,
      );

      setError(
        "The reset email could not be sent. Please try again.",
      );

      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />

          <div>
            <p className="font-semibold">
              Check your email
            </p>

            <p className="mt-1 leading-6">
              If an administrator account exists for that
              address, Supabase has sent a secure password-reset
              link.
            </p>
          </div>
        </div>

        <Link
          href="/admin/login"
          className="flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={submitResetRequest}
      className="space-y-5"
    >
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="recovery-email">
          Administrator email
        </Label>

        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="recovery-email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="admin@ktluxurycars.com"
            autoComplete="email"
            className="pl-10"
            disabled={pending}
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        className="h-11 w-full"
        disabled={pending}
      >
        <Send className="mr-2 size-4" />
        {pending ? "Sending..." : "Send reset email"}
      </Button>

      <Link
        href="/admin/login"
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Return to sign in
      </Link>
    </form>
  );
}