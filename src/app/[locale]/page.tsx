/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronDown,
  Clock3,
  KeyRound,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { BookingBar } from "@/components/public/booking-bar";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { TrustStats } from "@/components/public/trust-stats";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";

const phone = "212619019549";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;

  const translations = await getTranslations({
    locale,
    namespace: "Home",
  });

  return {
    title: translations("metadataTitle"),
    description: translations(
      "metadataDescription",
    ),
    alternates: {
      languages: {
        en: "/en",
        fr: "/fr",
      },
    },
  };
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function HomePage() {
  const translations =
    await getTranslations("Home");

  const fleetTranslations =
    await getTranslations("Fleet");

  const [vehicles, vehicleCount] =
    await Promise.all([
      prisma.vehicle.findMany({
        where: {
          visible: true,
          status: "AVAILABLE",
        },
        orderBy: [
          {
            featured: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        take: 6,
        include: {
          images: {
            orderBy: {
              position: "asc",
            },
          },
        },
      }),

      prisma.vehicle.count({
        where: {
          visible: true,
          status: "AVAILABLE",
        },
      }),
    ]);

  const whatsapp = `https://wa.me/${phone}?text=${encodeURIComponent(
    translations("whatsappMessage"),
  )}`;

  const categoryLabels: Record<string, string> = {
    ECONOMY: fleetTranslations("city"),
    COMPACT: fleetTranslations("city"),
    SUV: fleetTranslations("suv"),
    PREMIUM: fleetTranslations("premium"),
    LUXURY: fleetTranslations("luxury"),
  };

  const transmissionLabels: Record<string, string> = {
    AUTOMATIC: fleetTranslations("automatic"),
    MANUAL: fleetTranslations("manual"),
  };

  const fuelLabels: Record<string, string> = {
    PETROL: fleetTranslations("petrol"),
    DIESEL: fleetTranslations("diesel"),
    HYBRID: fleetTranslations("hybrid"),
    ELECTRIC: fleetTranslations("electric"),
  };

  const collections = [
    {
      number: "01",
      name: translations("cityName"),
      models: translations("cityModels"),
      description: translations(
        "cityDescription",
      ),
      image: "/images/journey-city.png",
      rotation: "xl:-rotate-[1.25deg]",
      action: translations("cityAction"),
    },
    {
      number: "02",
      name: translations("premiumName"),
      models: translations("premiumModels"),
      description: translations(
        "premiumDescription",
      ),
      image: "/images/journey-premium.png",
      rotation: "xl:rotate-[1deg]",
      action: translations("premiumAction"),
    },
    {
      number: "03",
      name: translations("luxuryName"),
      models: translations("luxuryModels"),
      description: translations(
        "luxuryDescription",
      ),
      image: "/images/journey-luxury.png",
      rotation: "xl:-rotate-[1deg]",
      action: translations("luxuryAction"),
    },
  ];

  const questions = [
    {
      question: translations("faqOneQuestion"),
      answer: translations("faqOneAnswer"),
    },
    {
      question: translations("faqTwoQuestion"),
      answer: translations("faqTwoAnswer"),
    },
    {
      question: translations(
        "faqThreeQuestion",
      ),
      answer: translations("faqThreeAnswer"),
    },
    {
      question: translations(
        "faqFourQuestion",
      ),
      answer: translations("faqFourAnswer"),
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F2E9] pb-20 text-[#17212B] lg:pb-0">
      <SiteHeader />

      <main>
        <section className="relative isolate min-h-[680px] overflow-hidden bg-[#0B1726] sm:min-h-[780px]">
          <img
            src="/images/kt-hero.png"
            alt="KT Luxury Cars Marrakech"
            className="absolute inset-0 -z-20 size-full object-cover object-[68%_center] sm:object-[70%_center]"
          />

          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(7,17,30,0.99)_0%,rgba(7,17,30,0.94)_38%,rgba(11,23,38,0.55)_68%,rgba(11,23,38,0.16)_100%)]" />

          <div className="absolute inset-0 -z-10 bg-[#0B1726]/15 mix-blend-color" />

          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#07111E]/75 via-transparent to-black/25" />

          <div className="mx-auto flex min-h-[680px] max-w-[1480px] items-center px-5 pb-20 pt-28 sm:min-h-[780px] sm:px-8 sm:pb-28 sm:pt-32 lg:px-12">
            <div className="max-w-3xl">
              <p className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#DBBC70] sm:text-sm">
                <span className="h-px w-8 bg-[#C8A45D] sm:w-11" />
                {translations("heroEyebrow")}
              </p>

              <h1 className="mt-6 font-heading text-[46px] font-semibold leading-[0.96] tracking-[-0.035em] text-white sm:mt-8 sm:text-6xl md:text-7xl lg:text-[86px]">
                {translations("heroTitleFirst")}

                <span className="mt-1 block italic text-[#DBB968]">
                  {translations("heroTitleSecond")}
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-[15px] leading-7 text-white/80 sm:mt-8 sm:text-lg sm:leading-8">
                {translations("heroDescription")}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
                <Link
                  href="/#collection"
                  className="group inline-flex min-h-14 items-center justify-center gap-4 rounded-[10px] bg-[#C8A45D] px-6 text-xs font-bold uppercase tracking-[0.12em] text-[#0B1726] sm:px-8"
                >
                  {translations("exploreFleet")}
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-14 items-center justify-center gap-3 rounded-[10px] border border-[#C8A45D]/70 bg-[#0B1726]/70 px-6 text-xs font-bold uppercase tracking-[0.12em] text-white sm:px-8"
                >
                  <MessageCircle className="size-5" />
                  {translations(
                    "whatsappConcierge",
                  )}
                </a>
              </div>

              <div className="mt-8 grid gap-3 text-sm text-white/75 sm:mt-10 sm:flex sm:flex-wrap sm:gap-x-8">
                {[
                  translations("airportDelivery"),
                  translations("clearTerms"),
                  translations("directAssistance"),
                ].map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-2"
                  >
                    <Check className="size-4 text-[#DBB968]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="reserve"
          className="relative z-20 px-4 py-5 sm:px-8 sm:py-6 lg:-mt-14 lg:px-12 lg:py-0"
        >
          <div className="mx-auto max-w-[1400px]">
            <BookingBar />
          </div>
        </section>

        <TrustStats vehicleCount={vehicleCount} />

        <section className="overflow-hidden bg-[#F7F2E9] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1400px]">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#9A762F] sm:text-base">
                {translations(
                  "collectionsEyebrow",
                )}
              </p>

              <h2 className="mt-4 font-heading text-4xl font-semibold leading-[1.08] text-[#0B1726] sm:text-5xl lg:text-6xl">
                {translations("collectionsTitle")}
              </h2>

              <div className="mx-auto mt-6 flex items-center justify-center gap-3">
                <span className="h-px w-16 bg-[#C8A45D]/60" />
                <span className="size-2 rotate-45 bg-[#C8A45D]" />
                <span className="h-px w-16 bg-[#C8A45D]/60" />
              </div>

              <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-7 text-[#66727D] sm:text-base sm:leading-8">
                {translations(
                  "collectionsDescription",
                )}
              </p>
            </div>

            <div className="mt-10 grid gap-7 sm:mt-14 md:grid-cols-2 xl:grid-cols-3">
              {collections.map(
                (collection, index) => {
                  const message = encodeURIComponent(
                    translations(
                      "collectionMessage",
                      {
                        category: collection.name,
                      },
                    ),
                  );

                  return (
                    <ScrollReveal
                      key={collection.number}
                      direction={
                        index === 0 ? "left" : "up"
                      }
                      delay={index * 100}
                      className={`h-full ${
                        index === 2
                          ? "md:col-span-2 xl:col-span-1"
                          : ""
                      }`}
                    >
                      <article
                        className={`group relative mx-auto h-full w-full max-w-[540px] overflow-hidden rounded-[16px] border border-[#D8CDBB] bg-[#FFFCF7] shadow-[0_24px_55px_rgba(11,23,38,0.12)] transition duration-500 hover:-translate-y-2 ${collection.rotation}`}
                      >
                        <div className="relative aspect-[4/5] overflow-hidden">
                          <img
                            src={collection.image}
                            alt={collection.name}
                            className="size-full object-cover transition duration-700 group-hover:scale-105"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-[#07111E] via-transparent to-black/10" />

                          <span className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full border border-[#C8A45D]/60 bg-[#0B1726]/90 font-heading text-lg text-[#D8B868]">
                            {collection.number}
                          </span>

                          <div className="absolute inset-x-4 top-6 rounded-[10px] border border-[#C8A45D]/40 bg-[#0B1726]/95 px-4 py-4 text-center">
                            <h3 className="font-heading text-3xl font-semibold uppercase text-[#D8B868] sm:text-4xl">
                              {collection.name}
                            </h3>

                            <p className="mt-2 text-sm font-semibold text-white">
                              {collection.models}
                            </p>
                          </div>

                          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                            <p className="text-sm leading-7 text-white/90">
                              {collection.description}
                            </p>

                            <a
                              href={`https://wa.me/${phone}?text=${message}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-5 flex min-h-14 items-center justify-between border-t border-[#C8A45D]/55 pt-4 text-sm font-bold text-[#E3C474]"
                            >
                              {collection.action}

                              <span className="flex size-11 items-center justify-center rounded-full border border-[#C8A45D]/70 bg-[#0B1726]/85">
                                <ArrowRight className="size-5" />
                              </span>
                            </a>
                          </div>
                        </div>
                      </article>
                    </ScrollReveal>
                  );
                },
              )}
            </div>

            <div className="mt-12 grid overflow-hidden rounded-[20px] border border-[#DDD1BE] bg-[#FFFCF7] md:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: translations("clearTerms"),
                  text: translations(
                    "termsDescription",
                  ),
                },
                {
                  icon: MapPin,
                  title: translations(
                    "privateDelivery",
                  ),
                  text: translations(
                    "deliveryDescription",
                  ),
                },
                {
                  icon: MessageCircle,
                  title: translations(
                    "directService",
                  ),
                  text: translations(
                    "directServiceDescription",
                  ),
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={`flex gap-4 p-5 sm:p-6 ${
                      index < 2
                        ? "border-b border-[#E1D7C7] md:border-b-0 md:border-r"
                        : ""
                    }`}
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0B1726] text-[#D8B868]">
                      <Icon className="size-5" />
                    </span>

                    <div>
                      <h3 className="font-heading text-xl font-semibold text-[#0B1726]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[#74808A]">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="collection"
          className="relative bg-[#EFE8DC] px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-32"
        >
          <div className="mx-auto max-w-[1400px]">
            <div className="grid gap-7 lg:grid-cols-[1fr_0.75fr] lg:items-end">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#9A762F] sm:text-base">
                  {translations("fleetEyebrow")}
                </p>

                <h2 className="mt-4 font-heading text-4xl font-semibold text-[#0B1726] sm:text-5xl lg:text-6xl">
                  {translations("fleetTitleFirst")}

                  <span className="block italic text-[#A47D2F]">
                    {translations(
                      "fleetTitleSecond",
                    )}
                  </span>
                </h2>
              </div>

              <div>
                <p className="text-[15px] leading-7 text-[#66727D] sm:text-base sm:leading-8">
                  {translations("fleetDescription")}
                </p>

                <div className="mt-5 flex flex-wrap gap-5 text-sm text-[#4F5E6B]">
                  {[
                    translations(
                      "realAvailability",
                    ),
                    translations("clearPrices"),
                    translations(
                      "privateDelivery",
                    ),
                  ].map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-2"
                    >
                      <Check className="size-4 text-[#A47D2F]" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {vehicles.length === 0 ? (
              <div className="mt-10 rounded-[24px] bg-[#FFFCF7] p-8 text-center">
                <Sparkles className="mx-auto size-8 text-[#A47D2F]" />

                <h3 className="mt-5 font-heading text-3xl font-semibold text-[#0B1726]">
                  {translations(
                    "noVehiclesTitle",
                  )}
                </h3>

                <p className="mx-auto mt-4 max-w-xl text-[#66727D]">
                  {translations(
                    "noVehiclesDescription",
                  )}
                </p>

                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 inline-flex min-h-14 items-center gap-3 rounded-[10px] bg-[#128C5A] px-7 text-sm font-bold text-white"
                >
                  <MessageCircle className="size-5" />
                  {translations(
                    "requestAvailability",
                  )}
                </a>
              </div>
            ) : (
              <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {vehicles.map(
                  (vehicle, index) => {
                    const cover =
                      vehicle.images.find(
                        (image) => image.isCover,
                      ) ?? vehicle.images[0];

                    return (
                      <ScrollReveal
                        key={vehicle.id}
                        direction={
                          index === 0
                            ? "left"
                            : "up"
                        }
                        delay={Math.min(
                          index * 90,
                          270,
                        )}
                        className="h-full"
                      >
                        <article className="group h-full overflow-hidden rounded-[20px] border border-[#D8CDBB] bg-[#FFFCF7] shadow-[0_18px_45px_rgba(11,23,38,0.1)]">
                          <Link
                            href={`/vehicles/${vehicle.slug}`}
                            className="relative block aspect-[16/10] overflow-hidden bg-[#E4DDD2]"
                          >
                            {cover ? (
                              <img
                                src={cover.url}
                                alt={
                                  cover.altText ||
                                  `${vehicle.brand} ${vehicle.model}`
                                }
                                className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="size-8 text-[#A47D2F]" />
                              </span>
                            )}

                            <span className="absolute left-4 top-4 rounded-full bg-[#F7F2E9]/95 px-3 py-2 text-[9px] font-bold uppercase text-[#0B1726]">
                              {
                                categoryLabels[
                                  vehicle.category
                                ]
                              }
                            </span>
                          </Link>

                          <div className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase text-[#A47D2F]">
                                  {vehicle.year} ·{" "}
                                  {transmissionLabels[
                                    vehicle
                                      .transmission
                                  ] ??
                                    vehicle.transmission}
                                </p>

                                <h3 className="mt-1.5 truncate font-heading text-[28px] font-semibold text-[#0B1726]">
                                  {vehicle.brand}{" "}
                                  {vehicle.model}
                                </h3>

                                {vehicle.trim && (
                                  <p className="mt-1 truncate text-xs text-[#74808A]">
                                    {vehicle.trim}
                                  </p>
                                )}
                              </div>

                              <div className="shrink-0 text-right">
                                <p className="text-[9px] uppercase text-[#7A8691]">
                                  {fleetTranslations(
                                    "from",
                                  )}
                                </p>

                                <p className="font-heading text-2xl font-semibold text-[#A47D2F]">
                                  {formatPrice(
                                    vehicle.dailyPrice,
                                  )}
                                </p>

                                <p className="text-[10px] text-[#74808A]">
                                  {fleetTranslations(
                                    "perDay",
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-4 divide-x divide-[#DDD1BE] rounded-[11px] bg-[#F1ECE4] py-3 text-center">
                              <div>
                                <p className="text-xs font-bold">
                                  {vehicle.seats}
                                </p>
                                <p className="text-[9px] text-[#74808A]">
                                  {fleetTranslations(
                                    "seats",
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-bold">
                                  {vehicle.doors}
                                </p>
                                <p className="text-[9px] text-[#74808A]">
                                  {fleetTranslations(
                                    "doors",
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="truncate px-1 text-xs font-bold">
                                  {fuelLabels[
                                    vehicle.fuelType
                                  ] ??
                                    vehicle.fuelType}
                                </p>
                                <p className="text-[9px] text-[#74808A]">
                                  {fleetTranslations(
                                    "fuel",
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="truncate px-1 text-xs font-bold">
                                  {
                                    transmissionLabels[
                                      vehicle
                                        .transmission
                                    ]
                                  }
                                </p>
                                <p className="text-[9px] text-[#74808A]">
                                  {
                                    vehicle.transmission
                                  }
                                </p>
                              </div>
                            </div>

                            <Link
                              href={`/vehicles/${vehicle.slug}`}
                              className="mt-4 flex min-h-12 items-center justify-between rounded-[10px] bg-[#0B1726] px-4 text-xs font-bold text-white"
                            >
                              {fleetTranslations(
                                "viewVehicle",
                              )}

                              <span className="flex size-8 items-center justify-center rounded-full bg-[#C8A45D] text-[#0B1726]">
                                <ArrowRight className="size-4" />
                              </span>
                            </Link>
                          </div>
                        </article>
                      </ScrollReveal>
                    );
                  },
                )}
              </div>
            )}

            <div className="mt-10 text-center">
              <Link
                href="/vehicles"
                className="inline-flex min-h-14 items-center gap-3 rounded-[12px] border border-[#B99752] bg-[#FFFCF7] px-7 text-sm font-bold text-[#0B1726]"
              >
                {translations("viewCompleteFleet")}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[#0B1726] px-5 py-16 text-white sm:px-8 sm:py-24 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#D8B868] sm:text-base">
                {translations("stepsEyebrow")}
              </p>

              <h2 className="mt-4 font-heading text-4xl font-semibold sm:text-5xl">
                {translations("stepsTitle")}
              </h2>

              <p className="mt-5 text-white/65">
                {translations("stepsDescription")}
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                {
                  number: "01",
                  icon: Search,
                  title: translations(
                    "stepOneTitle",
                  ),
                  text: translations(
                    "stepOneDescription",
                  ),
                },
                {
                  number: "02",
                  icon: CalendarCheck,
                  title: translations(
                    "stepTwoTitle",
                  ),
                  text: translations(
                    "stepTwoDescription",
                  ),
                },
                {
                  number: "03",
                  icon: KeyRound,
                  title: translations(
                    "stepThreeTitle",
                  ),
                  text: translations(
                    "stepThreeDescription",
                  ),
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <ScrollReveal
                    key={item.number}
                    direction="up"
                    delay={index * 120}
                    className="h-full"
                  >
                    <article className="h-full rounded-[20px] border border-white/10 bg-white/[0.05] p-6 sm:p-8">
                      <div className="flex size-12 items-center justify-center rounded-full bg-[#C8A45D] text-[#0B1726]">
                        <Icon className="size-5" />
                      </div>

                      <p className="mt-6 text-xs font-bold uppercase text-[#D8B868]">
                        {translations("step")}{" "}
                        {item.number}
                      </p>

                      <h3 className="mt-2 font-heading text-2xl font-semibold">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-white/65">
                        {item.text}
                      </p>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center gap-3 rounded-[12px] bg-[#C8A45D] px-7 text-sm font-bold text-[#0B1726]"
              >
                <MessageCircle className="size-5" />
                {translations("startRequest")}
              </a>
            </div>
          </div>
        </section>

        <section
          id="services"
          className="bg-[#F7F2E9] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"
        >
          <div className="mx-auto max-w-[1400px]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-extrabold uppercase text-[#9A762F] sm:text-base">
                {translations("servicesEyebrow")}
              </p>

              <h2 className="mt-4 font-heading text-4xl font-semibold text-[#0B1726] sm:text-5xl">
                {translations("servicesTitle")}
              </h2>

              <p className="mt-6 leading-8 text-[#66727D]">
                {translations(
                  "servicesDescription",
                )}
              </p>
            </div>

            <div
              id="why-kt"
              className="mt-10 grid gap-5 md:grid-cols-3"
            >
              {[
                {
                  icon: MapPin,
                  title: translations(
                    "privateDelivery",
                  ),
                  text: translations(
                    "deliveryDescription",
                  ),
                },
                {
                  icon: Clock3,
                  title: translations(
                    "directService",
                  ),
                  text: translations(
                    "directServiceDescription",
                  ),
                },
                {
                  icon: ShieldCheck,
                  title: translations(
                    "preparedVehicles",
                  ),
                  text: translations(
                    "preparedDescription",
                  ),
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <ScrollReveal
                    key={item.title}
                    direction="up"
                    delay={index * 100}
                    className="h-full"
                  >
                    <article className="h-full rounded-[20px] border border-[#DDD1BE] bg-[#FFFCF7] p-6 sm:p-8">
                      <div className="flex size-12 items-center justify-center rounded-full bg-[#0B1726] text-[#D8B868]">
                        <Icon className="size-5" />
                      </div>

                      <h3 className="mt-6 font-heading text-2xl font-semibold text-[#0B1726]">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-[#66727D]">
                        {item.text}
                      </p>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="bg-[#EFE8DC] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"
        >
          <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#9A762F] sm:text-base">
                {translations("faqEyebrow")}
              </p>

              <h2 className="mt-4 font-heading text-4xl font-semibold text-[#0B1726] sm:text-5xl">
                {translations("faqTitle")}
              </h2>

              <p className="mt-5 leading-8 text-[#66727D]">
                {translations("faqDescription")}
              </p>

              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex min-h-13 items-center gap-3 rounded-[11px] bg-[#0B1726] px-6 text-sm font-bold text-white"
              >
                <MessageCircle className="size-5 text-[#D8B868]" />
                {translations("askDirectly")}
              </a>
            </div>

            <div className="space-y-3">
              {questions.map((item) => (
                <details
                  key={item.question}
                  className="group overflow-hidden rounded-[16px] border border-[#D8CDBB] bg-[#FFFCF7]"
                >
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 px-5 py-4 font-heading text-lg font-semibold text-[#0B1726] [&::-webkit-details-marker]:hidden">
                    {item.question}

                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F1ECE4] text-[#A47D2F]">
                      <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                    </span>
                  </summary>

                  <p className="border-t border-[#E1D7C7] px-5 py-5 text-sm leading-7 text-[#66727D]">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F7F2E9] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <ScrollReveal direction="up">
            <div className="mx-auto max-w-[1400px] rounded-[24px] bg-[#0B1726] px-5 py-14 text-center text-white sm:px-10 sm:py-20">
              <MessageCircle className="mx-auto size-8 text-[#D8B868]" />

              <p className="mt-5 text-sm font-extrabold uppercase text-[#D8B868] sm:text-base">
                {translations("ctaEyebrow")}
              </p>

              <h2 className="mt-4 font-heading text-4xl font-semibold sm:text-5xl">
                {translations("ctaTitle")}
              </h2>

              <p className="mx-auto mt-5 max-w-2xl leading-8 text-white/70">
                {translations("ctaDescription")}
              </p>

              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex min-h-14 items-center gap-3 rounded-[12px] bg-[#128C5A] px-7 text-sm font-bold text-white"
              >
                <MessageCircle className="size-5" />
                {translations("bookWhatsapp")}
                <ArrowRight className="size-5" />
              </a>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <SiteFooter />

      <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-[#D8CDBB] bg-[#FFFCF7]/95 p-2.5 shadow-[0_-12px_35px_rgba(11,23,38,0.12)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-2 gap-2.5">
          <Link
            href="/vehicles"
            className="flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-[#0B1726] px-3 text-xs font-bold text-white"
          >
            {translations("viewCars")}
            <ArrowRight className="size-4" />
          </Link>

          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-[#128C5A] px-3 text-xs font-bold text-white"
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}