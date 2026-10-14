import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  CalendarRange,
  CarFront,
  CircleDollarSign,
  ClipboardPlus,
  Clock3,
  KeyRound,
  RotateCcw,
  TriangleAlert,
  WalletCards,
  Wrench,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ),
  );
}

function addDays(date: Date, days: number) {
  const result = new Date(date);

  result.setUTCDate(result.getUTCDate() + days);

  return result;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("fr-MA", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const todayStart = startOfUtcDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const nextSevenDays = addDays(todayStart, 7);

  const monthStart = new Date(
    Date.UTC(
      todayStart.getUTCFullYear(),
      todayStart.getUTCMonth(),
      1,
    ),
  );

  const nextMonthStart = new Date(
    Date.UTC(
      todayStart.getUTCFullYear(),
      todayStart.getUTCMonth() + 1,
      1,
    ),
  );

  const [
    fleet,
    activeBookings,
    upcomingBookings,
    pickupsToday,
    returnsToday,
    newRequests,
    monthlyBookings,
    monthlyMaintenance,
    maintenanceEvents,
  ] = await Promise.all([
    prisma.vehicle.findMany({
      where: {
        status: {
          not: "INACTIVE",
        },
      },
      select: {
        id: true,
        brand: true,
        model: true,
        registration: true,
        status: true,
        mileage: true,
      },
      orderBy: [
        {
          brand: "asc",
        },
        {
          model: "asc",
        },
      ],
    }),

    prisma.booking.findMany({
      where: {
        status: {
          in: ["CONFIRMED", "ACTIVE"],
        },
        pickupDate: {
          lte: todayStart,
        },
        returnDate: {
          gt: todayStart,
        },
      },
      include: {
        vehicle: {
          select: {
            brand: true,
            model: true,
            registration: true,
          },
        },
      },
      orderBy: {
        returnDate: "asc",
      },
    }),

    prisma.booking.count({
      where: {
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        pickupDate: {
          gte: tomorrowStart,
          lt: nextSevenDays,
        },
      },
    }),

    prisma.booking.findMany({
      where: {
        status: {
          in: ["PENDING", "CONFIRMED", "ACTIVE"],
        },
        pickupDate: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
      include: {
        vehicle: {
          select: {
            brand: true,
            model: true,
            registration: true,
          },
        },
      },
      orderBy: {
        pickupTime: "asc",
      },
    }),

    prisma.booking.findMany({
      where: {
        status: {
          in: ["CONFIRMED", "ACTIVE"],
        },
        returnDate: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
      include: {
        vehicle: {
          select: {
            brand: true,
            model: true,
            registration: true,
          },
        },
      },
      orderBy: {
        returnTime: "asc",
      },
    }),

    prisma.reservationRequest.count({
      where: {
        status: "NEW",
      },
    }),

    prisma.booking.findMany({
      where: {
        status: {
          not: "CANCELLED",
        },
        pickupDate: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
      select: {
        totalPrice: true,
        amountPaid: true,
      },
    }),

    prisma.maintenanceEvent.findMany({
      where: {
        status: "COMPLETED",
        OR: [
          {
            completedDate: {
              gte: monthStart,
              lt: nextMonthStart,
            },
          },
          {
            completedDate: null,
            scheduledDate: {
              gte: monthStart,
              lt: nextMonthStart,
            },
          },
        ],
      },
      select: {
        cost: true,
      },
    }),

    prisma.maintenanceEvent.findMany({
      where: {
        status: {
          not: "CANCELLED",
        },
      },
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
      orderBy: {
        scheduledDate: "asc",
      },
    }),
  ]);

  const operationalFleet = fleet.filter(
    (vehicle) => vehicle.status !== "MAINTENANCE",
  );

  const activeVehicleIds = new Set(
    activeBookings.map((booking) => booking.vehicleId),
  );

  const availableVehicles = operationalFleet.filter(
    (vehicle) => !activeVehicleIds.has(vehicle.id),
  ).length;

  const utilization =
    operationalFleet.length > 0
      ? Math.round(
          (activeVehicleIds.size /
            operationalFleet.length) *
            100,
        )
      : 0;

  const expectedMonthlyRevenue = monthlyBookings.reduce(
    (total, booking) => total + booking.totalPrice,
    0,
  );

  const collectedMonthlyRevenue = monthlyBookings.reduce(
    (total, booking) => total + booking.amountPaid,
    0,
  );

  const outstandingMonthlyRevenue = monthlyBookings.reduce(
    (total, booking) =>
      total +
      Math.max(
        booking.totalPrice - booking.amountPaid,
        0,
      ),
    0,
  );

  const maintenanceCost = monthlyMaintenance.reduce(
    (total, maintenance) =>
      total + (maintenance.cost ?? 0),
    0,
  );

  const operatingBalance =
    collectedMonthlyRevenue - maintenanceCost;

  const urgentMaintenance = maintenanceEvents
    .filter((maintenance) => {
      const scheduledOverdue =
        (maintenance.status === "SCHEDULED" ||
          maintenance.status === "IN_PROGRESS") &&
        maintenance.scheduledDate < todayStart;

      const dateLimitReached =
        maintenance.nextDueDate !== null &&
        maintenance.nextDueDate <= todayStart;

      const mileageLimitReached =
        maintenance.nextServiceMileage !== null &&
        maintenance.vehicle.mileage >=
          maintenance.nextServiceMileage;

      return (
        scheduledOverdue ||
        dateLimitReached ||
        mileageLimitReached
      );
    })
    .slice(0, 5);

  const operationIndicators = [
    {
      label: "Available today",
      value: availableVehicles,
      description: `${operationalFleet.length} operational vehicles`,
      icon: CarFront,
      color: "bg-emerald-50 text-emerald-700",
      href: "/admin/planning",
    },
    {
      label: "Active rentals",
      value: activeBookings.length,
      description: `${utilization}% fleet utilization`,
      icon: KeyRound,
      color: "bg-amber-50 text-amber-700",
      href: "/admin/planning",
    },
    {
      label: "Upcoming bookings",
      value: upcomingBookings,
      description: "Starting within 7 days",
      icon: CalendarCheck2,
      color: "bg-blue-50 text-blue-700",
      href: "/admin/planning",
    },
    {
      label: "New requests",
      value: newRequests,
      description: "Awaiting your response",
      icon: ClipboardPlus,
      color: "bg-violet-50 text-violet-700",
      href: "/admin/reservations",
    },
  ];

  const financialIndicators = [
    {
      label: "Booked this month",
      value: `${formatMoney(
        expectedMonthlyRevenue,
      )} MAD`,
      description: "Expected rental revenue",
      icon: CircleDollarSign,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Collected",
      value: `${formatMoney(
        collectedMonthlyRevenue,
      )} MAD`,
      description: "Paid on this month's rentals",
      icon: WalletCards,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Outstanding",
      value: `${formatMoney(
        outstandingMonthlyRevenue,
      )} MAD`,
      description: "Still to be collected",
      icon: Clock3,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Maintenance costs",
      value: `${formatMoney(maintenanceCost)} MAD`,
      description: "Completed this month",
      icon: Wrench,
      color: "bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            KT Luxury Cars
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#102e2b]">
            Welcome back, Houssam.
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Here&apos;s what needs your attention today.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/planning#new-booking"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#0B1726] px-5 text-sm font-semibold text-white transition hover:bg-[#17283d]"
          >
            <CalendarRange className="mr-2 size-4" />
            New booking
          </Link>

          <Link
            href="/admin/planning#new-maintenance"
            className="inline-flex min-h-11 items-center justify-center rounded-md border bg-background px-5 text-sm font-semibold transition hover:bg-muted"
          >
            <Wrench className="mr-2 size-4" />
            Maintenance
          </Link>
        </div>
      </div>

      {urgentMaintenance.length > 0 && (
        <Link
          href="/admin/maintenance"
          className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-800 transition hover:bg-red-100"
        >
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 size-5 shrink-0" />

            <div>
              <p className="font-semibold">
                {urgentMaintenance.length} maintenance{" "}
                {urgentMaintenance.length === 1
                  ? "alert requires"
                  : "alerts require"}{" "}
                attention
              </p>

              <p className="mt-1 text-sm text-red-700">
                A scheduled date or service mileage has been
                reached.
              </p>
            </div>
          </div>

          <ArrowRight className="mt-1 size-5 shrink-0" />
        </Link>
      )}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            Fleet today
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Live availability and customer activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {operationIndicators.map((indicator) => {
            const Icon = indicator.icon;

            return (
              <Link
                key={indicator.label}
                href={indicator.href}
                className="group"
              >
                <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:shadow-md">
                  <CardContent className="flex items-start justify-between p-5">
                    <div>
                      <p className="text-sm text-neutral-500">
                        {indicator.label}
                      </p>

                      <p className="mt-2 text-3xl font-semibold">
                        {indicator.value}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {indicator.description}
                      </p>
                    </div>

                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-full ${indicator.color}`}
                    >
                      <Icon className="size-5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Financial snapshot
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Current month based on recorded bookings and
              maintenance.
            </p>
          </div>

          <p
            className={`text-sm font-semibold ${
              operatingBalance >= 0
                ? "text-emerald-700"
                : "text-red-700"
            }`}
          >
            Operating balance:{" "}
            {formatMoney(operatingBalance)} MAD
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {financialIndicators.map((indicator) => {
            const Icon = indicator.icon;

            return (
              <Card key={indicator.label}>
                <CardContent className="flex items-start justify-between p-5">
                  <div>
                    <p className="text-sm text-neutral-500">
                      {indicator.label}
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {indicator.value}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {indicator.description}
                    </p>
                  </div>

                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-full ${indicator.color}`}
                  >
                    <Icon className="size-5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="font-semibold">
                Pick-ups today
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                {pickupsToday.length} scheduled
              </p>
            </div>

            <CalendarCheck2 className="size-5 text-blue-700" />
          </div>

          <CardContent className="p-0">
            {pickupsToday.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                No vehicle pick-ups today.
              </p>
            ) : (
              <div className="divide-y">
                {pickupsToday.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {booking.customerName}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {booking.vehicle.brand}{" "}
                        {booking.vehicle.model} ·{" "}
                        {booking.vehicle.registration}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold">
                        {booking.pickupTime || "Time not set"}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {booking.pickupLocation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="font-semibold">
                Returns today
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                {returnsToday.length} scheduled
              </p>
            </div>

            <RotateCcw className="size-5 text-indigo-700" />
          </div>

          <CardContent className="p-0">
            {returnsToday.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                No vehicle returns today.
              </p>
            ) : (
              <div className="divide-y">
                {returnsToday.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {booking.customerName}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {booking.vehicle.brand}{" "}
                        {booking.vehicle.model} ·{" "}
                        {booking.vehicle.registration}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold">
                        {booking.returnTime || "Time not set"}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {booking.returnLocation ||
                          booking.pickupLocation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="font-semibold">
                Active rentals
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Vehicles currently with customers
              </p>
            </div>

            <Link
              href="/admin/planning"
              className="text-xs font-semibold text-[#8d6b2b]"
            >
              Open planning
            </Link>
          </div>

          <CardContent className="p-0">
            {activeBookings.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                No active rentals right now.
              </p>
            ) : (
              <div className="divide-y">
                {activeBookings.slice(0, 6).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {booking.vehicle.brand}{" "}
                        {booking.vehicle.model}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {booking.customerName} ·{" "}
                        {booking.reference}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">
                        Return
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {formatDate(booking.returnDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="font-semibold">
                Maintenance alerts
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Date and mileage reminders
              </p>
            </div>

            <Link
              href="/admin/maintenance"
              className="text-xs font-semibold text-[#8d6b2b]"
            >
              Manage
            </Link>
          </div>

          <CardContent className="p-0">
            {urgentMaintenance.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Wrench className="mx-auto size-7 text-emerald-600" />

                <p className="mt-3 text-sm font-medium">
                  Maintenance is up to date
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {urgentMaintenance.map((maintenance) => (
                  <div
                    key={maintenance.id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {maintenance.vehicle.brand}{" "}
                        {maintenance.vehicle.model}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {maintenance.type.replaceAll(
                          "_",
                          " ",
                        )}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold text-red-700">
                        Attention required
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(
                          maintenance.scheduledDate,
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}