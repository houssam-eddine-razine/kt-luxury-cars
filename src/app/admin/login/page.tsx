import { CarFront, ShieldCheck } from "lucide-react";

import { LoginForm } from "./login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071c17] px-4 py-10 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,164,92,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.10),transparent_40%)]" />

      <div className="absolute top-8 left-8 hidden items-center gap-3 text-white lg:flex">
        <div className="flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur">
          <CarFront className="size-5 text-[#d6b66e]" />
        </div>

        <div>
          <p className="font-semibold tracking-wide">
            KT Luxury Cars
          </p>

          <p className="text-xs text-white/55">
            Marrakech
          </p>
        </div>
      </div>

      <div className="relative z-10 grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden text-white lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/75 backdrop-blur">
            <ShieldCheck className="size-4 text-[#d6b66e]" />
            Protected management portal
          </div>

          <h1 className="mt-7 max-w-xl text-5xl font-semibold leading-tight tracking-tight">
            Manage your luxury fleet with confidence.
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-8 text-white/65">
            Control vehicles, availability, pricing and website
            presentation from one secure dashboard.
          </p>
        </section>

        <Card className="w-full border-white/10 shadow-2xl shadow-black/30">
          <CardHeader className="space-y-4 px-6 pt-7 sm:px-8">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 lg:hidden">
              <CarFront className="size-6 text-primary" />
            </div>

            <div>
              <CardTitle className="text-2xl">
                Administrator sign in
              </CardTitle>

              <CardDescription className="mt-2">
                Enter your private administrator credentials to
                access the KT Luxury Cars dashboard.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-7 sm:px-8">
            <LoginForm />

            <div className="mt-6 flex items-center justify-center gap-2 border-t pt-5 text-xs text-muted-foreground">
              <ShieldCheck className="size-4" />
              Secure authentication powered by Supabase
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}