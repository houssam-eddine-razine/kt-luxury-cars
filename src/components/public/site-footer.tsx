import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

const whatsappUrl =
  `https://wa.me/212619019549?text=${encodeURIComponent(
    "Hello KT Luxury Cars, I would like to rent a vehicle in Marrakech.",
  )}`;

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="overflow-hidden bg-[#0B1726] px-5 pb-8 pt-16 text-white sm:px-8 lg:px-12 lg:pt-20"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-heading text-5xl font-semibold leading-none text-[#d3af60]">
                KT
              </span>

              <span className="h-10 w-px bg-[#c8a45d]/35" />

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
              Private vehicles, personal delivery and local
              assistance for your journey through Marrakech and
              beyond.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex min-h-13 items-center gap-3 rounded-[10px] bg-[#128c5a] px-6 text-sm font-bold text-white transition hover:bg-[#0f774c]"
            >
              <MessageCircle className="size-5" />
              WhatsApp concierge
            </a>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#d3af60]">
              Explore
            </h3>

            <nav className="mt-6 flex flex-col gap-4 text-sm text-white/60">
              <Link
                href="/#collection"
                className="transition hover:text-white"
              >
                Available vehicles
              </Link>

              <Link
                href="/#services"
                className="transition hover:text-white"
              >
                Our services
              </Link>

              <Link
                href="/#why-kt"
                className="transition hover:text-white"
              >
                Why KT
              </Link>

              <Link
                href="/#contact"
                className="transition hover:text-white"
              >
                Contact
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#d3af60]">
              Contact
            </h3>

            <div className="mt-6 space-y-5 text-sm text-white/60">
              <a
                href="tel:+212619019549"
                className="flex items-start gap-3 transition hover:text-white"
              >
                <Phone className="mt-0.5 size-4 shrink-0 text-[#d3af60]" />

                <span>
                  <span className="block text-xs text-white/35">
                    Telephone
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
                <Mail className="mt-0.5 size-4 shrink-0 text-[#d3af60]" />

                <span>
                  <span className="block text-xs text-white/35">
                    Email
                  </span>
                  <span className="mt-1 block break-all">
                    kettaoui.cars26@gmail.com
                  </span>
                </span>
              </a>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#d3af60]" />

                <span>
                  <span className="block text-xs text-white/35">
                    Location
                  </span>
                  <span className="mt-1 block">
                    Marrakech, Morocco
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#d3af60]">
              Reservation assistance
            </h3>

            <p className="mt-6 text-sm leading-7 text-white/55">
              Send us your dates, vehicle category and delivery
              location. We will reply with availability and exact
              rental conditions.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex min-h-13 w-full items-center justify-between rounded-[10px] border border-[#c8a45d]/45 px-5 text-sm font-bold text-white transition hover:bg-[#c8a45d] hover:text-[#0B1726]"
            >
              Start your request
              <ArrowUpRight className="size-5" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-7 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>Â© 2026 KT Luxury Cars. All rights reserved.</p>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span>Marrakech Â· Morocco</span>
            <span>Private car rental</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
