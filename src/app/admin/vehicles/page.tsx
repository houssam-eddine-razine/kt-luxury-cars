import Link from "next/link";
import { Car, Plus } from "lucide-react";

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

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(price);

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      images: {
        where: {
          isCover: true,
        },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Vehicles</h1>
          <p className="mt-1 text-muted-foreground">
            Manage the KT Luxury Cars fleet and website availability.
          </p>
        </div>

        <Link
            href="/admin/vehicles/new"
            className={buttonVariants()}
            >
            <Plus className="mr-2 size-4" />
            Add vehicle
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fleet</CardTitle>
          <CardDescription>
            {vehicles.length} vehicle{vehicles.length === 1 ? "" : "s"} registered
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Daily price</TableHead>
                <TableHead>Website</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex flex-col items-center py-14 text-center">
                      <div className="mb-4 rounded-full bg-muted p-4">
                        <Car className="size-7 text-muted-foreground" />
                      </div>

                      <h2 className="font-semibold">No vehicles yet</h2>

                      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                        Add your first vehicle to begin managing your fleet.
                      </p>

                      <Link
                            href="/admin/vehicles/new"
                            className={`${buttonVariants()} mt-5`}
                            >
                            <Plus className="mr-2 size-4" />
                            Add first vehicle
                       </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.trim ?? vehicle.year}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>{vehicle.registration}</TableCell>

                    <TableCell>
                      {vehicle.category.toLowerCase().replace("_", " ")}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">
                        {statusLabels[vehicle.status]}
                      </Badge>
                    </TableCell>

                    <TableCell>{formatPrice(vehicle.dailyPrice)}</TableCell>

                    <TableCell>
                      <Badge variant={vehicle.visible ? "default" : "secondary"}>
                        {vehicle.visible ? "Visible" : "Hidden"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}