"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Bell,
  CalendarDays,
  CarFront,
  CircleDollarSign,
  Gauge,
  Globe,
  LogOut,
  Menu,
  Search,
  Settings,
  Users,
  Wrench,
  X,
} from "lucide-react";

import { logout } from "@/app/admin/auth-actions";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navigation = [
  { name: "Overview", href: "/admin", icon: Gauge },
  { name: "Vehicles", href: "/admin/vehicles", icon: CarFront },
  {
    name: "Reservations",
    href: "/admin/reservations",
    icon: CalendarDays,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    name: "Finances",
    href: "/admin/finances",
    icon: CircleDollarSign,
  },
  {
    name: "Website",
    href: "/admin/website",
    icon: Globe,
  },
  {
    name: "Maintenance",
    href: "/admin/maintenance",
    icon: Wrench,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

function MobileLogoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10 disabled:opacity-50"
    >
      <LogOut className="size-4" />
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}

export function DashboardTopbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </Button>

          <div className="flex items-center gap-2 lg:hidden">
            <span className="font-serif text-2xl text-[#b68b33]">
              KT
            </span>

            <span className="hidden text-xs font-medium tracking-widest text-[#064a36] sm:block">
              LUXURY CARS
            </span>
          </div>

          <div className="relative hidden w-full max-w-md lg:block">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />

            <Input
              className="w-96 pl-10"
              placeholder="Search vehicles, reservations, customers..."
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
          </Button>

          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-[#064a36] text-white">
                H
              </AvatarFallback>
            </Avatar>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold">Houssam</p>

              <p className="text-xs text-neutral-500">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          />

          <aside className="relative flex h-full w-[85%] max-w-xs flex-col bg-[#064a36] text-white shadow-2xl">
            <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-5">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl text-[#d4aa50]">
                    KT
                  </span>

                  <span className="text-xs tracking-[0.2em] text-[#e7c77e]">
                    LUXURY CARS
                  </span>
                </div>

                <p className="mt-1 text-[9px] tracking-[0.3em] text-white/50">
                  MARRAKECH
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex size-10 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Close navigation menu"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {navigation.map((item) => {
                const Icon = item.icon;

                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                      active
                        ? "bg-white/15 text-[#f0c96f]"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="size-5 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="shrink-0 border-t border-white/10 p-4">
              <div className="mb-4 flex items-center gap-3 px-1">
                <Avatar>
                  <AvatarFallback className="bg-[#d4aa50] font-semibold text-[#064a36]">
                    H
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    Houssam
                  </p>

                  <p className="truncate text-xs text-white/50">
                    Administrator
                  </p>
                </div>
              </div>

              <form action={logout}>
                <MobileLogoutButton />
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}