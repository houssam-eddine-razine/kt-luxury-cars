/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
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
import {
  getLocale,
  getTranslations,
} from "next-intl/server";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";

import { ReservationPanel } from "./reservation-panel";

type VehiclePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
  }).format(value);
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
  const locale = await getLocale();

  const translations =
    await getTranslations("VehicleDetail");

  if (!vehicle) {
    return {
      title: translations("notFound"),
    };
  }

  const vehicleName = [
    vehicle.brand,
    vehicle.model,
    vehicle.trim,
  ]
    .filter(Boolean)
    .join(" ");

  const description =
    locale === "en" && vehicle.descriptionEn
      ? vehicle.descriptionEn
      : translations("metadataDescription", {
          vehicle: vehicleName,
        });

  return {
    title:
      locale === "fr"
        ? `Location ${vehicleName} à Marrakech`
        : `${vehicleName} Rental Marrakech`,
    description,
    alternates: {
      languages: {
        en: `/en/vehicles/${slug}`,
        fr: `/fr/vehicles/${slug}`,
      },
    },
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

  const locale = await getLocale();

  const translations =
    await getTranslations("VehicleDetail");

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

  const policy =
    vehicle.rentalPolicy ?? defaultPolicy;

  const coverImage =
    vehicle.images.find(
      (image) => image.isCover,
    ) ?? vehicle.images[0];

  const galleryImages = vehicle.images.filter(
    (image) => image.id !== coverImage?.id,
  );

  const vehicleName = [
    vehicle.brand,
    vehicle.model,
    vehicle.trim,
  ]
    .filter(Boolean)
    .join(" ");

  const categoryLabels: Record<string, string> = {
    ECONOMY: translations("city"),
    COMPACT: translations("city"),
    SUV: translations("suv"),
    PREMIUM: translations("premium"),
    LUXURY: translations("luxury"),
  };

  const transmissionLabels: Record<
    string,
    string
  > = {
    AUTOMATIC: translations("automatic"),
    MANUAL: translations("manual"),
  };

  const fuelLabels: Record<string, string> = {
    PETROL: translations("petrol"),
    DIESEL: translations("diesel"),
    HYBRID: translations("hybrid"),
    ELECTRIC: translations("electric"),
  };

  const fuelPolicyLabels: Record<
    string,
    string
  > = {
    FULL_TO_FULL: translations("fullToFull"),
    SAME_TO_SAME: translations("sameToSame"),
    PREPURCHASE: translations("prepurchase"),
  };

  const specifications = [
    {
      icon: CalendarDays,
      label: translations("year"),
      value: String(vehicle.year),
    },
    {
      icon: CarFront,
      label: translations("transmission"),
      value:
        transmissionLabels[
          vehicle.transmission
        ] ?? vehicle.transmission,
    },
    {
      icon: Fuel,
      label: translations("fuel"),
      value:
        fuelLabels[vehicle.fuelType] ??
        vehicle.fuelType,
    },
    {
      icon: Users,
      label: translations("seats"),
      value: String(vehicle.seats),
    },
    {
      icon: DoorOpen,
      label: translations("doors"),
      value: String(vehicle.doors),
    },
    {
      icon: BriefcaseBusiness,
      label: translations("luggage"),
      value: String(vehicle.luggage),
    },
  ];

  const rentalConditions = [
    policy?.minimumDriverAge
      ? {
          label: translations("minimumAge"),
          value: translations("years", {
            count: policy.minimumDriverAge,
          }),
        }
      : null,

    policy?.minimumLicenseYears
      ? {
          label: translations(
            "drivingLicence",
          ),
          value: translations(
            "licenceYears",
            {
              count:
                policy.minimumLicenseYears,
            },
          ),
        }
      : null,

    policy?.dailyMileageLimit
      ? {
          label: translations(
            "includedMileage",
          ),
          value: translations(
            "kilometresPerDay",
            {
              count:
                policy.dailyMileageLimit,
            },
          ),
        }
      : null,

    policy?.extraKilometrePrice
      ? {
          label: translations(
            "extraKilometre",
          ),
          value: translations(
            "pricePerKilometre",
            {
              price: formatPrice(
                policy.extraKilometrePrice,
              ),
            },
          ),
        }
      : null,

    policy?.fuelPolicy
      ? {
          label: translations("fuelPolicy"),
          value:
            fuelPolicyLabels[
              policy.fuelPolicy
            ] ?? policy.fuelPolicy,
        }
      : null,

    policy?.insuranceIncluded !== null &&
    policy?.insuranceIncluded !== undefined
      ? {
          label: translations("insurance"),
          value: policy.insuranceIncluded
            ? translations("included")
            : translations("notIncluded"),
        }
      : null,

    policy?.insuranceExcess
      ? {
          label: translations(
            "insuranceExcess",
          ),
          value: `${formatPrice(
            policy.insuranceExcess,
          )} MAD`,
        }
      : null,

    policy?.airportDeliveryFee !== null &&
    policy?.airportDeliveryFee !== undefined
      ? {
          label: translations(
            "airportDelivery",
          ),
          value:
            policy.airportDeliveryFee === 0
              ? translations("included")
              : `${formatPrice(
                  policy.airportDeliveryFee,
                )} MAD`,
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

  const description =
    locale === "en" && vehicle.descriptionEn
      ? vehicle.descriptionEn
      : translations("defaultDescription");

  return (
    <div className="min-h-screen bg-[#F7F2E9] text-[#17212B]">
      <SiteHeader />

      <main className="px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-10 lg:pb-24 lg:pt-32">
        <div className="mx-auto max-w-[1320px]">
          <Link
            href="/vehicles"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#66727D] transition hover:text-[#9A762F]"
          >
            <ArrowLeft className="size-4" />
            {translations("back")}
          </Link>

          <div className="mt-3 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="min-w-0 lg:col-start-1 lg:row-start-1">
              {coverImage ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[#E4DDD2] shadow-[0_20px_50px_rgba(11,23,38,0.1)] sm:aspect-[16/9] lg:h-[480px] lg:aspect-auto">
                  <img
                    src={coverImage.url}
                    alt={
                      coverImage.altText ??
                      vehicleName
                    }
                    className="absolute inset-0 size-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#07111E]/90 via-transparent to-black/5" />

                  <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E2BE6A] sm:text-xs">
                      {translations("collection", {
                        category:
                          categoryLabels[
                            vehicle.category
                          ] ?? vehicle.category,
                      })}
                    </p>

                    <h1 className="mt-2 font-heading text-4xl font-semibold capitalize leading-none sm:text-5xl">
                      {vehicle.brand}{" "}
                      {vehicle.model}
                    </h1>

                    {vehicle.trim && (
                      <p className="mt-2 text-sm text-white/75 sm:text-base">
                        {vehicle.trim}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[24px] bg-[#E4DDD2] sm:aspect-[16/9] lg:h-[480px] lg:aspect-auto">
                  <div className="px-6 text-center">
                    <CarFront className="mx-auto size-11 text-[#A47D2F]" />

                    <h1 className="mt-4 font-heading text-3xl font-semibold capitalize text-[#0B1726]">
                      {vehicle.brand}{" "}
                      {vehicle.model}
                    </h1>

                    <p className="mt-2 text-sm text-[#66727D]">
                      {translations(
                        "photographySoon",
                      )}
                    </p>
                  </div>
                </div>
              )}

              {galleryImages.length > 0 && (
                <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2">
                  {galleryImages.map(
                    (image, index) => (
                      <div
                        key={image.id}
                        className="relative aspect-[4/3] w-[42%] shrink-0 snap-start overflow-hidden rounded-[16px] bg-[#E4DDD2] sm:w-[28%] lg:w-[23%]"
                      >
                        <img
                          src={image.url}
                          alt={
                            image.altText ??
                            `${vehicleName} ${
                              index + 2
                            }`
                          }
                          className="absolute inset-0 size-full object-cover transition duration-500 hover:scale-105"
                        />
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            <div className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <ReservationPanel
                vehicle={{
                  brand: vehicle.brand,
                  model: vehicle.model,
                  trim: vehicle.trim,
                  dailyPrice:
                    vehicle.dailyPrice,
                  deposit: vehicle.deposit,
                }}
              />
            </div>

            <div className="space-y-5 lg:col-start-1 lg:row-start-2">
              <section className="rounded-[22px] border border-[#DED2BF] bg-white p-5 shadow-sm sm:p-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9A762F]">
                  {translations("about")}
                </p>

                <h2 className="mt-2 font-heading text-2xl font-semibold text-[#0B1726] sm:text-3xl">
                  {translations("aboutTitle")}
                </h2>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#66727D] sm:text-base">
                  {description}
                </p>
              </section>

              <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {specifications.map(
                  (specification) => {
                    const Icon =
                      specification.icon;

                    return (
                      <article
                        key={
                          specification.label
                        }
                        className="flex min-h-[92px] items-center gap-3 rounded-[18px] border border-[#DED2BF] bg-white p-4"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0B1726] text-[#DFBE72]">
                          <Icon className="size-5" />
                        </span>

                        <div className="min-w-0">
                          <p className="text-[11px] text-[#74808A]">
                            {
                              specification.label
                            }
                          </p>

                          <p className="mt-1 truncate text-sm font-bold text-[#0B1726] sm:text-base">
                            {
                              specification.value
                            }
                          </p>
                        </div>
                      </article>
                    );
                  },
                )}
              </section>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(350px,0.8fr)]">
            <section className="overflow-hidden rounded-[22px] border border-[#DED2BF] bg-white">
              <div className="flex items-center gap-4 border-b border-[#E6DCCD] bg-[#FFFCF7] p-5 sm:p-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0B1726] text-[#DFBE72]">
                  <ShieldCheck className="size-5" />
                </span>

                <div>
                  <h2 className="font-heading text-2xl font-semibold text-[#0B1726]">
                    {translations("conditions")}
                  </h2>

                  <p className="text-sm text-[#74808A]">
                    {translations(
                      "conditionsSubtitle",
                    )}
                  </p>
                </div>
              </div>

              {rentalConditions.length > 0 ? (
                <dl className="grid sm:grid-cols-2">
                  {rentalConditions.map(
                    (condition) => (
                      <div
                        key={condition.label}
                        className="flex items-center justify-between gap-4 border-b border-[#ECE3D6] px-5 py-4 sm:[&:nth-child(odd)]:border-r"
                      >
                        <dt className="text-xs text-[#74808A]">
                          {condition.label}
                        </dt>

                        <dd className="text-right text-sm font-bold text-[#0B1726]">
                          {condition.value}
                        </dd>
                      </div>
                    ),
                  )}
                </dl>
              ) : (
                <p className="p-5 text-sm leading-7 text-[#66727D] sm:p-6">
                  {translations(
                    "conditionsFallback",
                  )}
                </p>
              )}

              {policy?.insuranceDetails && (
                <div className="border-t border-[#E6DCCD] p-5 sm:p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9A762F]">
                    {translations(
                      "insuranceInformation",
                    )}
                  </p>

                  <p className="mt-2 text-sm leading-7 text-[#66727D]">
                    {policy.insuranceDetails}
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-[22px] bg-[#0B1726] p-6 text-white sm:p-7">
              <span className="flex size-12 items-center justify-center rounded-full bg-[#D6AF58] text-[#0B1726]">
                <MapPin className="size-5" />
              </span>

              <h2 className="mt-5 font-heading text-3xl font-semibold">
                {translations("privateDelivery")}
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/70">
                {translations(
                  "deliveryDescription",
                )}
              </p>

              <div className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm font-semibold text-white/80">
                {[
                  translations(
                    "airportDelivery",
                  ),
                  translations("hotelDelivery"),
                  translations(
                    "localAssistance",
                  ),
                ].map((item) => (
                  <p
                    key={item}
                    className="flex items-center gap-3"
                  >
                    <Check className="size-4 shrink-0 text-[#DFBE72]" />
                    {item}
                  </p>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}