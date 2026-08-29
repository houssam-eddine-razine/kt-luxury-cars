import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { VehicleForm } from "./vehicle-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewVehiclePage() {
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

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Add a vehicle
        </h1>

        <p className="mt-1 text-muted-foreground">
          Register a new vehicle and configure its website visibility.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle information</CardTitle>
        </CardHeader>

        <CardContent>
          <VehicleForm />
        </CardContent>
      </Card>
    </div>
  );
}