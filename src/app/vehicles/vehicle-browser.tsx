"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CarFront,
  Fuel,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

type PublicVehicle = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  trim: string | null;
  year: number;
  category: string;
  transmission: string;
  fuelType: string;
  seats: number;
  doors: number;
  dailyPrice: number;
  featured: boolean;
  coverImage: {
    url: string;
    altText: string | null;
  } | null;
};

type VehicleBrowserProps = {
  vehicles: PublicVehicle[];
};

type FilterValue =
  | "ALL"
  | "CITY"
  | "SUV"
  | "PREMIUM"
  | "LUXURY";

const filters: Array<{
  label: string;
  value: FilterValue;
}> = [
  {
    label: "All vehicles",
    value: "ALL",
  },
  {
    label: "City",
    value: "CITY",
  },
  {
    label: "SUV",
    value: "SUV",
  },
  {
    label: "Premium",
    value: "PREMIUM",
  },
  {
    label: "Luxury",
    value: "LUXURY",
  },
];

const categoryLabels: Record<string, string> = {
  ECONOMY: "City",
  COMPACT: "City",
  SUV: "SUV",
  PREMIUM: "Premium",
  LUXURY: "Luxury",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function matchesCategory(
  category: string,
  filter: FilterValue,
) {
  if (filter === "ALL") {
    return true;
  }

  if (filter === "CITY") {
    return category === "ECONOMY" || category === "COMPACT";
  }

  return category === filter;
}

export function VehicleBrowser({
  vehicles,
}: VehicleBrowserProps) {
  const [activeFilter, setActiveFilter] =
    useState<FilterValue>("ALL");
  const [search, setSearch] = useState("");

  const filteredVehicles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const categoryMatches = matchesCategory(
        vehicle.category,
        activeFilter,
      );

      const vehicleName = [
        vehicle.brand,
        vehicle.model,
        vehicle.trim,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const searchMatches =
        normalizedSearch === "" ||
        vehicleName.includes(normalizedSearch);

      return categoryMatches && searchMatches;
    });
  }, [activeFilter, search, vehicles]);

  return (
    <section className="px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="rounded-[22px] border border-[#d9cebd] bg-white p-4 shadow-[0_18px_50px_rgba(24,48,41,0.08)] sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {filters.map((filter) => {
                const active = filter.value === activeFilter;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveFilter(filter.value)}
                    className={`min-h-12 shrink-0 rounded-full px-5 text-sm font-bold transition ${
                      active
                        ? "bg-[#0B1726] text-white shadow"
                        : "border border-[#ded3c2] bg-[#fbf8f2] text-[#53675f] hover:border-[#a47d2f] hover:text-[#0B1726]"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <label className="relative block w-full lg:max-w-sm">
              <span className="sr-only">Search vehicles</span>

              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#8b9892]" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search brand or model"
                className="min-h-14 w-full rounded-[14px] border border-[#d9cebd] bg-[#fbf8f2] pl-12 pr-4 text-sm font-medium text-[#0B1726] outline-none transition placeholder:text-[#8b9892] focus:border-[#a47d2f] focus:ring-4 focus:ring-[#c8a45d]/10"
              />
            </label>
          </div>
        </div>

        <div className="mt-9 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a762f]">
              Available now
            </p>

            <h2 className="mt-2 font-heading text-3xl font-semibold text-[#0B1726] sm:text-4xl">
              {filteredVehicles.length} vehicle
              {filteredVehicles.length === 1 ? "" : "s"}
            </h2>
          </div>

          {(activeFilter !== "ALL" || search !== "") && (
            <button
              type="button"
              onClick={() => {
                setActiveFilter("ALL");
                setSearch("");
              }}
              className="min-h-11 text-sm font-bold text-[#8d6b2b] underline decoration-[#c8a45d] underline-offset-4"
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="mt-8 rounded-[24px] border border-[#d9cebd] bg-white px-6 py-16 text-center shadow-sm">
            <CarFront className="mx-auto size-10 text-[#a47d2f]" />

            <h3 className="mt-5 font-heading text-3xl font-semibold text-[#0B1726]">
              No matching vehicles
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#74808A]">
              Try another category or search. You can also contact our
              team for the latest availability.
            </p>

            <button
              type="button"
              onClick={() => {
                setActiveFilter("ALL");
                setSearch("");
              }}
              className="mt-6 min-h-12 rounded-[12px] bg-[#0B1726] px-6 text-sm font-bold text-white"
            >
              View all vehicles
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <article
                key={vehicle.id}
                className="group flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-[#d9cebd] bg-white shadow-[0_18px_45px_rgba(24,48,41,0.09)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_65px_rgba(24,48,41,0.15)]"
              >
                <Link
                  href={`/vehicles/${vehicle.slug}`}
                  aria-label={`View ${vehicle.brand} ${vehicle.model}`}
                  className="relative block aspect-[4/3] overflow-hidden bg-[#e3d9ca]"
                >
                  {vehicle.coverImage ? (
                    <img
                      src={vehicle.coverImage.url}
                      alt={
                        vehicle.coverImage.altText ??
                        `${vehicle.brand} ${vehicle.model}`
                      }
                      className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <CarFront className="size-12 text-[#a47d2f]" />
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />

                  <span className="absolute left-4 top-4 rounded-full bg-[#fbf7ef]/95 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0B1726] shadow">
                    {categoryLabels[vehicle.category] ??
                      formatEnum(vehicle.category)}
                  </span>

                  {vehicle.featured && (
                    <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[#0B1726]/90 px-3 py-2 text-[10px] font-bold text-white backdrop-blur">
                      <Sparkles className="size-3 text-[#d8b868]" />
                      Featured
                    </span>
                  )}
                </Link>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a762f]">
                        {vehicle.year} Â·{" "}
                        {formatEnum(vehicle.transmission)}
                      </p>

                      <h3 className="mt-2 truncate font-heading text-3xl font-semibold capitalize text-[#0B1726]">
                        {vehicle.brand} {vehicle.model}
                      </h3>

                      {vehicle.trim && (
                        <p className="mt-1 truncate text-sm text-[#74808A]">
                          {vehicle.trim}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#7d8b85]">
                        From
                      </p>

                      <p className="mt-1 font-heading text-2xl font-semibold text-[#a47d2f]">
                        {formatPrice(vehicle.dailyPrice)}
                      </p>

                      <p className="text-[10px] text-[#74808A]">
                        MAD / day
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 divide-x divide-[#e5dccf] rounded-[14px] bg-[#f7f1e8] px-2 py-4 text-center">
                    <div>
                      <Users className="mx-auto size-4 text-[#8d6b2b]" />
                      <p className="mt-1 text-xs font-bold text-[#0B1726]">
                        {vehicle.seats}
                      </p>
                      <p className="text-[10px] text-[#73817b]">
                        Seats
                      </p>
                    </div>

                    <div>
                      <Fuel className="mx-auto size-4 text-[#8d6b2b]" />
                      <p className="mt-1 truncate px-1 text-xs font-bold text-[#0B1726]">
                        {formatEnum(vehicle.fuelType)}
                      </p>
                      <p className="text-[10px] text-[#73817b]">
                        Fuel
                      </p>
                    </div>

                    <div>
                      <CarFront className="mx-auto size-4 text-[#8d6b2b]" />
                      <p className="mt-1 text-xs font-bold text-[#0B1726]">
                        {vehicle.doors}
                      </p>
                      <p className="text-[10px] text-[#73817b]">
                        Doors
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/vehicles/${vehicle.slug}`}
                    className="group/link mt-5 flex min-h-14 items-center justify-between rounded-[14px] bg-[#0B1726] px-5 text-sm font-bold text-white transition hover:bg-[#162536]"
                  >
                    View vehicle

                    <span className="flex size-9 items-center justify-center rounded-full bg-[#d3ad5b] text-[#0B1726]">
                      <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-1" />
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
