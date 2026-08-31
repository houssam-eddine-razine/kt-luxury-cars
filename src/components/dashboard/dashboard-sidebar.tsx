"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
  CalendarDays,
  CarFront,
  CircleDollarSign,
  Gauge,
  Globe,
  LogOut,
  Settings,
  Users,
  Wrench,
} from "lucide-react";

import { logout } from "@/app/admin/auth-actions";

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

function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <LogOut className="size-5" />
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#064a36] text-white shadow-xl lg:flex">
      <div className="flex h-24 shrink-0 flex-col items-center justify-center border-b border-white/10">
        <span className="font-serif text-4xl text-[#d4aa50]">
          KT
        </span>

        <span className="mt-1 text-xs tracking-[0.28em] text-[#e7c77e]">
          LUXURY CARS
        </span>

        <span className="mt-1 text-[8px] tracking-[0.35em] text-white/60">
          MARRAKECH
        </span>
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
              className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm transition ${
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
        <div className="mb-2 flex items-center gap-3 rounded-lg bg-white/5 p-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#d4aa50] font-semibold text-[#064a36]">
            H
          </div>

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
          <LogoutButton />
        </form>
      </div>
    </aside>
  );
}