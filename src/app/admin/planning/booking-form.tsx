"use client";
import { EuropeanDateInput } from "@/components/ui/european-date-input";
import {
  useActionState,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  CalendarPlus,
  CheckCircle2,
} from "lucide-react";

import {
  createBooking,
  type BookingActionState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: BookingActionState = {};

type VehicleOption = {
  id: string;
  brand: string;
  model: string;
  registration: string;
  dailyPrice: number;
  deposit: number | null;
};

type BookingFormProps = {
  vehicles: VehicleOption[];
  initialVehicleId?: string;
  initialPickupDate?: string;
  initialReturnDate?: string;
};

function daysBetween(
  pickupDate: string,
  returnDate: string,
) {
  if (!pickupDate || !returnDate) {
    return 0;
  }

  const pickup = new Date(
    `${pickupDate}T00:00:00.000Z`,
  );

  const returned = new Date(
    `${returnDate}T00:00:00.000Z`,
  );

  return Math.max(
    0,
    Math.round(
      (returned.getTime() - pickup.getTime()) /
        86_400_000,
    ),
  );
}

export function BookingForm({
  vehicles,
  initialVehicleId,
  initialPickupDate,
  initialReturnDate,
}: BookingFormProps) {
  const initialVehicle =
    vehicles.find(
      (vehicle) =>
        vehicle.id === initialVehicleId,
    ) ?? vehicles[0];

  const [state, formAction, pending] =
    useActionState(
      createBooking,
      initialState,
    );

  const [selectedVehicleId, setSelectedVehicleId] =
    useState(initialVehicle?.id ?? "");

  const [pickupDate, setPickupDate] = useState(
    initialPickupDate ?? "",
  );

  const [returnDate, setReturnDate] = useState(
    initialReturnDate ?? "",
  );

  const [dailyRate, setDailyRate] = useState(
    initialVehicle?.dailyPrice ?? 0,
  );

  const [depositRequired, setDepositRequired] =
    useState(initialVehicle?.deposit ?? 0);

  const numberOfDays = useMemo(
    () => daysBetween(pickupDate, returnDate),
    [pickupDate, returnDate],
  );

  const estimatedTotal =
    numberOfDays * dailyRate;

  function selectVehicle(vehicleId: string) {
    setSelectedVehicleId(vehicleId);

    const vehicle = vehicles.find(
      (item) => item.id === vehicleId,
    );

    if (vehicle) {
      setDailyRate(vehicle.dailyPrice);
      setDepositRequired(
        vehicle.deposit ?? 0,
      );
    }
  }

  return (
    <form
      action={formAction}
      className="space-y-7"
    >
      {state.message && (
        <div
          className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${
            state.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}
          role={state.success ? "status" : "alert"}
        >
          {state.success ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
          )}

          <p>{state.message}</p>
        </div>
      )}

      <section className="space-y-5">
        <div>
          <h3 className="font-semibold">
            Vehicle and dates
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Conflicting dates for the same vehicle will be rejected.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="vehicleId">
              Vehicle
            </Label>

            <select
              id="vehicleId"
              name="vehicleId"
              value={selectedVehicleId}
              onChange={(event) =>
                selectVehicle(event.target.value)
              }
              className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
              required
            >
              {vehicles.map((vehicle) => (
                <option
                  key={vehicle.id}
                  value={vehicle.id}
                >
                  {vehicle.brand} {vehicle.model} —{" "}
                  {vehicle.registration}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupDate">
              Pick-up date
            </Label>

            <EuropeanDateInput
                key={`pickup-${pickupDate}`}
                id="pickupDate"
                name="pickupDate"
                value={pickupDate}
                onChange={(value) => {
                    setPickupDate(value);

                    if (
                    value &&
                    returnDate &&
                    returnDate <= value
                    ) {
                    setReturnDate("");
                    }
                }}
                required
                placeholder="DD/MM/YYYY"
                className="min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-4 focus:ring-ring/20"
                />
          </div>

          <div className="space-y-2">
            <Label htmlFor="returnDate">
              Return date
            </Label>

            <EuropeanDateInput
                key={`return-${returnDate}-${pickupDate}`}
                id="returnDate"
                name="returnDate"
                value={returnDate}
                min={pickupDate || undefined}
                onChange={setReturnDate}
                required
                placeholder="DD/MM/YYYY"
                className="min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-4 focus:ring-ring/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupTime">
              Pick-up time
            </Label>

            <Input
              id="pickupTime"
              name="pickupTime"
              type="time"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="returnTime">
              Return time
            </Label>

            <Input
              id="returnTime"
              name="returnTime"
              type="time"
            />
          </div>
        </div>
      </section>

      <div className="border-t" />

      <section className="space-y-5">
        <h3 className="font-semibold">
          Customer information
        </h3>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customerName">
              Customer name
            </Label>

            <Input
              id="customerName"
              name="customerName"
              placeholder="Full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              WhatsApp number
            </Label>

            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+33..."
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">
              Email address
            </Label>

            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Optional"
            />
          </div>
        </div>
      </section>

      <div className="border-t" />

      <section className="space-y-5">
        <h3 className="font-semibold">
          Delivery information
        </h3>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pickupLocation">
              Pick-up location
            </Label>

            <Input
              id="pickupLocation"
              name="pickupLocation"
              defaultValue="Marrakech Airport"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="returnLocation">
              Return location
            </Label>

            <Input
              id="returnLocation"
              name="returnLocation"
              placeholder="Same as pick-up"
            />
          </div>
        </div>
      </section>

      <div className="border-t" />

      <section className="space-y-5">
        <div>
          <h3 className="font-semibold">
            Price and payment
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Leave the total price empty to calculate it automatically.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="dailyRate">
              Daily rate
            </Label>

            <Input
              id="dailyRate"
              name="dailyRate"
              type="number"
              min="1"
              value={dailyRate}
              onChange={(event) =>
                setDailyRate(
                  Number(event.target.value),
                )
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalPrice">
              Final total
            </Label>

            <Input
              id="totalPrice"
              name="totalPrice"
              type="number"
              min="0"
              placeholder={
                estimatedTotal
                  ? String(estimatedTotal)
                  : "Automatic"
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="depositRequired">
              Deposit required
            </Label>

            <Input
              id="depositRequired"
              name="depositRequired"
              type="number"
              min="0"
              value={depositRequired}
              onChange={(event) =>
                setDepositRequired(
                  Number(event.target.value),
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="depositPaid">
              Deposit received
            </Label>

            <Input
              id="depositPaid"
              name="depositPaid"
              type="number"
              min="0"
              defaultValue="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amountPaid">
              Rental amount paid
            </Label>

            <Input
              id="amountPaid"
              name="amountPaid"
              type="number"
              min="0"
              defaultValue="0"
            />
          </div>
        </div>

        {numberOfDays > 0 && (
          <div className="rounded-lg bg-muted/40 p-4 text-sm">
            <span className="text-muted-foreground">
              Estimated rental:
            </span>{" "}
            <strong>
              {numberOfDays} day
              {numberOfDays === 1 ? "" : "s"} ×{" "}
              {dailyRate} MAD ={" "}
              {estimatedTotal} MAD
            </strong>
          </div>
        )}
      </section>

      <div className="space-y-2">
        <Label htmlFor="internalNotes">
          Internal notes
        </Label>

        <Textarea
          id="internalNotes"
          name="internalNotes"
          rows={4}
          placeholder="Customer preferences, agreed conditions or operational instructions..."
        />
      </div>

      <div className="flex justify-end border-t pt-5">
        <Button
          type="submit"
          disabled={pending || vehicles.length === 0}
        >
          <CalendarPlus className="mr-2 size-4" />

          {pending
            ? "Checking availability..."
            : "Create confirmed booking"}
        </Button>
      </div>
    </form>
  );
}