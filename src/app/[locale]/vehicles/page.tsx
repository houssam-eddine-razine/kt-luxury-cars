import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { prisma } from "@/lib/prisma";

import { VehicleBrowser } from "./vehicle-browser";

export async function generateMetadata(): Promise<Metadata> {
  const translations =
    await getTranslations("FleetMetadata");

  return {
    title: translations("title"),
    description: translations("description"),
  };
}

export default async function VehiclesPage() {
  const translations =
    await getTranslations("Fleet");

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
    include: {
      images: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  const publicVehicles = vehicles.map((vehicle) => {
    const coverImage =
      vehicle.images.find(
        (image) => image.isCover,
      ) ?? vehicle.images[0];

    return {
      id: vehicle.id,
      slug: vehicle.slug,
      brand: vehicle.brand,
      model: vehicle.model,
      trim: vehicle.trim,
      year: vehicle.year,
      category: vehicle.category,
      transmission: vehicle.transmission,
      fuelType: vehicle.fuelType,
      seats: vehicle.seats,
      doors: vehicle.doors,
      dailyPrice: vehicle.dailyPrice,
      featured: vehicle.featured,
      coverImage: coverImage
        ? {
            url: coverImage.url,
            altText: coverImage.altText,
          }
        : null,
    };
  });

  return (
    <div className="min-h-screen bg-[#F7F2E9] text-[#17212B]">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-[#0B1726] px-5 pb-14 pt-32 text-white sm:px-8 sm:pb-16 lg:px-12 lg:pb-20 lg:pt-40">
          <div className="absolute -right-40 top-0 size-[520px] rounded-full bg-[#C8A45D]/10 blur-3xl" />

          <div className="absolute -left-40 bottom-0 size-[440px] rounded-full bg-white/[0.03] blur-3xl" />

          <div className="relative mx-auto max-w-[1400px]">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#D8B868] sm:text-base sm:tracking-[0.2em]">
              {translations("eyebrow")}
            </p>

            <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-end">
              <h1 className="max-w-4xl font-heading text-5xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                {translations("titleFirst")}

                <span className="block italic text-[#D8B868]">
                  {translations("titleSecond")}
                </span>
              </h1>

              <div>
                <p className="max-w-xl text-[15px] leading-7 text-white/70 sm:text-base sm:leading-8">
                  {translations("introduction")}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-white/75">
                  <span>
                    {translations("privateDelivery")}
                  </span>

                  <span
                    aria-hidden="true"
                    className="size-1 rounded-full bg-[#D8B868]"
                  />

                  <span>
                    {translations("clearRates")}
                  </span>

                  <span
                    aria-hidden="true"
                    className="size-1 rounded-full bg-[#D8B868]"
                  />

                  <span>
                    {translations("directAssistance")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <VehicleBrowser vehicles={publicVehicles} />
      </main>

      <SiteFooter />
    </div>
  );
}