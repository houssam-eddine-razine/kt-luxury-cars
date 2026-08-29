"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CarFront,
  CircleDollarSign,
  Gauge,
  Globe,
  Settings,
  Users,
  Wrench,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/admin", icon: Gauge },
  { name: "Vehicles", href: "/admin/vehicles", icon: CarFront },
  {
    name: "Reservations",
    href: "/admin/reservations",
    icon: CalendarDays,
  },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Finances", href: "/admin/finances", icon: CircleDollarSign },
  { name: "Website", href: "/admin/website", icon: Globe },
  { name: "Maintenance", href: "/admin/maintenance", icon: Wrench },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-[#064a36] text-white lg:flex">
      <div className="flex h-24 flex-col items-center justify-center border-b border-white/10">
        <span className="font-serif text-4xl text-[#d4aa50]">KT</span>

        <span className="mt-1 text-xs tracking-[0.28em] text-[#e7c77e]">
          LUXURY CARS
        </span>

        <span className="mt-1 text-[8px] tracking-[0.35em] text-white/60">
          MARRAKECH
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
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
              <Icon className="size-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 text-center text-xs text-white/40">
        KT Luxury Cars
      </div>
    </aside>
  );
}