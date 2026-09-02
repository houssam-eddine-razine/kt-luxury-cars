import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Check,
} from "lucide-react";

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
          Register the vehicle, then add its photographs and choose
          the website cover.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
            1
          </span>

          <div>
            <p className="font-semibold">
              Vehicle information
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Specifications, prices, descriptions and visibility.
            </p>
          </div>

          <Check className="ml-auto size-5 text-primary" />
        </div>

        <div className="flex items-start gap-4 rounded-xl border bg-background p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
            2
          </span>

          <div>
            <p className="font-semibold">
              Vehicle photographs
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Add up to 12 photographs and select the cover.
            </p>
          </div>

          <Camera className="ml-auto size-5 text-muted-foreground" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step 1 — Vehicle information</CardTitle>
        </CardHeader>

        <CardContent>
          <VehicleForm />
        </CardContent>
      </Card>
    </div>
  );
}