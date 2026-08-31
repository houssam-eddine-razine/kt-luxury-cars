import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ImageManager } from "./image-manager";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateVehicle } from "../../new/actions";
import { VehicleForm } from "../../new/vehicle-form";

type EditVehiclePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditVehiclePage({
  params,
}: EditVehiclePageProps) {
  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id,
    },
    include: {
      images: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!vehicle) {
    notFound();
  }

  const updateVehicleAction = updateVehicle.bind(
    null,
    vehicle.id,
  );

  const vehicleName = `${vehicle.brand} ${vehicle.model}`;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Link
          href="/admin/vehicles"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
          })}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to vehicles
        </Link>

        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground">
            {vehicle.registration}
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Edit {vehicleName}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Update its photos, specifications, pricing and website
            visibility.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Vehicle gallery</CardTitle>
        </CardHeader>

        <CardContent>
          <ImageManager
            vehicleId={vehicle.id}
            vehicleName={vehicleName}
            images={vehicle.images.map((image) => ({
              id: image.id,
              url: image.url,
              storagePath: image.storagePath,
              altText: image.altText,
              position: image.position,
              isCover: image.isCover,
            }))}
          />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Vehicle information</CardTitle>
        </CardHeader>

        <CardContent>
          <VehicleForm
            mode="edit"
            action={updateVehicleAction}
            initialData={{
              brand: vehicle.brand,
              model: vehicle.model,
              trim: vehicle.trim,
              year: vehicle.year,
              registration: vehicle.registration,
              category: vehicle.category,
              status: vehicle.status,
              transmission: vehicle.transmission,
              fuelType: vehicle.fuelType,
              seats: vehicle.seats,
              doors: vehicle.doors,
              luggage: vehicle.luggage,
              mileage: vehicle.mileage,
              dailyPrice: vehicle.dailyPrice,
              weeklyPrice: vehicle.weeklyPrice,
              monthlyPrice: vehicle.monthlyPrice,
              deposit: vehicle.deposit,
              descriptionFr: vehicle.descriptionFr,
              descriptionEn: vehicle.descriptionEn,
              descriptionAr: vehicle.descriptionAr,
              visible: vehicle.visible,
              featured: vehicle.featured,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}