import type { Metadata } from "next";

import { VehicleBrowser } from "./vehicle-browser";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Car Rental Fleet Marrakech | KT Luxury Cars",
  description:
    "Explore available city, premium, SUV and luxury rental vehicles in Marrakech with private delivery and direct assistance.",
};

export default async function VehiclesPage() {
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
      vehicle.images.find((image) => image.isCover) ??
      vehicle.images[0];

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
    <div className="min-h-screen bg-[#f7f1e7] text-[#12372f]">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-[#0B1726] px-5 pb-16 pt-32 text-white sm:px-8 lg:px-12 lg:pb-20 lg:pt-40">
          <div className="absolute -right-40 top-0 size-[520px] rounded-full bg-[#c8a45d]/10 blur-3xl" />
          <div className="absolute -left-40 bottom-0 size-[440px] rounded-full bg-[#128c5a]/10 blur-3xl" />

          <div className="relative mx-auto max-w-[1400px]">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d8b868]">
              KT Luxury Cars fleet
            </p>

            <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-end">
              <h1 className="max-w-4xl font-heading text-5xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                Find the right car
                <span className="block italic text-[#d8b868]">
                  for Marrakech.
                </span>
              </h1>

              <div>
                <p className="max-w-xl text-base leading-8 text-white/70">
                  Compare the vehicles currently available and choose
                  the one that fits your stay. Availability and final
                  conditions are confirmed directly by our team.
                </p>

                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
                  <span>Private delivery</span>
                  <span className="text-[#d8b868]">â€¢</span>
                  <span>Clear daily rates</span>
                  <span className="text-[#d8b868]">â€¢</span>
                  <span>Direct assistance</span>
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
