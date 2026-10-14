import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Minus,
  Plus,
  Search,
  Wrench,
} from "lucide-react";

import { BookingForm } from "./booking-form";
import { MaintenanceForm } from "./maintenance-form";
import { PlanningCalendar } from "./planning-calendar";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ZoomLevel = "day" | "week" | "month";

type PlanningPageProps = {
  searchParams: Promise<{
    start?: string;
    zoom?: string;
    vehicleId?: string;
    pickupDate?: string;
    maintenanceVehicleId?: string;
    maintenanceDate?: string;
  }>;
};

const zoomOptions: Array<{
  value: ZoomLevel;
  label: string;
  days: number;
  cellWidth: number;
  navigationStep: number;
}> = [
  {
    value: "day",
    label: "30 days",
    days: 30,
    cellWidth: 104,
    navigationStep: 15,
  },
  {
    value: "week",
    label: "60 days",
    days: 60,
    cellWidth: 68,
    navigationStep: 30,
  },
  {
    value: "month",
    label: "90 days",
    days: 90,
    cellWidth: 42,
    navigationStep: 45,
  },
];

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseIsoDate(value: string | undefined) {
  if (
    !value ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);

  result.setUTCDate(result.getUTCDate() + days);

  return result;
}

export default async function PlanningPage({
  searchParams,
}: PlanningPageProps) {
  const parameters = await searchParams;

  const zoom =
    zoomOptions.find(
      (option) => option.value === parameters.zoom,
    ) ?? zoomOptions[0];

  const today = new Date();
  const todayDate = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
    ),
  );

  const startDate =
    parseIsoDate(parameters.start) ?? todayDate;

  const endDate = addDays(startDate, zoom.days);

  const previousStart = addDays(
    startDate,
    -zoom.navigationStep,
  );
  const nextStart = addDays(
    startDate,
    zoom.navigationStep,
  );

  const vehicles = await prisma.vehicle.findMany({
    where: {
      status: {
        not: "INACTIVE",
      },
    },

    orderBy: [
      {
        category: "asc",
      },
      {
        brand: "asc",
      },
      {
        model: "asc",
      },
    ],

    include: {
      bookings: {
        where: {
          status: {
            not: "CANCELLED",
          },
          pickupDate: {
            lt: endDate,
          },
          returnDate: {
            gt: startDate,
          },
        },
        orderBy: {
          pickupDate: "asc",
        },
      },

      maintenanceEvents: {
        where: {
          status: {
            not: "CANCELLED",
          },
          AND: [
            {
              scheduledDate: {
                lt: endDate,
              },
            },
            {
              OR: [
                {
                  endDate: {
                    gte: startDate,
                  },
                },
                {
                  scheduledDate: {
                    gte: startDate,
                  },
                },
              ],
            },
          ],
        },
        orderBy: {
          scheduledDate: "asc",
        },
      },
    },
  });

  const days = Array.from(
    {
      length: zoom.days,
    },
    (_, index) => {
      const date = addDays(startDate, index);

      return {
        iso: formatIsoDate(date),

        weekday: new Intl.DateTimeFormat("en", {
          weekday: "short",
          timeZone: "UTC",
        }).format(date),

        label: new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          timeZone: "UTC",
        }).format(date),

        isToday:
          formatIsoDate(date) ===
          formatIsoDate(todayDate),
      };
    },
  );

  const requestedPickupDate = parseIsoDate(
    parameters.pickupDate,
  );

  const initialPickupDate =
    requestedPickupDate &&
    requestedPickupDate >= startDate &&
    requestedPickupDate < endDate
      ? formatIsoDate(requestedPickupDate)
      : undefined;

  const initialReturnDate = requestedPickupDate
    ? formatIsoDate(addDays(requestedPickupDate, 1))
    : undefined;

  const requestedMaintenanceDate = parseIsoDate(
    parameters.maintenanceDate,
  );

  const initialMaintenanceDate =
    requestedMaintenanceDate &&
    requestedMaintenanceDate >= startDate &&
    requestedMaintenanceDate < endDate
      ? formatIsoDate(requestedMaintenanceDate)
      : undefined;

  const vehicleOptions = vehicles.map((vehicle) => ({
    id: vehicle.id,
    brand: vehicle.brand,
    model: vehicle.model,
    registration: vehicle.registration,
    dailyPrice: vehicle.dailyPrice,
    deposit: vehicle.deposit,
  }));

  const maintenanceVehicleOptions = vehicles.map(
    (vehicle) => ({
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      registration: vehicle.registration,
      mileage: vehicle.mileage,
    }),
  );

  const calendarVehicles = vehicles.map((vehicle) => ({
    id: vehicle.id,
    brand: vehicle.brand,
    model: vehicle.model,
    registration: vehicle.registration,
    status: vehicle.status,

    bookings: vehicle.bookings.map((booking) => ({
      id: booking.id,
      reference: booking.reference,
      customerName: booking.customerName,
      pickupDate: formatIsoDate(
        booking.pickupDate,
      ),
      returnDate: formatIsoDate(
        booking.returnDate,
      ),
      status: booking.status,
    })),

    maintenanceEvents: vehicle.maintenanceEvents.map(
      (maintenance) => ({
        id: maintenance.id,
        type: maintenance.type,
        status: maintenance.status,
        scheduledDate: formatIsoDate(
          maintenance.scheduledDate,
        ),
        endDate: maintenance.endDate
          ? formatIsoDate(maintenance.endDate)
          : null,
        blocksAvailability:
          maintenance.blocksAvailability,
      }),
    ),
  }));

  const currentStart = formatIsoDate(startDate);

  return (
    <div className="mx-auto max-w-[1700px] space-y-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Fleet operations
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Fleet planning calendar
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            Review bookings and maintenance across the fleet.
            Zoom out to see the bigger picture or zoom in for
            detailed daily planning.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/planning?start=${formatIsoDate(previousStart)}&zoom=${zoom.value}`}
            className={buttonVariants({
              variant: "outline",
            })}
          >
            <ArrowLeft className="mr-2 size-4" />
            Previous
          </Link>

          <Link
            href={`/admin/planning?zoom=${zoom.value}`}
            className={buttonVariants({
              variant: "outline",
            })}
          >
            <CalendarDays className="mr-2 size-4" />
            Today
          </Link>

          <Link
            href={`/admin/planning?start=${formatIsoDate(nextStart)}&zoom=${zoom.value}`}
            className={buttonVariants({
              variant: "outline",
            })}
          >
            Next
            <ArrowRight className="ml-2 size-4" />
          </Link>

          <Link
            href="#new-booking"
            className={buttonVariants()}
          >
            <Plus className="mr-2 size-4" />
            New booking
          </Link>

          <Link
            href="#new-maintenance"
            className={buttonVariants({
              variant: "outline",
            })}
          >
            <Wrench className="mr-2 size-4" />
            Maintenance
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border bg-background p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold">
            Calendar zoom
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Use 30 days for detail or 90 days for a wider
            fleet overview.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {zoomOptions.map((option, index) => {
            const active =
              option.value === zoom.value;

            return (
              <Link
                key={option.value}
                href={`/admin/planning?start=${currentStart}&zoom=${option.value}`}
                className={`inline-flex min-h-10 items-center rounded-md border px-4 text-sm font-semibold transition ${
                  active
                    ? "border-[#0B1726] bg-[#0B1726] text-white"
                    : "bg-background hover:bg-muted"
                }`}
              >
                {index === 0 ? (
                  <Plus className="mr-2 size-4" />
                ) : index ===
                  zoomOptions.length - 1 ? (
                  <Minus className="mr-2 size-4" />
                ) : (
                  <Search className="mr-2 size-4" />
                )}

                {option.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-3 rounded-xl border bg-background px-4 py-3 text-xs">
        <span className="font-semibold">Legend:</span>

        <span className="flex items-center gap-2">
          <span className="size-3 rounded bg-blue-200" />
          Booking
        </span>

        <span className="flex items-center gap-2">
          <span className="size-3 rounded bg-amber-200" />
          Vidange
        </span>

        <span className="flex items-center gap-2">
          <span className="size-3 rounded bg-red-200" />
          Plaquettes
        </span>

        <span className="flex items-center gap-2">
          <span className="size-3 rounded bg-violet-200" />
          AdBlue
        </span>

        <span className="flex items-center gap-2">
          <span className="size-3 rounded bg-orange-200" />
          Contrôle technique
        </span>

        <span className="flex items-center gap-2">
          <span className="size-3 rounded bg-emerald-200" />
          Assurance
        </span>
      </div>

      <PlanningCalendar
        startDate={currentStart}
        zoom={zoom.value}
        cellWidth={zoom.cellWidth}
        days={days}
        vehicles={calendarVehicles}
      />

      <Card id="new-booking">
        <CardHeader>
          <CardTitle>Create a confirmed booking</CardTitle>

          <p className="text-sm text-muted-foreground">
            The system checks existing bookings before accepting
            the reservation.
          </p>
        </CardHeader>

        <CardContent>
          {vehicleOptions.length > 0 ? (
            <BookingForm
              vehicles={vehicleOptions}
              initialVehicleId={parameters.vehicleId}
              initialPickupDate={initialPickupDate}
              initialReturnDate={initialReturnDate}
            />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Add at least one active vehicle before creating a
              booking.
            </p>
          )}
        </CardContent>
      </Card>

      <Card id="new-maintenance">
        <CardHeader>
          <CardTitle>
            Schedule vehicle maintenance
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            Record a vidange, brake pads, AdBlue, tires,
            insurance, inspection or another fleet operation.
          </p>
        </CardHeader>

        <CardContent>
          {maintenanceVehicleOptions.length > 0 ? (
            <MaintenanceForm
              vehicles={maintenanceVehicleOptions}
              initialVehicleId={
                parameters.maintenanceVehicleId
              }
              initialDate={initialMaintenanceDate}
            />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Add at least one active vehicle before scheduling
              maintenance.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}