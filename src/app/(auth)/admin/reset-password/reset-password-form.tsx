"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] =
    useState(false);

  async function updatePassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    if (password.length < 10) {
      setError(
        "Use a password containing at least 10 characters.",
      );
      return;
    }

    if (password !== confirmation) {
      setError("The two passwords do not match.");
      return;
    }

    setPending(true);

    const supabase = createClient();

    const { error: updateError } =
      await supabase.auth.updateUser({
        password,
      });

    if (updateError) {
      console.error(
        "Administrator password update failed:",
        updateError,
      );

      setPending(false);
      setError(
        "The reset link is invalid or expired. Request a new email and try again.",
      );

      return;
    }

    setCompleted(true);

    await supabase.auth.signOut();

    router.replace("/admin/login?reset=success");
    router.refresh();
  }

  return (
    <form
      onSubmit={updatePassword}
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

      {completed && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          Password updated. Redirecting to sign in…
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="new-password">
          New password
        </Label>

        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            autoComplete="new-password"
            placeholder="At least 10 characters"
            className="px-10"
            disabled={pending || completed}
            required
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((current) => !current)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">
          Confirm new password
        </Label>

        <Input
          id="confirm-password"
          type={showPassword ? "text" : "password"}
          value={confirmation}
          onChange={(event) =>
            setConfirmation(event.target.value)
          }
          autoComplete="new-password"
          placeholder="Repeat your new password"
          disabled={pending || completed}
          required
        />
      </div>

      <Button
        type="submit"
        className="h-11 w-full"
        disabled={pending || completed}
      >
        {pending
          ? "Updating password..."
          : "Save new password"}
      </Button>
    </form>
  );
}