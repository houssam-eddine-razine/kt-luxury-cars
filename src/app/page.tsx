/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { BookingBar } from "@/components/public/booking-bar";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { prisma } from "@/lib/prisma";

const phone = "212619019549";

const whatsapp =
  `https://wa.me/${phone}?text=${encodeURIComponent(
    "Hello KT Luxury Cars, I would like to rent a car in Marrakech. Please send me the available vehicles, prices and delivery options.",
  )}`;

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

export default async function HomePage() {
  const vehicles = await prisma.vehicle.findMany({
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
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f2e8] text-[#122d26]">
      <SiteHeader />

      <main>
        <section className="relative isolate min-h-[780px] overflow-hidden bg-[#061d18]">
          <img
            src="/images/kt-hero.png"
            alt="KT Luxury Cars vehicle in Marrakech"
            className="absolute inset-0 -z-20 size-full object-cover object-[70%_center]"
          />

          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,25,20,0.99)_0%,rgba(4,25,20,0.94)_38%,rgba(4,25,20,0.46)_68%,rgba(4,25,20,0.08)_100%)]" />

          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#041914]/60 via-transparent to-black/20" />

          <div className="mx-auto flex min-h-[780px] max-w-[1480px] items-center px-5 pb-28 pt-32 sm:px-8 lg:px-12">
            <div className="max-w-3xl">
              <p className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.24em] text-[#dbbc70]">
                <span className="h-px w-11 bg-[#c8a45d]" />
                Private car rental in Marrakech
              </p>

              <h1 className="mt-8 font-heading text-5xl font-semibold leading-[0.98] tracking-[-0.035em] text-white sm:text-6xl md:text-7xl lg:text-[86px]">
                Marrakech begins

                <span className="block italic text-[#dbb968]">
                  with the right car.
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-lg leading-8 text-white/80">
                From city drives to luxury escapes, explore Marrakech
                with a carefully selected vehicle delivered wherever
                you need it.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="#collection"
                  className="group inline-flex min-h-15 items-center justify-center gap-4 rounded-[10px] bg-[#c8a45d] px-8 text-xs font-bold uppercase tracking-[0.14em] text-[#06251e] transition hover:bg-[#d9b86f]"
                >
                  Explore our fleet
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-15 items-center justify-center gap-3 rounded-[10px] border border-[#c8a45d]/70 bg-[#06251e]/60 px-8 text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition hover:bg-[#c8a45d] hover:text-[#06251e]"
                >
                  <MessageCircle className="size-5" />
                  WhatsApp concierge
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/75">
                <span className="flex items-center gap-2">
                  <Check className="size-4 text-[#dbb968]" />
                  Airport delivery
                </span>

                <span className="flex items-center gap-2">
                  <Check className="size-4 text-[#dbb968]" />
                  Clear rental terms
                </span>

                <span className="flex items-center gap-2">
                  <Check className="size-4 text-[#dbb968]" />
                  Direct local assistance
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="reserve"
          className="relative z-20 px-4 py-6 sm:px-8 lg:-mt-14 lg:px-12 lg:py-0"
        >
          <div className="mx-auto max-w-[1400px]">
            <BookingBar />
          </div>
        </section>

        <section className="overflow-hidden bg-[#f8f2e8] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1400px]">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9a762f] sm:text-sm">
                Our collections
              </p>

              <h2 className="mt-4 font-heading text-4xl font-semibold leading-[1.08] tracking-[-0.025em] text-[#073b30] sm:text-5xl lg:text-6xl">
                Choose the drive that fits your journey
              </h2>

              <div className="mx-auto mt-6 flex items-center justify-center gap-3">
                <span className="h-px w-16 bg-[#c8a45d]/60 sm:w-20" />
                <span className="size-2 rotate-45 bg-[#c8a45d]" />
                <span className="h-px w-16 bg-[#c8a45d]/60 sm:w-20" />
              </div>

              <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-7 text-[#596b65] sm:text-base sm:leading-8">
                From effortless city drives to prestigious escapes,
                find the collection that matches your stay in
                Marrakech.
              </p>
            </div>

            <div className="mt-14 grid items-start gap-9 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
              {[
                {
                  number: "01",
                  name: "City",
                  models: "Dacia · Renault Clio 5",
                  description:
                    "Comfortable and efficient vehicles for the medina, restaurants, hotels and everyday travel through Marrakech.",
                  image: "/images/journey-city.png",
                  rotation: "xl:-rotate-[1.25deg]",
                  action: "Explore city cars",
                },
                {
                  number: "02",
                  name: "Premium",
                  models: "Audi A3 S line · Mercedes CLA",
                  description:
                    "Refined comfort and elegant design for business journeys, luxury hotels and distinguished arrivals.",
                  image: "/images/journey-premium.png",
                  rotation: "xl:rotate-[1deg]",
                  action: "Explore premium cars",
                },
                {
                  number: "03",
                  name: "Luxury",
                  models: "Porsche Macan",
                  description:
                    "Prestigious performance for private resorts, Atlas Mountain escapes and unforgettable experiences.",
                  image: "/images/journey-luxury.png",
                  rotation: "xl:-rotate-[1deg]",
                  action: "Explore luxury cars",
                },
              ].map((collection, index) => {
                const message = encodeURIComponent(
                  `Hello KT Luxury Cars, I am interested in the ${collection.name} collection. Please send me the available vehicles, exact prices and delivery options.`,
                );

                return (
                  <article
                    key={collection.name}
                    className={`group relative w-full max-w-[540px] justify-self-center overflow-hidden rounded-[16px] border border-[#d8cdbb] bg-white shadow-[0_24px_55px_rgba(24,48,41,0.14)] transition duration-500 hover:z-10 hover:rotate-0 hover:-translate-y-2 hover:shadow-[0_34px_75px_rgba(24,48,41,0.22)] ${
                      index === 2
                        ? "md:col-span-2 xl:col-span-1"
                        : ""
                    } ${collection.rotation}`}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={collection.image}
                        alt={`${collection.name} car collection in Marrakech`}
                        className="size-full object-cover transition duration-700 group-hover:scale-[1.045]"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#031813] via-[#031813]/5 to-black/10" />

                      <span className="absolute left-5 top-5 z-10 flex size-11 items-center justify-center rounded-full border border-[#c8a45d]/60 bg-[#073b30]/90 font-heading text-lg font-semibold text-[#d8b868]">
                        {collection.number}
                      </span>

                      <div className="absolute inset-x-5 top-7 rounded-[10px] border border-[#c8a45d]/40 bg-[#073b30]/95 px-4 py-5 text-center shadow-[0_12px_30px_rgba(0,0,0,0.2)] backdrop-blur-md sm:inset-x-7 sm:px-5">
                        <h3 className="font-heading text-3xl font-semibold uppercase tracking-[0.05em] text-[#d8b868] sm:text-4xl">
                          {collection.name}
                        </h3>

                        <p className="mx-auto mt-2 max-w-xs text-sm font-semibold leading-6 text-white">
                          {collection.models}
                        </p>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                        <p className="max-w-md text-sm leading-7 text-white/90">
                          {collection.description}
                        </p>

                        <a
                          href={`https://wa.me/${phone}?text=${message}`}
                          target="_blank"
                          rel="noreferrer"
                          className="group/link mt-5 flex min-h-15 w-full items-center justify-between border-t border-[#c8a45d]/55 pt-4 text-sm font-bold text-[#e3c474]"
                        >
                          <span className="border-b border-[#c8a45d] pb-1">
                            {collection.action}
                          </span>

                          <span className="flex size-12 items-center justify-center rounded-full border border-[#c8a45d]/70 bg-[#073b30]/85 transition group-hover/link:bg-[#c8a45d] group-hover/link:text-[#073b30]">
                            <ArrowRight className="size-5" />
                          </span>
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-14 grid overflow-hidden rounded-[20px] border border-[#ddd1be] bg-white shadow-[0_18px_45px_rgba(24,48,41,0.08)] md:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Clear rental terms",
                  text: "Conditions confirmed before booking.",
                },
                {
                  icon: MapPin,
                  title: "Private delivery",
                  text: "Airport, hotel, riad or villa.",
                },
                {
                  icon: MessageCircle,
                  title: "Direct assistance",
                  text: "A local team throughout your stay.",
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={`flex items-start gap-4 p-6 ${
                      index < 2
                        ? "border-b border-[#e1d7c7] md:border-b-0 md:border-r"
                        : ""
                    }`}
                  >
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#073b30] text-[#d8b868]">
                      <Icon className="size-5" />
                    </span>

                    <div>
                      <p className="font-heading text-xl font-semibold text-[#073b30]">
                        {item.title}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#697972]">
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
          className="relative overflow-hidden bg-[#eee5d8] px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
        >
          <div className="absolute -right-32 top-0 size-[520px] rounded-full bg-[#c8a45d]/10 blur-3xl" />

          <div className="relative mx-auto max-w-[1400px]">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9a762f]">
                  Available vehicles
                </p>

                <h2 className="mt-4 font-heading text-4xl font-semibold leading-tight text-[#073b30] sm:text-5xl lg:text-6xl">
                  Selected for the road.

                  <span className="block italic text-[#a47d2f]">
                    Prepared for you.
                  </span>
                </h2>
              </div>

              <div>
                <p className="text-base leading-8 text-[#596b65]">
                  Explore the vehicles currently available from our
                  Marrakech fleet. Every vehicle is cleaned, inspected
                  and prepared before delivery.
                </p>

                <div className="mt-5 flex flex-wrap gap-5 text-sm font-medium text-[#35574d]">
                  <span className="flex items-center gap-2">
                    <Check className="size-4 text-[#a47d2f]" />
                    Real availability
                  </span>

                  <span className="flex items-center gap-2">
                    <Check className="size-4 text-[#a47d2f]" />
                    Clear prices
                  </span>

                  <span className="flex items-center gap-2">
                    <Check className="size-4 text-[#a47d2f]" />
                    Private delivery
                  </span>
                </div>
              </div>
            </div>

            {vehicles.length === 0 ? (
              <div className="mt-14 rounded-[26px] border border-[#d8cdbb] bg-white p-10 text-center shadow-[0_24px_60px_rgba(24,48,41,0.1)]">
                <Sparkles className="mx-auto size-8 text-[#a47d2f]" />

                <h3 className="mt-5 font-heading text-3xl font-semibold text-[#073b30]">
                  Contact us for current availability.
                </h3>

                <p className="mx-auto mt-4 max-w-xl leading-7 text-[#596b65]">
                  Send us your dates and preferred category. We will
                  reply with the available vehicles and exact prices.
                </p>

                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 inline-flex min-h-14 items-center gap-3 rounded-[10px] bg-[#128c5a] px-8 text-sm font-bold text-white"
                >
                  <MessageCircle className="size-5" />
                  Request availability
                </a>
              </div>
            ) : (
              <div
                className={`mt-14 grid gap-7 ${
                  vehicles.length === 1
                    ? "grid-cols-1"
                    : vehicles.length === 2
                      ? "mx-auto max-w-5xl md:grid-cols-2"
                      : "md:grid-cols-2 xl:grid-cols-3"
                }`}
              >
                {vehicles.map((vehicle) => {
                  const cover =
                    vehicle.images.find(
                      (image) => image.isCover,
                    ) ?? vehicle.images[0];

                  const message = encodeURIComponent(
                    `Hello KT Luxury Cars, I am interested in the ${vehicle.brand} ${vehicle.model}. Please confirm its availability, exact price and delivery options.`,
                  );

                  const singleVehicle = vehicles.length === 1;

                  return (
                    <article
                      key={vehicle.id}
                      className={`group overflow-hidden rounded-[24px] border border-[#d8cdbb] bg-white shadow-[0_24px_60px_rgba(24,48,41,0.12)] ${
                        singleVehicle
                          ? "grid lg:grid-cols-[1.15fr_0.85fr]"
                          : ""
                      }`}
                    >
                      <div
                        className={`relative overflow-hidden bg-[#ded4c4] ${
                          singleVehicle
                            ? "min-h-[420px] lg:min-h-[580px]"
                            : "aspect-[4/3]"
                        }`}
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
                          <div className="flex size-full min-h-80 items-center justify-center">
                            <Sparkles className="size-8 text-[#a47d2f]" />
                          </div>
                        )}

                        <span className="absolute left-5 top-5 rounded-[8px] bg-[#f8f2e8] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#073b30] shadow">
                          {categoryLabels[vehicle.category]}
                        </span>

                        {vehicle.featured && (
                          <span className="absolute right-5 top-5 flex items-center gap-2 rounded-[8px] bg-[#073b30]/92 px-4 py-2 text-[10px] font-bold text-white">
                            <Sparkles className="size-3 text-[#d8b868]" />
                            Featured
                          </span>
                        )}
                      </div>

                      <div
                        className={`flex flex-col justify-center ${
                          singleVehicle
                            ? "p-7 sm:p-10 lg:p-12"
                            : "p-6"
                        }`}
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a47d2f]">
                          {vehicle.year} ·{" "}
                          {vehicle.transmission.toLowerCase()}
                        </p>

                        <h3
                          className={`mt-3 font-heading font-semibold text-[#073b30] ${
                            singleVehicle
                              ? "text-4xl lg:text-5xl"
                              : "text-3xl"
                          }`}
                        >
                          {vehicle.brand} {vehicle.model}
                        </h3>

                        {vehicle.trim && (
                          <p className="mt-2 text-sm text-[#697972]">
                            {vehicle.trim}
                          </p>
                        )}

                        <div className="mt-6 border-y border-[#e1d7c7] py-6">
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7b8b84]">
                            Daily rate
                          </p>

                          <p className="mt-2 font-heading text-3xl font-semibold text-[#a47d2f]">
                            {formatPrice(vehicle.dailyPrice)} MAD
                          </p>

                          <p className="text-sm text-[#697972]">
                            per day
                          </p>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                          {[
                            {
                              value: vehicle.seats,
                              label: "Seats",
                            },
                            {
                              value: vehicle.doors,
                              label: "Doors",
                            },
                            {
                              value: vehicle.fuelType.toLowerCase(),
                              label: "Fuel",
                            },
                            {
                              value:
                                vehicle.transmission.toLowerCase(),
                              label: "Gearbox",
                            },
                          ].map((specification) => (
                            <div
                              key={specification.label}
                              className="rounded-[12px] bg-[#f5efe5] p-4 text-center"
                            >
                              <p className="text-sm font-bold capitalize text-[#073b30]">
                                {specification.value}
                              </p>

                              <p className="mt-1 text-xs text-[#697972]">
                                {specification.label}
                              </p>
                            </div>
                          ))}
                        </div>

                        <a
                          href={`https://wa.me/${phone}?text=${message}`}
                          target="_blank"
                          rel="noreferrer"
                          className="group/link mt-7 flex min-h-16 items-center justify-between rounded-[10px] bg-[#073b30] px-6 text-sm font-bold text-white transition hover:bg-[#0b4b3d]"
                        >
                          Check availability

                          <span className="flex size-11 items-center justify-center rounded-full bg-[#c8a45d] text-[#073b30]">
                            <ArrowRight className="size-5 transition-transform group-hover/link:translate-x-1" />
                          </span>
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section
          id="services"
          className="bg-[#f8f2e8] px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
        >
          <div className="mx-auto max-w-[1400px]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9a762f]">
                More than a rental
              </p>

              <h2 className="mt-4 font-heading text-4xl font-semibold text-[#073b30] sm:text-5xl lg:text-6xl">
                Your local road concierge.
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#596b65]">
                We know Marrakech and beyond. From hidden riads to
                Atlas escapes, we deliver the right vehicle and local
                assistance so you can travel with confidence.
              </p>
            </div>

            <div
              id="why-kt"
              className="mt-14 grid gap-6 md:grid-cols-3"
            >
              {[
                {
                  icon: MapPin,
                  title: "Private delivery",
                  text: "Delivery to Marrakech Airport, your hotel, riad or private villa.",
                },
                {
                  icon: Clock3,
                  title: "Direct assistance",
                  text: "Communicate directly with our Marrakech team throughout your rental.",
                },
                {
                  icon: ShieldCheck,
                  title: "Prepared vehicles",
                  text: "Every vehicle is cleaned, inspected and prepared before handover.",
                },
              ].map((service) => {
                const Icon = service.icon;

                return (
                  <article
                    key={service.title}
                    className="rounded-[20px] border border-[#ddd1be] bg-white p-8 shadow-[0_16px_40px_rgba(24,48,41,0.07)]"
                  >
                    <div className="flex size-13 items-center justify-center rounded-full bg-[#073b30] text-[#d8b868]">
                      <Icon className="size-6" />
                    </div>

                    <h3 className="mt-7 font-heading text-2xl font-semibold text-[#073b30]">
                      {service.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-[#596b65]">
                      {service.text}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#f8f2e8] px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32">
          <div className="mx-auto max-w-[1400px] rounded-[28px] bg-[#052b23] px-6 py-20 text-center text-white shadow-[0_30px_80px_rgba(5,43,35,0.2)] sm:px-10 lg:py-24">
            <MessageCircle className="mx-auto size-9 text-[#d8b868]" />

            <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-[#d8b868]">
              Direct reservation assistance
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl font-heading text-4xl font-semibold sm:text-5xl lg:text-6xl">
              Ready to drive?
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/70">
              Send us your dates, preferred category and delivery
              location. We will reply with the available vehicles,
              exact prices and rental conditions.
            </p>

            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="mt-9 inline-flex min-h-16 items-center gap-3 rounded-[12px] bg-[#128c5a] px-9 text-sm font-bold text-white transition hover:bg-[#0f774c]"
            >
              <MessageCircle className="size-5" />
              Book on WhatsApp
              <ArrowRight className="size-5" />
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}