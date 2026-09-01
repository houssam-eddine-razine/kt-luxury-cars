import {
  ArrowUpRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const translations =
    await getTranslations("Footer");

  const whatsappUrl =
    `https://wa.me/212619019549?text=${encodeURIComponent(
      translations("whatsappMessage"),
    )}`;

  return (
    <footer
      id="contact"
      className="overflow-hidden bg-[#0B1726] px-5 pb-8 pt-16 text-white sm:px-8 lg:px-12 lg:pt-20"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-heading text-5xl font-semibold leading-none text-[#D3AF60]">
                KT
              </span>

              <span className="h-10 w-px bg-[#C8A45D]/35" />

              <span>
                <span className="block text-xs font-bold tracking-[0.22em]">
                  LUXURY CARS
                </span>

                <span className="mt-1 block text-[9px] tracking-[0.3em] text-white/45">
                  MARRAKECH
                </span>
              </span>
            </div>

            <p className="mt-6 max-w-sm text-sm leading-7 text-white/55">
              {translations("description")}
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex min-h-13 items-center gap-3 rounded-[10px] bg-[#128C5A] px-6 text-sm font-bold text-white transition hover:bg-[#0F774C]"
            >
              <MessageCircle className="size-5" />
              {translations(
                "whatsappConcierge",
              )}
            </a>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#D3AF60]">
              {translations("explore")}
            </h3>

            <nav className="mt-6 flex flex-col gap-4 text-sm text-white/60">
              <Link
                href="/vehicles"
                className="transition hover:text-white"
              >
                {translations("vehicles")}
              </Link>

              <Link
                href="/#services"
                className="transition hover:text-white"
              >
                {translations("services")}
              </Link>

              <Link
                href="/#why-kt"
                className="transition hover:text-white"
              >
                {translations("whyKt")}
              </Link>

              <Link
                href="/#contact"
                className="transition hover:text-white"
              >
                {translations("contact")}
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#D3AF60]">
              {translations("contact")}
            </h3>

            <div className="mt-6 space-y-5 text-sm text-white/60">
              <a
                href="tel:+212619019549"
                className="flex items-start gap-3 transition hover:text-white"
              >
                <Phone className="mt-0.5 size-4 shrink-0 text-[#D3AF60]" />

                <span>
                  <span className="block text-xs text-white/35">
                    {translations("telephone")}
                  </span>

                  <span className="mt-1 block">
                    +212 619 019 549
                  </span>
                </span>
              </a>

              <a
                href="mailto:kettaoui.cars26@gmail.com"
                className="flex items-start gap-3 transition hover:text-white"
              >
                <Mail className="mt-0.5 size-4 shrink-0 text-[#D3AF60]" />

                <span>
                  <span className="block text-xs text-white/35">
                    {translations("email")}
                  </span>

                  <span className="mt-1 block break-all">
                    kettaoui.cars26@gmail.com
                  </span>
                </span>
              </a>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#D3AF60]" />

                <span>
                  <span className="block text-xs text-white/35">
                    {translations("location")}
                  </span>

                  <span className="mt-1 block">
                    {translations(
                      "marrakechMorocco",
                    )}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#D3AF60]">
              {translations(
                "reservationAssistance",
              )}
            </h3>

            <p className="mt-6 text-sm leading-7 text-white/55">
              {translations(
                "reservationDescription",
              )}
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex min-h-13 w-full items-center justify-between rounded-[10px] border border-[#C8A45D]/45 px-5 text-sm font-bold text-white transition hover:bg-[#C8A45D] hover:text-[#0B1726]"
            >
              {translations("startRequest")}
              <ArrowUpRight className="size-5" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-7 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>{translations("rights")}</p>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span>
              {translations("locationShort")}
            </span>

            <span>
              {translations("privateRental")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}