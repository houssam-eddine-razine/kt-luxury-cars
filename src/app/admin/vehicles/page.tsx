import Link from "next/link";
import {
  Calendar,
  Car,
  Fuel,
  Gauge,
  Plus,
  Settings2,
  Users,
} from "lucide-react";

import { deleteVehicle } from "./new/actions";
import { VehicleActions } from "./vehicle-actions";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusLabels: Record<string, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  RENTED: "Rented",
  MAINTENANCE: "Maintenance",
  INACTIVE: "Inactive",
};

const statusStyles: Record<string, string> = {
  AVAILABLE:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  RESERVED:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  RENTED:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  MAINTENANCE:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300",
  INACTIVE:
    "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(price);

const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );

type VehicleThumbnailProps = {
  imageUrl?: string;
  vehicleName: string;
  mobile?: boolean;
};

function VehicleThumbnail({
  imageUrl,
  vehicleName,
  mobile = false,
}: VehicleThumbnailProps) {
  if (imageUrl) {
    return (
      <div
        role="img"
        aria-label={`${vehicleName} cover image`}
        className={
          mobile
            ? "aspect-[16/10] w-full bg-cover bg-center"
            : "size-14 shrink-0 rounded-lg bg-cover bg-center shadow-sm"
        }
        style={{
          backgroundImage: `url(${JSON.stringify(imageUrl)})`,
        }}
      />
    );
  }

  return (
    <div
      className={
        mobile
          ? "flex aspect-[16/10] w-full items-center justify-center bg-muted/60"
          : "flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted"
      }
    >
      <Car
        className={
          mobile
            ? "size-10 text-muted-foreground/60"
            : "size-5 text-muted-foreground"
        }
      />
    </div>
  );
}

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      images: {
        orderBy: [
          {
            isCover: "desc",
          },
          {
            position: "asc",
          },
        ],
        take: 1,
      },
    },
  });

  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "AVAILABLE",
  ).length;

  const rentedVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "RENTED",
  ).length;

  const visibleVehicles = vehicles.filter(
    (vehicle) => vehicle.visible,
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Fleet management
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Vehicles
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Manage the KT Luxury Cars fleet, pricing and website
            availability.
          </p>
        </div>

        <Link
          href="/admin/vehicles/new"
          className={buttonVariants({
            className: "w-full sm:w-auto",
          })}
        >
          <Plus className="mr-2 size-4" />
          Add vehicle
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Total fleet
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {vehicles.length}
              </p>
            </div>

            <div className="rounded-xl bg-primary/10 p-3">
              <Car className="size-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Available
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {availableVehicles}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-950">
              <Gauge className="size-5 text-emerald-700 dark:text-emerald-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Currently rented
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {rentedVehicles}
              </p>
            </div>

            <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-950">
              <Settings2 className="size-5 text-blue-700 dark:text-blue-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Visible online
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {visibleVehicles}
              </p>
            </div>

            <div className="rounded-xl bg-amber-100 p-3 dark:bg-amber-950">
              <Users className="size-5 text-amber-700 dark:text-amber-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-5 rounded-full bg-muted p-5">
              <Car className="size-8 text-muted-foreground" />
            </div>

            <h2 className="text-lg font-semibold">
              No vehicles yet
            </h2>

            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Add your first vehicle to start managing the KT Luxury
              Cars fleet.
            </p>

            <Link
              href="/admin/vehicles/new"
              className={buttonVariants({
                className: "mt-6",
              })}
            >
              <Plus className="mr-2 size-4" />
              Add first vehicle
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="hidden overflow-hidden md:block">
            <CardHeader>
              <CardTitle>Fleet</CardTitle>

              <CardDescription>
                {vehicles.length} vehicle
                {vehicles.length === 1 ? "" : "s"} registered
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">
                      Vehicle
                    </TableHead>

                    <TableHead>Registration</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Daily price</TableHead>
                    <TableHead>Website</TableHead>

                    <TableHead className="pr-6 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {vehicles.map((vehicle) => {
                    const vehicleName =
                      `${vehicle.brand} ${vehicle.model}`;

                    const coverImage =
                      vehicle.images[0]?.url;

                    const deleteAction =
                      deleteVehicle.bind(
                        null,
                        vehicle.id,
                      );

                    return (
                      <TableRow key={vehicle.id}>
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <VehicleThumbnail
                              imageUrl={coverImage}
                              vehicleName={vehicleName}
                            />

                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {vehicleName}
                              </p>

                              <p className="truncate text-sm text-muted-foreground">
                                {vehicle.trim || vehicle.year}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="font-mono text-sm">
                          {vehicle.registration}
                        </TableCell>

                        <TableCell>
                          {formatLabel(vehicle.category)}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              statusStyles[vehicle.status] ?? ""
                            }
                          >
                            {statusLabels[vehicle.status] ??
                              formatLabel(vehicle.status)}
                          </Badge>
                        </TableCell>

                        <TableCell className="font-medium">
                          {formatPrice(vehicle.dailyPrice)}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              vehicle.visible
                                ? "default"
                                : "secondary"
                            }
                          >
                            {vehicle.visible
                              ? "Visible"
                              : "Hidden"}
                          </Badge>
                        </TableCell>

                        <TableCell className="pr-6">
                          <VehicleActions
                            vehicleId={vehicle.id}
                            vehicleName={vehicleName}
                            deleteAction={deleteAction}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="space-y-4 md:hidden">
            <div>
              <h2 className="font-semibold">Fleet</h2>

              <p className="text-sm text-muted-foreground">
                {vehicles.length} vehicle
                {vehicles.length === 1 ? "" : "s"} registered
              </p>
            </div>

            {vehicles.map((vehicle) => {
              const vehicleName =
                `${vehicle.brand} ${vehicle.model}`;

              const coverImage = vehicle.images[0]?.url;

              const deleteAction = deleteVehicle.bind(
                null,
                vehicle.id,
              );

              return (
                <Card
                  key={vehicle.id}
                  className="overflow-hidden"
                >
                  <VehicleThumbnail
                    imageUrl={coverImage}
                    vehicleName={vehicleName}
                    mobile
                  />

                  <CardContent className="space-y-5 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold">
                          {vehicleName}
                        </h3>

                        <p className="mt-1 font-mono text-sm text-muted-foreground">
                          {vehicle.registration}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className={
                          statusStyles[vehicle.status] ?? ""
                        }
                      >
                        {statusLabels[vehicle.status] ??
                          formatLabel(vehicle.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span>{vehicle.year}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Settings2 className="size-4 text-muted-foreground" />

                        <span>
                          {formatLabel(
                            vehicle.transmission,
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Fuel className="size-4 text-muted-foreground" />

                        <span>
                          {formatLabel(vehicle.fuelType)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Users className="size-4 text-muted-foreground" />

                        <span>{vehicle.seats} seats</span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between gap-3 border-t pt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Daily price
                        </p>

                        <p className="mt-1 text-lg font-semibold">
                          {formatPrice(vehicle.dailyPrice)}
                        </p>
                      </div>

                      <Badge
                        variant={
                          vehicle.visible
                            ? "default"
                            : "secondary"
                        }
                      >
                        {vehicle.visible
                          ? "Visible"
                          : "Hidden"}
                      </Badge>
                    </div>

                    <VehicleActions
                      vehicleId={vehicle.id}
                      vehicleName={vehicleName}
                      deleteAction={deleteAction}
                      mobile
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}