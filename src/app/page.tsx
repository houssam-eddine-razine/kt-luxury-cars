/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
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

import { BookingBar } from "@/components/public/booking-bar";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { TrustStats } from "@/components/public/trust-stats";
import { prisma } from "@/lib/prisma";

const phone = "212619019549";

const whatsapp = `https://wa.me/${phone}?text=${encodeURIComponent(
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
  const [vehicles, vehicleCount] = await Promise.all([
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

  const questions = [
    {
      question: "How do I request a vehicle?",
      answer:
        "Select your pick-up location, rental dates and preferred category. Your request will open in WhatsApp, where our team will confirm the exact vehicle, price and conditions.",
    },
    {
      question: "Is online payment required?",
      answer:
        "No online payment is required through this website. Your request is sent directly to our team, and all payment information and rental conditions are confirmed with you before the reservation.",
    },
    {
      question: "Is website availability final?",
      answer:
        "The website displays our current selection. Final availability is confirmed directly by our team because vehicles may already be under request for the same dates.",
    },
    {
      question: "Where can the vehicle be delivered?",
      answer:
        "You can request delivery to Marrakech Airport, your hotel, riad, private villa or another agreed location in Marrakech.",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F2E9] pb-20 text-[#17212B] lg:pb-0">
      <SiteHeader />

      <main>
        <section className="relative isolate min-h-[680px] overflow-hidden bg-[#0B1726] sm:min-h-[780px]">
          <img
            src="/images/kt-hero.png"
            alt="KT Luxury Cars vehicle in Marrakech"
            className="absolute inset-0 -z-20 size-full object-cover object-[68%_center] sm:object-[70%_center]"
          />

          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(7,17,30,0.99)_0%,rgba(7,17,30,0.94)_38%,rgba(11,23,38,0.55)_68%,rgba(11,23,38,0.16)_100%)]" />

          <div className="absolute inset-0 -z-10 bg-[#0B1726]/15 mix-blend-color" />

          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#07111E]/75 via-transparent to-black/25" />

          <div className="mx-auto flex min-h-[680px] max-w-[1480px] items-center px-5 pb-20 pt-28 sm:min-h-[780px] sm:px-8 sm:pb-28 sm:pt-32 lg:px-12">
            <div className="max-w-3xl">
              <p className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#DBBC70] sm:gap-4 sm:text-sm sm:tracking-[0.22em]">
                <span className="h-px w-8 bg-[#C8A45D] sm:w-11" />
                Private car rental in Marrakech
              </p>

              <h1 className="mt-6 font-heading text-[46px] font-semibold leading-[0.96] tracking-[-0.035em] text-white sm:mt-8 sm:text-6xl md:text-7xl lg:text-[86px]">
                Marrakech begins

                <span className="mt-1 block italic text-[#DBB968]">
                  with the right car.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-[15px] leading-7 text-white/80 sm:mt-8 sm:text-lg sm:leading-8">
                From city drives to luxury escapes, explore Marrakech
                with a carefully selected vehicle delivered wherever
                you need it.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                <Link
                  href="#collection"
                  className="group inline-flex min-h-14 w-full items-center justify-center gap-4 rounded-[10px] bg-[#C8A45D] px-6 text-xs font-bold uppercase tracking-[0.12em] text-[#0B1726] transition hover:bg-[#D9B86F] sm:min-h-15 sm:w-auto sm:px-8 sm:tracking-[0.14em]"
                >
                  Explore our fleet

                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-[10px] border border-[#C8A45D]/70 bg-[#0B1726]/70 px-6 text-xs font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition hover:bg-[#C8A45D] hover:text-[#0B1726] sm:min-h-15 sm:w-auto sm:px-8 sm:tracking-[0.14em]"
                >
                  <MessageCircle className="size-5" />
                  WhatsApp concierge
                </a>
              </div>

              <div className="mt-8 grid gap-3 text-sm text-white/75 sm:mt-10 sm:flex sm:flex-wrap sm:gap-x-8">
                <span className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-[#DBB968]" />
                  Airport delivery
                </span>

                <span className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-[#DBB968]" />
                  Clear rental terms
                </span>

                <span className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-[#DBB968]" />
                  Direct local assistance
                </span>
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
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#9A762F] sm:text-base sm:tracking-[0.2em]">
                Our collections
              </p>

              <h2 className="mt-4 font-heading text-4xl font-semibold leading-[1.08] tracking-[-0.025em] text-[#0B1726] sm:text-5xl lg:text-6xl">
                Choose the drive that fits your journey
              </h2>

              <div className="mx-auto mt-6 flex items-center justify-center gap-3">
                <span className="h-px w-16 bg-[#C8A45D]/60 sm:w-20" />
                <span className="size-2 rotate-45 bg-[#C8A45D]" />
                <span className="h-px w-16 bg-[#C8A45D]/60 sm:w-20" />
              </div>

              <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-7 text-[#66727D] sm:text-base sm:leading-8">
                From effortless city drives to prestigious escapes,
                find the collection that matches your stay in
                Marrakech.
              </p>
            </div>

            <div className="mt-10 grid items-start gap-7 sm:mt-14 sm:gap-9 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
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
                  <ScrollReveal
                    key={collection.name}
                    direction={index === 0 ? "left" : "up"}
                    delay={Math.min(index * 100, 250)}
                    className={`h-full ${
                      index === 2
                        ? "md:col-span-2 xl:col-span-1"
                        : ""
                    }`}
                  >
                    <article
                      className={`group relative mx-auto h-full w-full max-w-[540px] overflow-hidden rounded-[16px] border border-[#D8CDBB] bg-[#FFFCF7] shadow-[0_24px_55px_rgba(11,23,38,0.12)] transition duration-500 hover:z-10 hover:rotate-0 hover:-translate-y-2 hover:shadow-[0_34px_75px_rgba(11,23,38,0.2)] ${collection.rotation}`}
                    >
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <img
                          src={collection.image}
                          alt={`${collection.name} car collection in Marrakech`}
                          className="size-full object-cover transition duration-700 group-hover:scale-[1.045]"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-[#07111E] via-[#07111E]/5 to-black/10" />

                        <span className="absolute left-4 top-4 z-10 flex size-10 items-center justify-center rounded-full border border-[#C8A45D]/60 bg-[#0B1726]/90 font-heading text-base font-semibold text-[#D8B868] sm:left-5 sm:top-5 sm:size-11 sm:text-lg">
                          {collection.number}
                        </span>

                        <div className="absolute inset-x-4 top-6 rounded-[10px] border border-[#C8A45D]/40 bg-[#0B1726]/95 px-4 py-4 text-center shadow-[0_12px_30px_rgba(0,0,0,0.2)] backdrop-blur-md sm:inset-x-7 sm:top-7 sm:px-5 sm:py-5">
                          <h3 className="font-heading text-3xl font-semibold uppercase tracking-[0.05em] text-[#D8B868] sm:text-4xl">
                            {collection.name}
                          </h3>

                          <p className="mx-auto mt-2 max-w-xs text-xs font-semibold leading-5 text-white sm:text-sm sm:leading-6">
                            {collection.models}
                          </p>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                          <p className="max-w-md text-sm leading-6 text-white/90 sm:leading-7">
                            {collection.description}
                          </p>

                          <a
                            href={`https://wa.me/${phone}?text=${message}`}
                            target="_blank"
                            rel="noreferrer"
                            className="group/link mt-5 flex min-h-14 w-full items-center justify-between border-t border-[#C8A45D]/55 pt-4 text-sm font-bold text-[#E3C474] sm:min-h-15"
                          >
                            <span className="border-b border-[#C8A45D] pb-1">
                              {collection.action}
                            </span>

                            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#C8A45D]/70 bg-[#0B1726]/85 transition group-hover/link:bg-[#C8A45D] group-hover/link:text-[#0B1726] sm:size-12">
                              <ArrowRight className="size-5" />
                            </span>
                          </a>
                        </div>
                      </div>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>

            <div className="mt-12 grid overflow-hidden rounded-[20px] border border-[#DDD1BE] bg-[#FFFCF7] shadow-[0_18px_45px_rgba(11,23,38,0.08)] sm:mt-14 md:grid-cols-3">
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
                    className={`flex items-start gap-4 p-5 sm:p-6 ${
                      index < 2
                        ? "border-b border-[#E1D7C7] md:border-b-0 md:border-r"
                        : ""
                    }`}
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0B1726] text-[#D8B868] sm:size-12">
                      <Icon className="size-5" />
                    </span>

                    <div>
                      <p className="font-heading text-xl font-semibold text-[#0B1726]">
                        {item.title}
                      </p>

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
          className="relative overflow-hidden bg-[#EFE8DC] px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-32"
        >
          <div className="absolute -right-32 top-0 size-[520px] rounded-full bg-[#C8A45D]/10 blur-3xl" />

          <div className="relative mx-auto max-w-[1400px]">
            <div className="grid gap-7 sm:gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#9A762F] sm:text-base sm:tracking-[0.2em]">
                  Available vehicles
                </p>

                <h2 className="mt-4 font-heading text-4xl font-semibold leading-tight text-[#0B1726] sm:text-5xl lg:text-6xl">
                  Selected for the road.

                  <span className="block italic text-[#A47D2F]">
                    Prepared for you.
                  </span>
                </h2>
              </div>

              <div>
                <p className="text-[15px] leading-7 text-[#66727D] sm:text-base sm:leading-8">
                  Explore the vehicles currently available from our
                  Marrakech fleet. Every vehicle is cleaned, inspected
                  and prepared before delivery.
                </p>

                <div className="mt-5 grid gap-3 text-sm font-medium text-[#4F5E6B] sm:flex sm:flex-wrap sm:gap-5">
                  <span className="flex items-center gap-2">
                    <Check className="size-4 text-[#A47D2F]" />
                    Real availability
                  </span>

                  <span className="flex items-center gap-2">
                    <Check className="size-4 text-[#A47D2F]" />
                    Clear prices
                  </span>

                  <span className="flex items-center gap-2">
                    <Check className="size-4 text-[#A47D2F]" />
                    Private delivery
                  </span>
                </div>
              </div>
            </div>

            {vehicles.length === 0 ? (
              <div className="mt-10 rounded-[26px] border border-[#D8CDBB] bg-[#FFFCF7] p-7 text-center shadow-[0_24px_60px_rgba(11,23,38,0.1)] sm:mt-14 sm:p-10">
                <Sparkles className="mx-auto size-8 text-[#A47D2F]" />

                <h3 className="mt-5 font-heading text-3xl font-semibold text-[#0B1726]">
                  Contact us for current availability.
                </h3>

                <p className="mx-auto mt-4 max-w-xl leading-7 text-[#66727D]">
                  Send us your dates and preferred category. We will
                  reply with the available vehicles and exact prices.
                </p>

                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 inline-flex min-h-14 items-center gap-3 rounded-[10px] bg-[#128C5A] px-8 text-sm font-bold text-white"
                >
                  <MessageCircle className="size-5" />
                  Request availability
                </a>
              </div>
            ) : (
              <div
                className={`mt-10 grid gap-6 sm:mt-14 sm:gap-7 ${
                  vehicles.length === 1
                    ? "grid-cols-1"
                    : vehicles.length === 2
                      ? "mx-auto max-w-5xl md:grid-cols-2"
                      : "md:grid-cols-2 xl:grid-cols-3"
                }`}
              >
                {vehicles.map((vehicle, index) => {
                  const cover =
                    vehicle.images.find(
                      (image) => image.isCover,
                    ) ?? vehicle.images[0];

                  const singleVehicle = vehicles.length === 1;

                  return (
                    <ScrollReveal
                      key={vehicle.id}
                      direction={index === 0 ? "left" : "up"}
                      delay={Math.min(index * 90, 270)}
                      className="h-full"
                    >
                      <article
                        className={`group h-full overflow-hidden rounded-[20px] border border-[#D8CDBB] bg-[#FFFCF7] shadow-[0_18px_45px_rgba(11,23,38,0.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(11,23,38,0.16)] ${
                          singleVehicle
                            ? "grid lg:grid-cols-[1.1fr_0.9fr]"
                            : ""
                        }`}
                      >
                        <Link
                          href={`/vehicles/${vehicle.slug}`}
                          aria-label={`View ${vehicle.brand} ${vehicle.model}`}
                          className={`relative block overflow-hidden bg-[#E4DDD2] ${
                            singleVehicle
                              ? "min-h-[330px] sm:min-h-[380px] lg:min-h-[480px]"
                              : "aspect-[16/10]"
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
                            <span className="absolute inset-0 flex items-center justify-center">
                              <Sparkles className="size-8 text-[#A47D2F]" />
                            </span>
                          )}

                          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#07111E]/65 to-transparent" />

                          <span className="absolute left-4 top-4 rounded-[8px] bg-[#F7F2E9]/95 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#0B1726] shadow backdrop-blur-sm sm:text-[10px]">
                            {categoryLabels[vehicle.category]}
                          </span>

                          {vehicle.featured && (
                            <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-[8px] bg-[#0B1726]/92 px-3 py-2 text-[9px] font-bold text-white backdrop-blur-sm sm:text-[10px]">
                              <Sparkles className="size-3 text-[#D8B868]" />
                              Featured
                            </span>
                          )}
                        </Link>

                        <div
                          className={`flex flex-col ${
                            singleVehicle
                              ? "justify-center p-6 sm:p-8 lg:p-10"
                              : "p-5"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#A47D2F]">
                                {vehicle.year} ·{" "}
                                {vehicle.transmission.toLowerCase()}
                              </p>

                              <h3
                                className={`mt-1.5 truncate font-heading font-semibold text-[#0B1726] ${
                                  singleVehicle
                                    ? "text-4xl lg:text-5xl"
                                    : "text-[28px]"
                                }`}
                              >
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
                                From
                              </p>

                              <p className="mt-1 font-heading text-2xl font-semibold leading-none text-[#A47D2F]">
                                {formatPrice(vehicle.dailyPrice)}
                              </p>

                              <p className="mt-1 text-[10px] text-[#74808A]">
                                MAD / day
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-4 divide-x divide-[#DDD1BE] rounded-[11px] bg-[#F1ECE4] px-1 py-3">
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
                                value:
                                  vehicle.fuelType.toLowerCase(),
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
                                className="min-w-0 px-1 text-center"
                              >
                                <p className="truncate text-[11px] font-bold capitalize text-[#0B1726] sm:text-xs">
                                  {specification.value}
                                </p>

                                <p className="mt-0.5 truncate text-[8px] text-[#74808A] sm:text-[9px]">
                                  {specification.label}
                                </p>
                              </div>
                            ))}
                          </div>

                          <Link
                            href={`/vehicles/${vehicle.slug}`}
                            className="group/link mt-4 flex min-h-12 items-center justify-between rounded-[10px] bg-[#0B1726] px-4 text-xs font-bold text-white transition hover:bg-[#162536]"
                          >
                            View vehicle details

                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#C8A45D] text-[#0B1726]">
                              <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-1" />
                            </span>
                          </Link>
                        </div>
                      </article>
                    </ScrollReveal>
                  );
                })}
              </div>
            )}

            <div className="mt-10 text-center">
              <Link
                href="/vehicles"
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-[12px] border border-[#B99752] bg-[#FFFCF7] px-7 text-sm font-bold text-[#0B1726] transition hover:bg-[#0B1726] hover:text-white"
              >
                View the complete fleet

                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[#0B1726] px-5 py-16 text-white sm:px-8 sm:py-24 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1400px]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#D8B868] sm:text-base sm:tracking-[0.2em]">
                Simple reservation
              </p>

              <h2 className="mt-4 font-heading text-4xl font-semibold sm:text-5xl lg:text-6xl">
                Reserve in three clear steps.
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-white/65 sm:text-base sm:leading-8">
                No complicated online process. Choose your vehicle,
                send your request and confirm everything directly
                with our Marrakech team.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-6 md:grid-cols-3">
              {[
                {
                  number: "01",
                  icon: Search,
                  title: "Choose your vehicle",
                  text: "Explore the current fleet and select the vehicle that fits your stay.",
                },
                {
                  number: "02",
                  icon: CalendarCheck,
                  title: "Send your dates",
                  text: "Share your pick-up location, rental dates and preferred category.",
                },
                {
                  number: "03",
                  icon: KeyRound,
                  title: "Confirm and drive",
                  text: "Our team confirms the vehicle, price, conditions and delivery details.",
                },
              ].map((step, index) => {
                const Icon = step.icon;

                return (
                  <ScrollReveal
                    key={step.number}
                    direction="up"
                    delay={Math.min(index * 120, 300)}
                    className="h-full"
                  >
                    <article className="relative h-full overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.05] p-6 sm:p-8">
                      <span className="absolute right-5 top-4 font-heading text-5xl font-semibold text-white/[0.06]">
                        {step.number}
                      </span>

                      <div className="flex size-12 items-center justify-center rounded-full bg-[#C8A45D] text-[#0B1726]">
                        <Icon className="size-5" />
                      </div>

                      <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#D8B868]">
                        Step {step.number}
                      </p>

                      <h3 className="mt-2 font-heading text-2xl font-semibold">
                        {step.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-white/65">
                        {step.text}
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
                className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-[12px] bg-[#C8A45D] px-7 text-sm font-bold text-[#0B1726] transition hover:bg-[#D9B86F] sm:w-auto"
              >
                <MessageCircle className="size-5" />
                Start your request
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </section>

        <section
          id="services"
          className="bg-[#F7F2E9] px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-32"
        >
          <div className="mx-auto max-w-[1400px]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#9A762F] sm:text-base sm:tracking-[0.2em]">
                More than a rental
              </p>

              <h2 className="mt-4 font-heading text-4xl font-semibold text-[#0B1726] sm:text-5xl lg:text-6xl">
                Your local road concierge.
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-7 text-[#66727D] sm:text-base sm:leading-8">
                We know Marrakech and beyond. From hidden riads to
                Atlas escapes, we deliver the right vehicle and local
                assistance so you can travel with confidence.
              </p>
            </div>

            <div
              id="why-kt"
              className="mt-10 grid gap-5 sm:mt-14 sm:gap-6 md:grid-cols-3"
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
              ].map((service, index) => {
                const Icon = service.icon;

                return (
                  <ScrollReveal
                    key={service.title}
                    direction="up"
                    delay={Math.min(index * 100, 250)}
                    className="h-full"
                  >
                    <article className="h-full rounded-[20px] border border-[#DDD1BE] bg-[#FFFCF7] p-6 shadow-[0_16px_40px_rgba(11,23,38,0.07)] sm:p-8">
                      <div className="flex size-12 items-center justify-center rounded-full bg-[#0B1726] text-[#D8B868] sm:size-13">
                        <Icon className="size-5 sm:size-6" />
                      </div>

                      <h3 className="mt-6 font-heading text-2xl font-semibold text-[#0B1726] sm:mt-7">
                        {service.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-[#66727D] sm:mt-4">
                        {service.text}
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
          className="bg-[#EFE8DC] px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-28"
        >
          <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#9A762F] sm:text-base sm:tracking-[0.2em]">
                Helpful information
              </p>

              <h2 className="mt-4 font-heading text-4xl font-semibold leading-tight text-[#0B1726] sm:text-5xl">
                Questions before you reserve?
              </h2>

              <p className="mt-5 max-w-lg text-[15px] leading-7 text-[#66727D] sm:text-base sm:leading-8">
                These answers explain how requests work. The exact
                rental conditions for your selected vehicle are
                confirmed directly before booking.
              </p>

              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex min-h-13 items-center gap-3 rounded-[11px] bg-[#0B1726] px-6 text-sm font-bold text-white transition hover:bg-[#162536]"
              >
                <MessageCircle className="size-5 text-[#D8B868]" />
                Ask us directly
              </a>
            </div>

            <div className="space-y-3">
              {questions.map((item) => (
                <details
                  key={item.question}
                  className="group overflow-hidden rounded-[16px] border border-[#D8CDBB] bg-[#FFFCF7] shadow-[0_10px_30px_rgba(11,23,38,0.05)]"
                >
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 px-5 py-4 text-left font-heading text-lg font-semibold text-[#0B1726] marker:hidden sm:px-6 sm:text-xl [&::-webkit-details-marker]:hidden">
                    {item.question}

                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F1ECE4] text-[#A47D2F]">
                      <ChevronDown className="size-4 transition-transform duration-300 group-open:rotate-180" />
                    </span>
                  </summary>

                  <div className="border-t border-[#E1D7C7] px-5 py-5 sm:px-6">
                    <p className="text-sm leading-7 text-[#66727D]">
                      {item.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F7F2E9] px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
          <ScrollReveal direction="up">
            <div className="mx-auto max-w-[1400px] rounded-[24px] bg-[#0B1726] px-5 py-14 text-center text-white shadow-[0_30px_80px_rgba(11,23,38,0.2)] sm:rounded-[28px] sm:px-10 sm:py-20 lg:py-24">
              <MessageCircle className="mx-auto size-8 text-[#D8B868] sm:size-9" />

              <p className="mt-5 text-sm font-extrabold uppercase tracking-[0.18em] text-[#D8B868] sm:mt-6 sm:text-base sm:tracking-[0.2em]">
                Direct reservation assistance
              </p>

              <h2 className="mx-auto mt-4 max-w-3xl font-heading text-4xl font-semibold sm:text-5xl lg:text-6xl">
                Ready to drive?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-white/70 sm:mt-6 sm:text-base sm:leading-8">
                Send us your dates, preferred category and delivery
                location. We will reply with the available vehicles,
                exact prices and rental conditions.
              </p>

              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-[12px] bg-[#128C5A] px-6 text-sm font-bold text-white transition hover:bg-[#0F774C] sm:mt-9 sm:min-h-16 sm:w-auto sm:px-9"
              >
                <MessageCircle className="size-5" />
                Book on WhatsApp
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
            View cars
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