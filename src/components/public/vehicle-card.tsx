import Link from "next/link";
import {
  ArrowUpRight,
  Car,
  Fuel,
  Settings2,
  Users,
} from "lucide-react";

type PublicVehicleCardProps = {
  vehicle: {
    slug: string;
    brand: string;
    model: string;
    trim: string | null;
    year: number;
    category: string;
    status: string;
    transmission: string;
    fuelType: string;
    seats: number;
    dailyPrice: number;
    imageUrl?: string;
  };
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 0,
  }).format(price);

const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );

export function PublicVehicleCard({
  vehicle,
}: PublicVehicleCardProps) {
  const vehicleName = `${vehicle.brand} ${vehicle.model}`;

  return (
    <article className="group overflow-hidden border border-[#d6ad58]/25 bg-[#092c25] transition duration-500 hover:border-[#d6ad58]/65 hover:shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <Link
        href={`/cars/${vehicle.slug}`}
        className="block"
        aria-label={`View ${vehicleName}`}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-[#061d19]">
          {vehicle.imageUrl ? (
            <div
              role="img"
              aria-label={`${vehicleName} cover image`}
              className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url(${JSON.stringify(
                  vehicle.imageUrl,
                )})`,
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,#16483b,#061d19_70%)]">
              <Car className="size-14 text-[#d6ad58]/35" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#041713] via-transparent to-black/15" />

          <span className="absolute top-4 left-4 border border-[#d6ad58]/45 bg-[#071f1a]/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e0bd70] backdrop-blur">
            {formatLabel(vehicle.category)}
          </span>

          <span
            className={`absolute right-4 bottom-4 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${
              vehicle.status === "AVAILABLE"
                ? "bg-[#d6ad58] text-[#092c25]"
                : "bg-black/75 text-white"
            }`}
          >
            {formatLabel(vehicle.status)}
          </span>
        </div>

        <div className="p-5 text-white sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d6ad58]">
                {vehicle.year}
              </p>

              <h3 className="font-heading mt-2 truncate text-3xl font-semibold">
                {vehicleName}
              </h3>

              <p className="mt-1 truncate text-sm text-white/45">
                {vehicle.trim ||
                  `${formatLabel(vehicle.category)} collection`}
              </p>
            </div>

            <span className="flex size-10 shrink-0 items-center justify-center border border-white/15 text-white/70 transition group-hover:border-[#d6ad58] group-hover:bg-[#d6ad58] group-hover:text-[#092c25]">
              <ArrowUpRight className="size-4" />
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 border-y border-white/10 py-4 text-xs text-white/65">
            <span className="flex items-center gap-2">
              <Settings2 className="size-4 text-[#d6ad58]" />
              {formatLabel(vehicle.transmission)}
            </span>

            <span className="flex items-center gap-2">
              <Fuel className="size-4 text-[#d6ad58]" />
              {formatLabel(vehicle.fuelType)}
            </span>

            <span className="flex items-center gap-2">
              <Users className="size-4 text-[#d6ad58]" />
              {vehicle.seats} seats
            </span>
          </div>

          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/35">
                From
              </p>

              <p className="mt-1 text-xl font-semibold text-[#e0bd70]">
                {formatPrice(vehicle.dailyPrice)} MAD
                <span className="ml-1 text-xs font-normal text-white/35">
                  / day
                </span>
              </p>
            </div>

            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
              View details
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}