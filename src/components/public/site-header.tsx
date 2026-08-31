"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageCircle, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  {
    label: "Vehicles",
    href: "/vehicles",
  },
  {
    label: "Services",
    href: "/#services",
  },
  {
    label: "Why KT",
    href: "/#why-kt",
  },
  {
    label: "Contact",
    href: "/#contact",
  },
];

const whatsappUrl = `https://wa.me/212619019549?text=${encodeURIComponent(
  "Hello KT Luxury Cars, I would like to rent a car in Marrakech.",
)}`;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/vehicles") {
      return (
        pathname === "/vehicles" ||
        pathname.startsWith("/vehicles/")
      );
    }

    return false;
  }

  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-white/10 bg-[#041b16]/90 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1480px] items-center justify-between px-5 sm:px-8 lg:h-24 lg:px-12">
        <Link
          href="/"
          aria-label="KT Luxury Cars homepage"
          className="flex items-center gap-3"
        >
          <span className="font-heading text-4xl font-semibold leading-none text-[#d3af60]">
            KT
          </span>

          <span className="h-9 w-px bg-[#c8a45d]/40" />

          <span>
            <span className="block text-[11px] font-bold tracking-[0.2em] text-white">
              LUXURY CARS
            </span>

            <span className="mt-1 block text-[8px] tracking-[0.28em] text-white/50">
              MARRAKECH
            </span>
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 lg:flex"
        >
          {navigation.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative py-3 text-sm font-medium transition after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:bg-[#c8a45d] after:transition-transform ${
                  active
                    ? "text-white after:scale-x-100"
                    : "text-white/70 after:scale-x-0 hover:text-white hover:after:scale-x-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-white/45 xl:block">
            EN
          </span>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center gap-3 rounded-[12px] border border-[#c8a45d]/65 bg-[#073b30]/75 px-6 text-xs font-bold text-white transition hover:bg-[#c8a45d] hover:text-[#041b16]"
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
        </div>

        <button
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex size-12 items-center justify-center rounded-[12px] border border-[#c8a45d]/45 text-[#dec174] transition hover:bg-[#c8a45d] hover:text-[#041b16] lg:hidden"
        >
          {open ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#041b16] px-5 pb-6 pt-4 lg:hidden">
          <nav className="mx-auto flex max-w-[1480px] flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-[12px] px-4 py-4 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex min-h-14 items-center justify-center gap-3 rounded-[12px] bg-[#128c5a] px-6 text-sm font-bold text-white"
            >
              <MessageCircle className="size-5" />
              Contact on WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}