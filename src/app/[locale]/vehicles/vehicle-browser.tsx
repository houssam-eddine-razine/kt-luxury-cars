"use client";

/* eslint-disable @next/next/no-img-element */

import {
  ArrowRight,
  CarFront,
  Fuel,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Link } from "@/i18n/navigation";

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

function formatPrice(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
  }).format(value);
}

function matchesCategory(
  category: string,
  filter: FilterValue,
) {
  if (filter === "ALL") {
    return true;
  }

  if (filter === "CITY") {
    return (
      category === "ECONOMY" ||
      category === "COMPACT"
    );
  }

  return category === filter;
}

export function VehicleBrowser({
  vehicles,
}: VehicleBrowserProps) {
  const translations = useTranslations("Fleet");

  const [activeFilter, setActiveFilter] =
    useState<FilterValue>("ALL");

  const [search, setSearch] = useState("");

  const filters: Array<{
    label: string;
    value: FilterValue;
  }> = [
    {
      label: translations("allVehicles"),
      value: "ALL",
    },
    {
      label: translations("city"),
      value: "CITY",
    },
    {
      label: translations("suv"),
      value: "SUV",
    },
    {
      label: translations("premium"),
      value: "PREMIUM",
    },
    {
      label: translations("luxury"),
      value: "LUXURY",
    },
  ];

  const categoryLabels: Record<string, string> = {
    ECONOMY: translations("city"),
       COMPACT: translations("city"),
    SUV: translations("suv"),
    PREMIUM: translations("premium"),
    LUXURY: translations("luxury"),
  };

  const transmissionLabels: Record<string, string> = {
    AUTOMATIC: translations("automatic"),
    MANUAL: translations("manual"),
  };

  const fuelLabels: Record<string, string> = {
    PETROL: translations("petrol"),
    DIESEL: translations("diesel"),
    HYBRID: translations("hybrid"),
    ELECTRIC: translations("electric"),
  };

  const filteredVehicles = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const categoryMatches =
        matchesCategory(
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

  function resetFilters() {
    setActiveFilter("ALL");
    setSearch("");
  }

  return (
    <section className="px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="rounded-[20px] border border-[#D8CDBB] bg-[#FFFCF7] p-3 shadow-[0_16px_45px_rgba(11,23,38,0.08)] sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {filters.map((filter) => {
                const active =
                  filter.value === activeFilter;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() =>
                      setActiveFilter(filter.value)
                    }
                    className={`min-h-12 shrink-0 rounded-full px-5 text-sm font-bold transition ${
                      active
                        ? "bg-[#0B1726] text-white shadow"
                        : "border border-[#DED3C2] bg-[#FFFCF7] text-[#4F5E6B] hover:border-[#A47D2F] hover:text-[#0B1726]"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <label className="relative block w-full lg:max-w-sm">
              <span className="sr-only">
                {translations("searchLabel")}
              </span>

              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#7A8691]" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder={translations(
                  "searchPlaceholder",
                )}
                className="min-h-14 w-full rounded-[14px] border border-[#D8CDBB] bg-white pl-12 pr-4 text-sm font-medium text-[#0B1726] outline-none transition placeholder:text-[#7A8691] focus:border-[#A47D2F] focus:ring-4 focus:ring-[#C8A45D]/10"
              />
            </label>
          </div>
        </div>

        <div className="mt-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#9A762F] sm:text-base sm:tracking-[0.2em]">
              {translations("availableNow")}
            </p>

            <h2 className="mt-2 font-heading text-3xl font-semibold text-[#0B1726] sm:text-4xl">
              {translations("vehicleCount", {
                count: filteredVehicles.length,
              })}
            </h2>
          </div>

          {(activeFilter !== "ALL" ||
            search !== "") && (
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-11 text-sm font-bold text-[#8D6B2B] underline decoration-[#C8A45D] underline-offset-4"
            >
              {translations("clearFilters")}
            </button>
          )}
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="mt-8 rounded-[24px] border border-[#D8CDBB] bg-[#FFFCF7] px-6 py-14 text-center shadow-sm">
            <CarFront className="mx-auto size-10 text-[#A47D2F]" />

            <h3 className="mt-5 font-heading text-3xl font-semibold text-[#0B1726]">
              {translations(
                "noMatchingVehicles",
              )}
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#66727D]">
              {translations(
                "noMatchingDescription",
              )}
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 min-h-12 rounded-[12px] bg-[#0B1726] px-6 text-sm font-bold text-white"
            >
              {translations("viewAllVehicles")}
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <article
                key={vehicle.id}
                className="group flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-[#D8CDBB] bg-[#FFFCF7] shadow-[0_18px_45px_rgba(11,23,38,0.09)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(11,23,38,0.15)]"
              >
                <Link
                  href={`/vehicles/${vehicle.slug}`}
                  aria-label={`${translations(
                    "viewVehicle",
                  )}: ${vehicle.brand} ${vehicle.model}`}
                  className="relative block aspect-[16/10] overflow-hidden bg-[#E4DDD2]"
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
                      <CarFront className="size-12 text-[#A47D2F]" />
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#07111E]/60 to-transparent" />

                  <span className="absolute left-4 top-4 rounded-full bg-[#FFFCF7]/95 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0B1726] shadow">
                    {categoryLabels[
                      vehicle.category
                    ] ?? vehicle.category}
                  </span>

                  {vehicle.featured && (
                    <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[#0B1726]/90 px-3 py-2 text-[10px] font-bold text-white backdrop-blur">
                      <Sparkles className="size-3 text-[#D8B868]" />
                      {translations("featured")}
                    </span>
                  )}
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#9A762F]">
                        {vehicle.year} ·{" "}
                        {transmissionLabels[
                          vehicle.transmission
                        ] ??
                          vehicle.transmission}
                      </p>

                      <h3 className="mt-1.5 truncate font-heading text-[28px] font-semibold capitalize text-[#0B1726]">
                        {vehicle.brand} {vehicle.model}
                      </h3>

                      {vehicle.trim && (
                        <p className="mt-1 truncate text-xs text-[#74808A]">
                          {vehicle.trim}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#7A8691]">
                        {translations("from")}
                      </p>

                      <p className="mt-1 font-heading text-2xl font-semibold leading-none text-[#A47D2F]">
                        {formatPrice(
                          vehicle.dailyPrice,
                        )}
                      </p>

                      <p className="mt-1 text-[10px] text-[#74808A]">
                        {translations("perDay")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 divide-x divide-[#DDD1BE] rounded-[11px] bg-[#F1ECE4] px-1 py-3 text-center">
                    <div className="min-w-0 px-1">
                      <Users className="mx-auto size-4 text-[#8D6B2B]" />

                      <p className="mt-1 text-xs font-bold text-[#0B1726]">
                        {vehicle.seats}
                      </p>

                      <p className="text-[9px] text-[#74808A]">
                        {translations("seats")}
                      </p>
                    </div>

                    <div className="min-w-0 px-1">
                      <Fuel className="mx-auto size-4 text-[#8D6B2B]" />

                      <p className="mt-1 truncate text-xs font-bold text-[#0B1726]">
                        {fuelLabels[
                          vehicle.fuelType
                        ] ?? vehicle.fuelType}
                      </p>

                      <p className="text-[9px] text-[#74808A]">
                        {translations("fuel")}
                      </p>
                    </div>

                    <div className="min-w-0 px-1">
                      <CarFront className="mx-auto size-4 text-[#8D6B2B]" />

                      <p className="mt-1 text-xs font-bold text-[#0B1726]">
                        {vehicle.doors}
                      </p>

                      <p className="text-[9px] text-[#74808A]">
                        {translations("doors")}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/vehicles/${vehicle.slug}`}
                    className="group/link mt-4 flex min-h-12 items-center justify-between rounded-[10px] bg-[#0B1726] px-4 text-xs font-bold text-white transition hover:bg-[#162536]"
                  >
                    {translations("viewVehicle")}

                    <span className="flex size-8 items-center justify-center rounded-full bg-[#C8A45D] text-[#0B1726]">
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