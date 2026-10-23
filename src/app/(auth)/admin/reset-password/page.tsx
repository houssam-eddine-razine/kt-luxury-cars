import {
  KeyRound,
  ShieldCheck,
} from "lucide-react";

import { ResetPasswordForm } from "./reset-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071c17] px-4 py-10 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,164,92,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.10),transparent_40%)]" />

      <Card className="relative z-10 w-full max-w-md border-white/10 shadow-2xl shadow-black/30">
        <CardHeader className="space-y-4 px-6 pt-7 sm:px-8">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <KeyRound className="size-6 text-primary" />
          </div>

          <div>
            <CardTitle className="text-2xl">
              Create a new password
            </CardTitle>

            <CardDescription className="mt-2 leading-6">
              Choose a strong, unique password for the KT Luxury
              Cars administrator account.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-7 sm:px-8">
          <ResetPasswordForm />

          <div className="mt-6 flex items-center justify-center gap-2 border-t pt-5 text-xs text-muted-foreground">
            <ShieldCheck className="size-4" />
            Secure administrator recovery
          </div>
        </CardContent>
      </Card>
    </main>
  );
}