import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react";

import { ImageManager } from "./image-manager";
import { VehiclePolicySelector } from "./vehicle-policy-selector";
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

  searchParams: Promise<{
    created?: string;
  }>;
};

export default async function EditVehiclePage({
  params,
  searchParams,
}: EditVehiclePageProps) {
  const { id } = await params;
  const { created } = await searchParams;

  const [vehicle, policies] = await Promise.all([
    prisma.vehicle.findUnique({
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
    }),

    prisma.rentalPolicy.findMany({
      where: {
        active: true,
      },
      orderBy: [
        {
          isDefault: "desc",
        },
        {
          name: "asc",
        },
      ],
      select: {
        id: true,
        name: true,
        isDefault: true,
      },
    }),
  ]);

  if (!vehicle) {
    notFound();
  }

  const updateVehicleAction = updateVehicle.bind(
    null,
    vehicle.id,
  );

  const vehicleName = `${vehicle.brand} ${vehicle.model}`;
  const newlyCreated = created === "true";

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
            {newlyCreated ? "Complete" : "Edit"} {vehicleName}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Manage its photographs, rental policy, specifications,
            pricing and website visibility.
          </p>
        </div>
      </div>

      {newlyCreated && (
        <div className="flex items-start gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0" />

          <div>
            <p className="font-semibold">
              Vehicle information saved successfully
            </p>

            <p className="mt-1 text-sm leading-6">
              Add the vehicle photographs below. You can also assign
              different rental conditions or leave it on the
              default policy.
            </p>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ClipboardCheck className="size-5" />
            </span>

            <div>
              <CardTitle>Rental policy</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Choose the conditions shown on this vehicle’s public
                page.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <VehiclePolicySelector
            vehicleId={vehicle.id}
            currentPolicyId={vehicle.rentalPolicyId}
            policies={policies}
          />
        </CardContent>
      </Card>

      {newlyCreated && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-semibold text-white">
              ✓
            </span>

            <div>
              <p className="font-semibold">
                Vehicle information
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Saved successfully.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
              2
            </span>

            <div>
              <p className="font-semibold">
                Vehicle photographs
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Add photographs and select the cover.
              </p>
            </div>

            <Camera className="ml-auto size-5 text-primary" />
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>
            {newlyCreated
              ? "Step 2 — Vehicle photographs"
              : "Vehicle gallery"}
          </CardTitle>
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