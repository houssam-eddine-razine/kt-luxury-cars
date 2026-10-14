import Link from "next/link";
import {
  CalendarClock,
  CalendarDays,
  CircleDollarSign,
  Gauge,
  Plus,
  TriangleAlert,
  Wrench,
} from "lucide-react";

import { MaintenanceTable } from "./maintenance-table";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

type MaintenancePageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    status?: string;
    vehicleId?: string;
  }>;
};

const typeOptions = [
  ["ALL", "All types"],
  ["OIL_CHANGE", "Vidange"],
  ["BRAKE_PADS", "Plaquettes de frein"],
  ["ADBLUE", "AdBlue"],
  ["TIRES", "Pneus"],
  ["TECHNICAL_INSPECTION", "Contrôle technique"],
  ["INSURANCE", "Assurance"],
  ["REPAIR", "Réparation"],
  ["CLEANING", "Nettoyage"],
  ["OTHER", "Other"],
];

const statusOptions = [
  ["ALL", "All statuses"],
  ["SCHEDULED", "Scheduled"],
  ["IN_PROGRESS", "In progress"],
  ["COMPLETED", "Completed"],
  ["CANCELLED", "Cancelled"],
];

function utcToday() {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    ),
  );
}

function addDays(date: Date, days: number) {
  const result = new Date(date);

  result.setUTCDate(result.getUTCDate() + days);

  return result;
}

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function MaintenancePage({
  searchParams,
}: MaintenancePageProps) {
  const parameters = await searchParams;

  const today = utcToday();
  const nextSevenDays = addDays(today, 7);
  const nextThirtyDays = addDays(today, 30);

  const monthStart = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      1,
    ),
  );

  const nextMonthStart = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth() + 1,
      1,
    ),
  );

  const [allEvents, vehicles, bookings] =
    await Promise.all([
      prisma.maintenanceEvent.findMany({
        orderBy: [
          {
            scheduledDate: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              registration: true,
              mileage: true,
            },
          },
        },
      }),

      prisma.vehicle.findMany({
        where: {
          status: {
            not: "INACTIVE",
          },
        },
        orderBy: [
          {
            brand: "asc",
          },
          {
            model: "asc",
          },
        ],
        select: {
          id: true,
          brand: true,
          model: true,
          registration: true,
        },
      }),

      prisma.booking.findMany({
        where: {
          status: {
            not: "CANCELLED",
          },
          returnDate: {
            gte: today,
          },
        },
        select: {
          id: true,
          vehicleId: true,
          pickupDate: true,
          returnDate: true,
          reference: true,
        },
      }),
    ]);

  const activeEvents = allEvents.filter(
    (event) =>
      event.status === "SCHEDULED" ||
      event.status === "IN_PROGRESS",
  );

  const overdueCount = activeEvents.filter(
    (event) => event.scheduledDate < today,
  ).length;

  const dueWithinSevenDays = activeEvents.filter(
    (event) =>
      event.scheduledDate >= today &&
      event.scheduledDate <= nextSevenDays,
  ).length;

  const dueWithinThirtyDays = activeEvents.filter(
    (event) =>
      event.scheduledDate >= today &&
      event.scheduledDate <= nextThirtyDays,
  ).length;

  const monthlyCost = allEvents
    .filter(
      (event) =>
        event.status === "COMPLETED" &&
        (event.completedDate ??
          event.scheduledDate) >= monthStart &&
        (event.completedDate ??
          event.scheduledDate) < nextMonthStart,
    )
    .reduce(
      (total, event) => total + (event.cost ?? 0),
      0,
    );

  const mileageAlerts = allEvents.filter(
    (event) =>
      event.status !== "CANCELLED" &&
      event.nextServiceMileage !== null &&
      event.vehicle.mileage >=
        event.nextServiceMileage,
  ).length;

  const query = parameters.q?.trim().toLowerCase() ?? "";
  const selectedType = parameters.type ?? "ALL";
  const selectedStatus = parameters.status ?? "ALL";
  const selectedVehicle = parameters.vehicleId ?? "ALL";

  const filteredEvents = allEvents.filter((event) => {
    const searchableText = [
      event.vehicle.brand,
      event.vehicle.model,
      event.vehicle.registration,
      event.type,
      event.garage,
      event.notes,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesQuery =
      query === "" || searchableText.includes(query);

    const matchesType =
      selectedType === "ALL" ||
      event.type === selectedType;

    const matchesStatus =
      selectedStatus === "ALL" ||
      event.status === selectedStatus;

    const matchesVehicle =
      selectedVehicle === "ALL" ||
      event.vehicle.id === selectedVehicle;

    return (
      matchesQuery &&
      matchesType &&
      matchesStatus &&
      matchesVehicle
    );
  });

  const tableEvents = filteredEvents.map((event) => {
    const maintenanceStart = event.scheduledDate;

    const maintenanceEndExclusive = addDays(
      event.endDate ?? event.scheduledDate,
      1,
    );

    const hasBookingConflict =
      event.status !== "COMPLETED" &&
      event.status !== "CANCELLED" &&
      bookings.some(
        (booking) =>
          booking.vehicleId === event.vehicle.id &&
          booking.pickupDate <
            maintenanceEndExclusive &&
          booking.returnDate > maintenanceStart,
      );

    return {
      id: event.id,
      type: event.type,
      status: event.status,
      scheduledDate: formatIsoDate(
        event.scheduledDate,
      ),
      endDate: event.endDate
        ? formatIsoDate(event.endDate)
        : null,
      completedDate: event.completedDate
        ? formatIsoDate(event.completedDate)
        : null,
      nextDueDate: event.nextDueDate
        ? formatIsoDate(event.nextDueDate)
        : null,
      mileageAtService: event.mileageAtService,
      nextServiceMileage:
        event.nextServiceMileage,
      cost: event.cost,
      garage: event.garage,
      notes: event.notes,
      hasBookingConflict,
      vehicle: {
        brand: event.vehicle.brand,
        model: event.vehicle.model,
        registration: event.vehicle.registration,
        mileage: event.vehicle.mileage,
      },
    };
  });

  const conflictCount = tableEvents.filter(
    (event) => event.hasBookingConflict,
  ).length;

  const kpis = [
    {
      label: "Overdue",
      value: overdueCount.toString(),
      description: "Maintenance dates already passed",
      icon: TriangleAlert,
      style: "bg-red-50 text-red-700",
    },
    {
      label: "Next 7 days",
      value: dueWithinSevenDays.toString(),
      description: "Upcoming fleet operations",
      icon: CalendarClock,
      style: "bg-amber-50 text-amber-700",
    },
    {
      label: "Next 30 days",
      value: dueWithinThirtyDays.toString(),
      description: "Maintenance to prepare",
      icon: CalendarDays,
      style: "bg-blue-50 text-blue-700",
    },
    {
      label: "Mileage alerts",
      value: mileageAlerts.toString(),
      description: "Service mileage reached",
      icon: Gauge,
      style: "bg-violet-50 text-violet-700",
    },
    {
      label: "Monthly cost",
      value: `${formatMoney(monthlyCost)} MAD`,
      description: "Completed maintenance this month",
      icon: CircleDollarSign,
      style: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="mx-auto max-w-[1700px] space-y-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Fleet operations
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Maintenance management
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            Monitor maintenance dates, mileage, expenses and
            reservation conflicts without blocking customer
            bookings.
          </p>
        </div>

        <Link
          href="/admin/planning#new-maintenance"
          className={buttonVariants()}
        >
          <Plus className="mr-2 size-4" />
          Schedule maintenance
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;

          return (
            <Card key={kpi.label}>
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.label}
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {kpi.value}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {kpi.description}
                  </p>
                </div>

                <span
                  className={`flex size-10 items-center justify-center rounded-full ${kpi.style}`}
                >
                  <Icon className="size-5" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {conflictCount > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-800">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" />

          <div>
            <p className="font-semibold">
              {conflictCount} maintenance{" "}
              {conflictCount === 1
                ? "event needs"
                : "events need"}{" "}
              rescheduling
            </p>

            <p className="mt-1 text-sm text-red-700">
              Customer reservations remain accepted. Move the
              overlapping maintenance to another available date.
            </p>
          </div>
        </div>
      )}

      <form className="grid gap-3 rounded-xl border bg-background p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[1fr_220px_220px_260px_auto]">
        <input
          type="search"
          name="q"
          defaultValue={parameters.q}
          placeholder="Search vehicle, registration, garage..."
          className="min-h-11 rounded-md border bg-background px-3 text-sm outline-none focus:border-[#a47d2f] focus:ring-4 focus:ring-[#d4aa50]/15"
        />

        <select
          name="type"
          defaultValue={selectedType}
          className="min-h-11 rounded-md border bg-background px-3 text-sm"
        >
          {typeOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          name="status"
          defaultValue={selectedStatus}
          className="min-h-11 rounded-md border bg-background px-3 text-sm"
        >
          {statusOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          name="vehicleId"
          defaultValue={selectedVehicle}
          className="min-h-11 rounded-md border bg-background px-3 text-sm"
        >
          <option value="ALL">All vehicles</option>

          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.brand} {vehicle.model} —{" "}
              {vehicle.registration}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#0B1726] px-5 text-sm font-semibold text-white"
        >
          <Wrench className="mr-2 size-4" />
          Apply
        </button>
      </form>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {tableEvents.length} maintenance{" "}
          {tableEvents.length === 1 ? "record" : "records"}
        </p>

        {(query ||
          selectedType !== "ALL" ||
          selectedStatus !== "ALL" ||
          selectedVehicle !== "ALL") && (
          <Link
            href="/admin/maintenance"
            className="text-sm font-semibold text-[#8d6b2b] underline underline-offset-4"
          >
            Clear filters
          </Link>
        )}
      </div>

      <MaintenanceTable events={tableEvents} />
    </div>
  );
}