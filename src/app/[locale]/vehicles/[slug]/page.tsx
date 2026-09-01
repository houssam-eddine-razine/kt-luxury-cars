import VehiclePage from "@/app/vehicles/[slug]/page";
import { VehicleStructuredData } from "@/components/seo/structured-data";
import { prisma } from "@/lib/prisma";

export { generateMetadata } from "@/app/vehicles/[slug]/page";

type LocalizedVehiclePageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export default async function LocalizedVehiclePage({
  params,
}: LocalizedVehiclePageProps) {
  const { locale, slug } = await params;
  const language = locale === "fr" ? "fr" : "en";

  const vehicle = await prisma.vehicle.findFirst({
    where: {
      slug,
      visible: true,
    },
    select: {
      slug: true,
      brand: true,
      model: true,
      trim: true,
      year: true,
      category: true,
      transmission: true,
      fuelType: true,
      seats: true,
      doors: true,
      dailyPrice: true,
      status: true,
      descriptionEn: true,
      descriptionFr: true,
      images: {
        select: {
          url: true,
          isCover: true,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  return (
    <>
      {vehicle && (
        <VehicleStructuredData
          locale={language}
          vehicle={vehicle}
        />
      )}

      <VehiclePage
        params={Promise.resolve({
          slug,
        })}
      />
    </>
  );
}