"use client";

import {
  Menu,
  MessageCircle,
  X,
} from "lucide-react";
import {
  useLocale,
  useTranslations,
} from "next-intl";
import { useState } from "react";

import {
  Link,
  usePathname,
  useRouter,
} from "@/i18n/navigation";

export function SiteHeader() {
  const translations =
    useTranslations("Header");

  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const navigation = [
    {
      label: translations("vehicles"),
      href: "/vehicles",
    },
    {
      label: translations("services"),
      href: "/#services",
    },
    {
      label: translations("whyKt"),
      href: "/#why-kt",
    },
    {
      label: translations("contact"),
      href: "/#contact",
    },
  ];

  const whatsappUrl =
    `https://wa.me/212619019549?text=${encodeURIComponent(
      translations("whatsappMessage"),
    )}`;

  const nextLocale =
    locale === "en" ? "fr" : "en";

  function changeLanguage() {
    router.replace(pathname, {
      locale: nextLocale,
    });

    setOpen(false);
  }

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
    <header className="absolute inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0B1726]/90 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1480px] items-center justify-between px-5 sm:px-8 lg:h-24 lg:px-12">
        <Link
          href="/"
          aria-label={translations(
            "homepageLabel",
          )}
          className="flex items-center gap-3"
        >
          <span className="font-heading text-4xl font-semibold leading-none text-[#D3AF60]">
            KT
          </span>

          <span className="h-9 w-px bg-[#C8A45D]/40" />

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
                key={item.href}
                href={item.href}
                className={`relative py-3 text-sm font-medium transition after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:bg-[#C8A45D] after:transition-transform ${
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

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={changeLanguage}
            aria-label={`Switch to ${
              nextLocale === "fr"
                ? "French"
                : "English"
            }`}
            className="flex min-h-11 items-center gap-2 rounded-[10px] border border-white/15 bg-white/[0.06] px-4 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:border-[#C8A45D]/60 hover:bg-white/10"
          >
            <span
              className={
                locale === "en"
                  ? "text-[#D8B868]"
                  : "text-white/50"
              }
            >
              EN
            </span>

            <span className="text-white/25">
              /
            </span>

            <span
              className={
                locale === "fr"
                  ? "text-[#D8B868]"
                  : "text-white/50"
              }
            >
              FR
            </span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center gap-3 rounded-[12px] border border-[#C8A45D]/65 bg-[#0B1726]/75 px-6 text-xs font-bold text-white transition hover:bg-[#C8A45D] hover:text-[#0B1726]"
          >
            <MessageCircle className="size-4" />
            {translations("whatsapp")}
          </a>
        </div>

        <button
          type="button"
          aria-label={
            open
              ? translations("closeNavigation")
              : translations("openNavigation")
          }
          aria-expanded={open}
          onClick={() =>
            setOpen((value) => !value)
          }
          className="flex size-12 items-center justify-center rounded-[12px] border border-[#C8A45D]/45 text-[#DEC174] transition hover:bg-[#C8A45D] hover:text-[#0B1726] lg:hidden"
        >
          {open ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#0B1726] px-5 pb-6 pt-4 lg:hidden">
          <nav className="mx-auto flex max-w-[1480px] flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-[12px] px-4 py-4 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={changeLanguage}
              className="mt-3 flex min-h-13 items-center justify-between rounded-[12px] border border-white/10 bg-white/[0.05] px-4 text-sm font-bold text-white"
            >
              <span>
                {locale === "en"
                  ? "Language"
                  : "Langue"}
              </span>

              <span className="rounded-full bg-[#C8A45D] px-4 py-2 text-xs font-extrabold text-[#0B1726]">
                {locale === "en"
                  ? "FR"
                  : "EN"}
              </span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex min-h-14 items-center justify-center gap-3 rounded-[12px] bg-[#128C5A] px-6 text-sm font-bold text-white"
            >
              <MessageCircle className="size-5" />
              {translations("whatsappMobile")}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}