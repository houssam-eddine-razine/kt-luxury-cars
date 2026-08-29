"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, Save } from "lucide-react";

import { createVehicle, type VehicleActionState } from "./actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: VehicleActionState = {};

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

function FieldError({
  errors,
}: {
  errors?: string[];
}) {
  if (!errors?.length) return null;

  return (
    <p className="mt-1 text-sm text-destructive">
      {errors[0]}
    </p>
  );
}

export function VehicleForm() {
  const [state, formAction, pending] = useActionState(
    createVehicle,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-8">
      {state.message && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{state.message}</p>
        </div>
      )}

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold">
            Vehicle identity
          </h2>
          <p className="text-sm text-muted-foreground">
            Main administrative and commercial information.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              name="brand"
              placeholder="Audi"
              required
            />
            <FieldError errors={state.errors?.brand} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              name="model"
              placeholder="A3"
              required
            />
            <FieldError errors={state.errors?.model} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trim">Trim</Label>
            <Input
              id="trim"
              name="trim"
              placeholder="S line"
            />
            <FieldError errors={state.errors?.trim} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              name="year"
              type="number"
              min="2000"
              defaultValue={2025}
              required
            />
            <FieldError errors={state.errors?.year} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration">Registration</Label>
            <Input
              id="registration"
              name="registration"
              placeholder="12345-A-26"
              required
            />
            <FieldError errors={state.errors?.registration} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              className={selectClassName}
              defaultValue="PREMIUM"
            >
              <option value="ECONOMY">Economy</option>
              <option value="COMPACT">Compact</option>
              <option value="SUV">SUV</option>
              <option value="PREMIUM">Premium</option>
              <option value="LUXURY">Luxury</option>
            </select>
            <FieldError errors={state.errors?.category} />
          </div>
        </div>
      </section>

      <div className="border-t" />

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold">
            Technical specifications
          </h2>
          <p className="text-sm text-muted-foreground">
            Characteristics displayed to customers.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="transmission">Transmission</Label>
            <select
              id="transmission"
              name="transmission"
              className={selectClassName}
              defaultValue="AUTOMATIC"
            >
              <option value="AUTOMATIC">Automatic</option>
              <option value="MANUAL">Manual</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuelType">Fuel</Label>
            <select
              id="fuelType"
              name="fuelType"
              className={selectClassName}
              defaultValue="DIESEL"
            >
              <option value="GASOLINE">Gasoline</option>
              <option value="DIESEL">Diesel</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ELECTRIC">Electric</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seats">Seats</Label>
            <Input
              id="seats"
              name="seats"
              type="number"
              min="1"
              defaultValue="5"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doors">Doors</Label>
            <Input
              id="doors"
              name="doors"
              type="number"
              min="2"
              defaultValue="5"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="luggage">Luggage capacity</Label>
            <Input
              id="luggage"
              name="luggage"
              type="number"
              min="0"
              defaultValue="2"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mileage">Mileage (km)</Label>
            <Input
              id="mileage"
              name="mileage"
              type="number"
              min="0"
              defaultValue="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Current status</Label>
            <select
              id="status"
              name="status"
              className={selectClassName}
              defaultValue="AVAILABLE"
            >
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="RENTED">Rented</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </section>

      <div className="border-t" />

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold">
            Rental pricing
          </h2>
          <p className="text-sm text-muted-foreground">
            All prices are entered in Moroccan dirhams.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="dailyPrice">Daily price</Label>
            <Input
              id="dailyPrice"
              name="dailyPrice"
              type="number"
              min="1"
              placeholder="700"
              required
            />
            <FieldError errors={state.errors?.dailyPrice} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weeklyPrice">Weekly price</Label>
            <Input
              id="weeklyPrice"
              name="weeklyPrice"
              type="number"
              min="0"
              placeholder="4200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyPrice">Monthly price</Label>
            <Input
              id="monthlyPrice"
              name="monthlyPrice"
              type="number"
              min="0"
              placeholder="15000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deposit">Security deposit</Label>
            <Input
              id="deposit"
              name="deposit"
              type="number"
              min="0"
              placeholder="5000"
            />
          </div>
        </div>
      </section>

      <div className="border-t" />

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold">
            Website descriptions
          </h2>
          <p className="text-sm text-muted-foreground">
            Multilingual descriptions for international clients.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="descriptionFr">
              French description
            </Label>
            <Textarea
              id="descriptionFr"
              name="descriptionFr"
              rows={5}
              placeholder="Décrivez le véhicule en français..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionEn">
              English description
            </Label>
            <Textarea
              id="descriptionEn"
              name="descriptionEn"
              rows={5}
              placeholder="Describe the vehicle in English..."
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="descriptionAr">
              Arabic description
            </Label>
            <Textarea
              id="descriptionAr"
              name="descriptionAr"
              rows={5}
              dir="rtl"
              placeholder="صف السيارة باللغة العربية..."
            />
          </div>
        </div>
      </section>

      <div className="border-t" />

      <section className="space-y-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="visible"
            defaultChecked
            className="mt-1 size-4 accent-primary"
          />
          <span>
            <span className="block font-medium">
              Visible on website
            </span>
            <span className="text-sm text-muted-foreground">
              Customers can see this vehicle in the public fleet.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="featured"
            className="mt-1 size-4 accent-primary"
          />
          <span>
            <span className="block font-medium">
              Featured vehicle
            </span>
            <span className="text-sm text-muted-foreground">
              Highlight this vehicle on the homepage.
            </span>
          </span>
        </label>
      </section>

      <div className="flex justify-end gap-3 border-t pt-6">
        <Link
          href="/admin/vehicles"
          className={buttonVariants({ variant: "outline" })}
        >
          Cancel
        </Link>

        <Button type="submit" disabled={pending}>
          <Save className="mr-2 size-4" />
          {pending ? "Saving..." : "Save vehicle"}
        </Button>
      </div>
    </form>
  );
}