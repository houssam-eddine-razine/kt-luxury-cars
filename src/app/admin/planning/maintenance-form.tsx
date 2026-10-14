"use client";

import {
  CalendarDays,
  CarFront,
  CircleDollarSign,
  Gauge,
  MapPin,
  Save,
  Wrench,
} from "lucide-react";
import { useActionState, useState } from "react";

import {
  createMaintenanceEvent,
  type MaintenanceActionState,
} from "./maintenance-actions";
import { EuropeanDateInput } from "@/components/ui/european-date-input";

type VehicleOption = {
  id: string;
  brand: string;
  model: string;
  registration: string;
  mileage: number;
};

type MaintenanceFormProps = {
  vehicles: VehicleOption[];
  initialVehicleId?: string;
  initialDate?: string;
};

const initialState: MaintenanceActionState = {
  success: false,
};

const inputClassName =
  "min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-[#a47d2f] focus:ring-4 focus:ring-[#d4aa50]/15";

const maintenanceTypes = [
  {
    value: "OIL_CHANGE",
    label: "Vidange / Oil change",
  },
  {
    value: "BRAKE_PADS",
    label: "Plaquettes de frein / Brake pads",
  },
  {
    value: "ADBLUE",
    label: "AdBlue",
  },
  {
    value: "TIRES",
    label: "Pneus / Tires",
  },
  {
    value: "TECHNICAL_INSPECTION",
    label: "Contrôle technique",
  },
  {
    value: "INSURANCE",
    label: "Assurance",
  },
  {
    value: "REPAIR",
    label: "Réparation",
  },
  {
    value: "CLEANING",
    label: "Nettoyage",
  },
  {
    value: "OTHER",
    label: "Other maintenance",
  },
];

export function MaintenanceForm({
  vehicles,
  initialVehicleId,
  initialDate,
}: MaintenanceFormProps) {
  const [state, formAction, pending] = useActionState(
    createMaintenanceEvent,
    initialState,
  );

  const [scheduledDate, setScheduledDate] = useState(
    initialDate ?? "",
  );
  const [endDate, setEndDate] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium">
            <CarFront className="size-4 text-muted-foreground" />
            Vehicle
          </span>

          <select
            name="vehicleId"
            required
            defaultValue={initialVehicleId ?? ""}
            className={inputClassName}
          >
            <option value="" disabled>
              Select a vehicle
            </option>

            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.brand} {vehicle.model} —{" "}
                {vehicle.registration} —{" "}
                {vehicle.mileage.toLocaleString("en-GB")} km
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Wrench className="size-4 text-muted-foreground" />
            Maintenance type
          </span>

          <select
            name="type"
            required
            defaultValue="OIL_CHANGE"
            className={inputClassName}
          >
            {maintenanceTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 text-sm font-medium">
            Status
          </span>

          <select
            name="status"
            defaultValue="SCHEDULED"
            className={inputClassName}
          >
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">
              In progress
            </option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="size-4 text-muted-foreground" />
            Scheduled date
          </span>

          <EuropeanDateInput
            key={`maintenance-start-${initialDate ?? "empty"}`}
            id="maintenanceScheduledDate"
            name="scheduledDate"
            value={scheduledDate}
            onChange={(value) => {
              setScheduledDate(value);

              if (endDate && value && endDate < value) {
                setEndDate("");
              }
            }}
            required
            placeholder="DD/MM/YYYY"
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="size-4 text-muted-foreground" />
            End date
          </span>

          <EuropeanDateInput
            id="maintenanceEndDate"
            name="endDate"
            value={endDate}
            onChange={setEndDate}
            min={scheduledDate || undefined}
            placeholder="DD/MM/YYYY"
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="size-4 text-muted-foreground" />
            Next due date
          </span>

          <EuropeanDateInput
            id="maintenanceNextDueDate"
            name="nextDueDate"
            value={nextDueDate}
            onChange={setNextDueDate}
            min={scheduledDate || undefined}
            placeholder="DD/MM/YYYY"
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Gauge className="size-4 text-muted-foreground" />
            Current mileage
          </span>

          <input
            type="number"
            name="mileageAtService"
            min="0"
            step="1"
            placeholder="Example: 75000"
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Gauge className="size-4 text-muted-foreground" />
            Next service mileage
          </span>

          <input
            type="number"
            name="nextServiceMileage"
            min="0"
            step="1"
            placeholder="Example: 85000"
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium">
            <CircleDollarSign className="size-4 text-muted-foreground" />
            Cost in MAD
          </span>

          <input
            type="number"
            name="cost"
            min="0"
            step="1"
            placeholder="Example: 650"
            className={inputClassName}
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium">
            <MapPin className="size-4 text-muted-foreground" />
            Garage or supplier
          </span>

          <input
            type="text"
            name="garage"
            maxLength={150}
            placeholder="Garage name or supplier"
            className={inputClassName}
          />
        </label>

        <label className="block md:col-span-2 xl:col-span-3">
          <span className="mb-2 text-sm font-medium">
            Internal notes
          </span>

          <textarea
            name="notes"
            rows={4}
            maxLength={2000}
            placeholder="Parts changed, observations, invoice reference..."
            className="w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none transition focus:border-[#a47d2f] focus:ring-4 focus:ring-[#d4aa50]/15"
          />
        </label>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Maintenance is flexible and does not block reservations.
        If a reservation overlaps this date, move the maintenance
        to another available day.
      </div>

      {state.message && (
        <p
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm font-medium ${
            state.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#0B1726] px-6 text-sm font-semibold text-white transition hover:bg-[#17283d] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Save className="mr-2 size-4" />

        {pending
          ? "Saving maintenance..."
          : "Save maintenance"}
      </button>
    </form>
  );
}