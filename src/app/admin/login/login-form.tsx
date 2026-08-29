"use client";

import { useActionState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { useState } from "react";

import {
  login,
  type LoginActionState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    login,
    initialState,
  );

  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      {state.message && (
        <div
          className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{state.message}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>

        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="admin@ktluxurycars.com"
            className="pl-10"
            disabled={pending}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>

        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            className="px-10"
            disabled={pending}
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={
              showPassword ? "Hide password" : "Show password"
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

      <Button
        type="submit"
        className="h-11 w-full"
        disabled={pending}
      >
        {pending ? "Signing in..." : "Sign in securely"}

        {!pending && <ArrowRight className="ml-2 size-4" />}
      </Button>
    </form>
  );
}