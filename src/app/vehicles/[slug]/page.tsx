/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CarFront,
  Check,
  DoorOpen,
  Fuel,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";

import { ReservationPanel } from "./reservation-panel";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { prisma } from "@/lib/prisma";

type VehiclePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const categoryLabels: Record<string, string> = {
  ECONOMY: "City",
  COMPACT: "City",
  SUV: "SUV",
  PREMIUM: "Premium",
  LUXURY: "Luxury",
};

const fuelPolicyLabels: Record<string, string> = {
  FULL_TO_FULL: "Full to full",
  SAME_TO_SAME: "Return with the same fuel level",
  PREPURCHASE: "Pre-purchased fuel",
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

async function getVehicle(slug: string) {
  return prisma.vehicle.findFirst({
    where: {
      slug,
      visible: true,
    },
    include: {
      images: {
        orderBy: {
          position: "asc",
        },
      },
      rentalPolicy: true,
    },
  });
}

export async function generateMetadata({
  params,
}: VehiclePageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);

  if (!vehicle) {
    return {
      title: "Vehicle not found | KT Luxury Cars",
    };
  }

  const vehicleName = [vehicle.brand, vehicle.model, vehicle.trim]
    .filter(Boolean)
    .join(" ");

  return {
    title: `${vehicleName} Rental Marrakech | KT Luxury Cars`,
    description:
      vehicle.descriptionEn ??
      `Rent the ${vehicleName} in Marrakech with private delivery and direct local assistance.`,
  };
}

export default async function VehiclePage({
  params,
}: VehiclePageProps) {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);

  if (!vehicle) {
    notFound();
  }

  const defaultPolicy = vehicle.rentalPolicy
    ? null
    : await prisma.rentalPolicy.findFirst({
        where: {
          isDefault: true,
          active: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

  const policy = vehicle.rentalPolicy ?? defaultPolicy;

  const coverImage =
    vehicle.images.find((image) => image.isCover) ?? vehicle.images[0];

  const galleryImages = vehicle.images.filter(
    (image) => image.id !== coverImage?.id,
  );

  const vehicleName = [vehicle.brand, vehicle.model, vehicle.trim]
    .filter(Boolean)
    .join(" ");

  const specifications = [
    {
      icon: CalendarDays,
      label: "Year",
      value: String(vehicle.year),
    },
    {
      icon: CarFront,
      label: "Transmission",
      value: formatEnum(vehicle.transmission),
    },
    {
      icon: Fuel,
      label: "Fuel",
      value: formatEnum(vehicle.fuelType),
    },
    {
      icon: Users,
      label: "Seats",
      value: String(vehicle.seats),
    },
    {
      icon: DoorOpen,
      label: "Doors",
      value: String(vehicle.doors),
    },
    {
      icon: BriefcaseBusiness,
      label: "Luggage",
      value: String(vehicle.luggage),
    },
  ];

  const rentalConditions = [
    policy?.minimumDriverAge
      ? {
          label: "Minimum driver age",
          value: `${policy.minimumDriverAge} years`,
        }
      : null,

    policy?.minimumLicenseYears
      ? {
          label: "Driving licence",
          value: `Held for at least ${policy.minimumLicenseYears} year${
            policy.minimumLicenseYears === 1 ? "" : "s"
          }`,
        }
      : null,

    policy?.dailyMileageLimit
      ? {
          label: "Included mileage",
          value: `${policy.dailyMileageLimit} km per day`,
        }
      : null,

    policy?.extraKilometrePrice
      ? {
          label: "Extra kilometre",
          value: `${formatPrice(policy.extraKilometrePrice)} MAD per km`,
        }
      : null,

    policy?.fuelPolicy
      ? {
          label: "Fuel policy",
          value:
            fuelPolicyLabels[policy.fuelPolicy] ??
            formatEnum(policy.fuelPolicy),
        }
      : null,

    policy?.insuranceIncluded !== null &&
    policy?.insuranceIncluded !== undefined
      ? {
          label: "Insurance",
          value: policy.insuranceIncluded ? "Included" : "Not included",
        }
      : null,

    policy?.insuranceExcess
      ? {
          label: "Insurance excess",
          value: `${formatPrice(policy.insuranceExcess)} MAD`,
        }
      : null,

    policy?.airportDeliveryFee !== null &&
    policy?.airportDeliveryFee !== undefined
      ? {
          label: "Airport delivery",
          value:
            policy.airportDeliveryFee === 0
              ? "Included"
              : `${formatPrice(policy.airportDeliveryFee)} MAD`,
        }
      : null,
  ].filter(
    (
      condition,
    ): condition is {
      label: string;
      value: string;
    } => condition !== null,
  );

  return (
    <div className="min-h-screen bg-[#f6f0e6] text-[#12372f]">
      <SiteHeader />

      <main className="px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-10 lg:pb-24 lg:pt-32">
        <div className="mx-auto max-w-[1320px]">
          <Link
            href="/#collection"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#63736c] transition hover:text-[#9a762f]"
          >
            <ArrowLeft className="size-4" />
            Back to vehicles
          </Link>

          <div className="mt-3 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="min-w-0 lg:col-start-1 lg:row-start-1">
              {coverImage ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[#ded4c4] shadow-[0_20px_50px_rgba(35,45,41,0.10)] sm:aspect-[16/9] lg:h-[480px] lg:aspect-auto">
                  <img
                    src={coverImage.url}
                    alt={coverImage.altText ?? vehicleName}
                    className="absolute inset-0 size-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#021b16]/90 via-transparent to-black/5" />

                  <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e2be6a] sm:text-xs">
                      {categoryLabels[vehicle.category]} collection
                    </p>

                    <h1 className="mt-2 font-heading text-4xl font-semibold capitalize leading-none sm:text-5xl">
                      {vehicle.brand} {vehicle.model}
                    </h1>

                    {vehicle.trim && (
                      <p className="mt-2 text-sm text-white/75 sm:text-base">
                        {vehicle.trim}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[24px] bg-[#e4dacb] sm:aspect-[16/9] lg:h-[480px] lg:aspect-auto">
                  <div className="px-6 text-center">
                    <CarFront className="mx-auto size-11 text-[#a47d2f]" />

                    <h1 className="mt-4 font-heading text-3xl font-semibold capitalize text-[#073b30]">
                      {vehicle.brand} {vehicle.model}
                    </h1>

                    <p className="mt-2 text-sm text-[#66766f]">
                      Vehicle photography coming soon
                    </p>
                  </div>
                </div>
              )}

              {galleryImages.length > 0 && (
                <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2">
                  {galleryImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="relative aspect-[4/3] w-[42%] shrink-0 snap-start overflow-hidden rounded-[16px] bg-[#ded4c4] sm:w-[28%] lg:w-[23%]"
                    >
                      <img
                        src={image.url}
                        alt={
                          image.altText ??
                          `${vehicleName} image ${index + 2}`
                        }
                        className="absolute inset-0 size-full object-cover transition duration-500 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <ReservationPanel
                vehicle={{
                  brand: vehicle.brand,
                  model: vehicle.model,
                  trim: vehicle.trim,
                  dailyPrice: vehicle.dailyPrice,
                  deposit: vehicle.deposit,
                }}
              />
            </div>

            <div className="space-y-5 lg:col-start-1 lg:row-start-2">
              <section className="rounded-[22px] border border-[#ded2bf] bg-white p-5 shadow-sm sm:p-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9a762f]">
                  About the vehicle
                </p>

                <h2 className="mt-2 font-heading text-2xl font-semibold text-[#073b30] sm:text-3xl">
                  Comfort prepared for Marrakech
                </h2>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#596b65] sm:text-base">
                  {vehicle.descriptionEn ??
                    `A comfortable and refined vehicle prepared for Marrakech city journeys, airport transfers and private escapes.`}
                </p>
              </section>

              <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {specifications.map((specification) => {
                  const Icon = specification.icon;

                  return (
                    <article
                      key={specification.label}
                      className="flex min-h-[92px] items-center gap-3 rounded-[18px] border border-[#ded2bf] bg-white p-4"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#073b30] text-[#dfbe72]">
                        <Icon className="size-5" />
                      </span>

                      <div className="min-w-0">
                        <p className="text-[11px] text-[#718078]">
                          {specification.label}
                        </p>

                        <p className="mt-1 truncate text-sm font-bold text-[#073b30] sm:text-base">
                          {specification.value}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </section>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(350px,0.8fr)]">
            <section className="overflow-hidden rounded-[22px] border border-[#ded2bf] bg-white">
              <div className="flex items-center gap-4 border-b border-[#e6dccd] bg-[#fbf7f0] p-5 sm:p-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#073b30] text-[#dfbe72]">
                  <ShieldCheck className="size-5" />
                </span>

                <div>
                  <h2 className="font-heading text-2xl font-semibold text-[#073b30]">
                    Rental conditions
                  </h2>

                  <p className="text-sm text-[#697972]">
                    The essential terms for this vehicle.
                  </p>
                </div>
              </div>

              {rentalConditions.length > 0 ? (
                <dl className="grid sm:grid-cols-2">
                  {rentalConditions.map((condition) => (
                    <div
                      key={condition.label}
                      className="flex items-center justify-between gap-4 border-b border-[#ece3d6] px-5 py-4 sm:[&:nth-child(odd)]:border-r"
                    >
                      <dt className="text-xs text-[#78867f]">
                        {condition.label}
                      </dt>

                      <dd className="text-right text-sm font-bold text-[#073b30]">
                        {condition.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <div className="p-5 sm:p-6">
                  <p className="text-sm leading-7 text-[#596b65]">
                    Full rental conditions will be shared before
                    confirmation. Nothing is charged through this website.
                  </p>
                </div>
              )}

              {policy?.insuranceDetails && (
                <div className="border-t border-[#e6dccd] p-5 sm:p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9a762f]">
                    Insurance information
                  </p>

                  <p className="mt-2 text-sm leading-7 text-[#596b65]">
                    {policy.insuranceDetails}
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-[22px] bg-[#073b30] p-6 text-white sm:p-7">
              <span className="flex size-12 items-center justify-center rounded-full bg-[#d6af58] text-[#073b30]">
                <MapPin className="size-5" />
              </span>

              <h2 className="mt-5 font-heading text-3xl font-semibold">
                Private delivery
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/70">
                Receive your vehicle at Marrakech Airport, your hotel,
                riad, train station or private villa.
              </p>

              <div className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm font-semibold text-white/80">
                <p className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-[#dfbe72]" />
                  Airport delivery
                </p>

                <p className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-[#dfbe72]" />
                  Hotel, riad and villa delivery
                </p>

                <p className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-[#dfbe72]" />
                  Local assistance throughout your rental
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}