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
  ReceiptText,
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
  return `${new Intl.NumberFormat("fr-MA", {
    maximumFractionDigits: 0,
  }).format(value)} MAD`;
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
  const today = startOfUtcDay(now);
  const tomorrow = addDays(today, 1);
  const nextSevenDays = addDays(today, 7);

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

  const [
    fleet,
    activeBookings,
    upcomingBookings,
    pickupsToday,
    returnsToday,
    newRequests,
    monthlyBookings,
    monthlyExpenses,
    overdueExpenses,
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
        status: true,
      },
    }),

    prisma.booking.findMany({
      where: {
        status: {
          in: ["CONFIRMED", "ACTIVE"],
        },
        pickupDate: {
          lte: today,
        },
        returnDate: {
          gt: today,
        },
      },
      include: {
        vehicle: true,
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
          gte: tomorrow,
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
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        vehicle: true,
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
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        vehicle: true,
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

    prisma.expense.aggregate({
      where: {
        status: "PAID",
        expenseDate: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.expense.count({
      where: {
        status: "PLANNED",
        dueDate: {
          lt: today,
        },
      },
    }),

    prisma.maintenanceEvent.findMany({
      where: {
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        vehicle: true,
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
    operationalFleet.length === 0
      ? 0
      : Math.round(
          (activeVehicleIds.size /
            operationalFleet.length) *
            100,
        );

  const bookedRevenue = monthlyBookings.reduce(
    (total, booking) => total + booking.totalPrice,
    0,
  );

  const collectedRevenue = monthlyBookings.reduce(
    (total, booking) => total + booking.amountPaid,
    0,
  );

  const outstandingRevenue = monthlyBookings.reduce(
    (total, booking) =>
      total +
      Math.max(
        booking.totalPrice - booking.amountPaid,
        0,
      ),
    0,
  );

  const paidExpenses =
    monthlyExpenses._sum.amount ?? 0;

  const operatingBalance =
    collectedRevenue - paidExpenses;

  const urgentMaintenance = maintenanceEvents
    .filter((maintenance) => {
      const scheduleReached =
        (maintenance.status === "SCHEDULED" ||
          maintenance.status === "IN_PROGRESS") &&
        maintenance.scheduledDate <= today;

      const dateReached =
        maintenance.nextDueDate !== null &&
        maintenance.nextDueDate <= today;

      const mileageReached =
        maintenance.nextServiceMileage !== null &&
        maintenance.vehicle.mileage >=
          maintenance.nextServiceMileage;

      return scheduleReached || dateReached || mileageReached;
    })
    .slice(0, 5);

  const operationCards = [
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
      description: "Starting within seven days",
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

  const financeCards = [
    {
      label: "Booked this month",
      value: formatMoney(bookedRevenue),
      description: "Expected rental revenue",
      icon: CircleDollarSign,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Collected",
      value: formatMoney(collectedRevenue),
      description: "Payments received",
      icon: WalletCards,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Outstanding",
      value: formatMoney(outstandingRevenue),
      description: "Still to be collected",
      icon: Clock3,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Paid expenses",
      value: formatMoney(paidExpenses),
      description: "All expenses this month",
      icon: ReceiptText,
      color: "bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
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
            href="/admin/planning"
            className="inline-flex min-h-11 items-center rounded-md border bg-white px-5 text-sm font-semibold transition hover:bg-muted"
          >
            <CalendarRange className="mr-2 size-4" />
            Open calendar
          </Link>

          <Link
            href="/admin/planning#new-booking"
            className="inline-flex min-h-11 items-center rounded-md bg-[#0B1726] px-5 text-sm font-semibold text-white"
          >
            <CalendarCheck2 className="mr-2 size-4" />
            New booking
          </Link>

          <Link
            href="/admin/planning#new-maintenance"
            className="inline-flex min-h-11 items-center rounded-md border bg-white px-5 text-sm font-semibold"
          >
            <Wrench className="mr-2 size-4" />
            Maintenance
          </Link>
        </div>
      </header>

      {(urgentMaintenance.length > 0 ||
        overdueExpenses > 0) && (
        <div className="grid gap-3 md:grid-cols-2">
          {urgentMaintenance.length > 0 && (
            <Link
              href="/admin/maintenance"
              className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
            >
              <span className="flex items-center gap-3">
                <TriangleAlert className="size-5" />
                {urgentMaintenance.length} maintenance alert
                {urgentMaintenance.length === 1 ? "" : "s"}
              </span>

              <ArrowRight className="size-5" />
            </Link>
          )}

          {overdueExpenses > 0 && (
            <Link
              href="/admin/finances"
              className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800"
            >
              <span className="flex items-center gap-3">
                <ReceiptText className="size-5" />
                {overdueExpenses} overdue expense
                {overdueExpenses === 1 ? "" : "s"}
              </span>

              <ArrowRight className="size-5" />
            </Link>
          )}
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold">Fleet today</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {operationCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link key={card.label} href={card.href}>
                <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="flex justify-between p-5">
                    <div>
                      <p className="text-sm text-neutral-500">
                        {card.label}
                      </p>

                      <p className="mt-2 text-3xl font-semibold">
                        {card.value}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {card.description}
                      </p>
                    </div>

                    <div
                      className={`flex size-11 items-center justify-center rounded-full ${card.color}`}
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
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              Financial snapshot
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Revenue and all recorded expenses this month.
            </p>
          </div>

          <Link
            href="/admin/finances"
            className="text-sm font-semibold text-[#8d6b2b]"
          >
            Manage finances
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {financeCards.map((card) => {
            const Icon = card.icon;

            return (
              <Card key={card.label}>
                <CardContent className="flex justify-between p-5">
                  <div>
                    <p className="text-sm text-neutral-500">
                      {card.label}
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {card.value}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  </div>

                  <div
                    className={`flex size-11 items-center justify-center rounded-full ${card.color}`}
                  >
                    <Icon className="size-5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div
          className={`mt-4 rounded-xl border p-5 ${
            operatingBalance >= 0
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <p className="text-sm text-neutral-600">
            Real operating balance
          </p>

          <p
            className={`mt-1 text-3xl font-semibold ${
              operatingBalance >= 0
                ? "text-emerald-800"
                : "text-red-800"
            }`}
          >
            {formatMoney(operatingBalance)}
          </p>

          <p className="mt-1 text-xs text-neutral-500">
            Collected rental income minus every paid expense.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {[
          {
            title: "Pick-ups today",
            items: pickupsToday,
            icon: CalendarCheck2,
            date: "pickupTime" as const,
          },
          {
            title: "Returns today",
            items: returnsToday,
            icon: RotateCcw,
            date: "returnTime" as const,
          },
        ].map((section) => {
          const Icon = section.icon;

          return (
            <Card key={section.title} className="overflow-hidden">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div>
                  <h2 className="font-semibold">
                    {section.title}
                  </h2>

                  <p className="text-xs text-muted-foreground">
                    {section.items.length} scheduled
                  </p>
                </div>

                <Icon className="size-5 text-blue-700" />
              </div>

              <CardContent className="p-0">
                {section.items.length === 0 ? (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    Nothing scheduled.
                  </p>
                ) : (
                  <div className="divide-y">
                    {section.items.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex justify-between gap-4 px-5 py-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {booking.customerName}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {booking.vehicle.brand}{" "}
                            {booking.vehicle.model} ·{" "}
                            {booking.vehicle.registration}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-semibold">
                          {booking[section.date] ||
                            "Time not set"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex justify-between border-b px-5 py-4">
            <h2 className="font-semibold">Active rentals</h2>

            <Link
              href="/admin/planning"
              className="text-xs font-semibold text-[#8d6b2b]"
            >
              Open planning
            </Link>
          </div>

          <CardContent className="p-0">
            {activeBookings.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                No active rentals.
              </p>
            ) : (
              <div className="divide-y">
                {activeBookings.slice(0, 6).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex justify-between gap-4 px-5 py-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {booking.vehicle.brand}{" "}
                        {booking.vehicle.model}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {booking.customerName} ·{" "}
                        {booking.reference}
                      </p>
                    </div>

                    <p className="text-sm font-semibold">
                      {formatDate(booking.returnDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex justify-between border-b px-5 py-4">
            <h2 className="font-semibold">
              Maintenance alerts
            </h2>

            <Link
              href="/admin/maintenance"
              className="text-xs font-semibold text-[#8d6b2b]"
            >
              Manage
            </Link>
          </div>

          <CardContent className="p-0">
            {urgentMaintenance.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                Maintenance is up to date.
              </p>
            ) : (
              <div className="divide-y">
                {urgentMaintenance.map((maintenance) => (
                  <div
                    key={maintenance.id}
                    className="flex justify-between gap-4 px-5 py-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {maintenance.vehicle.brand}{" "}
                        {maintenance.vehicle.model}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {maintenance.type.replaceAll("_", " ")}
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-red-700">
                      {formatDate(maintenance.scheduledDate)}
                    </p>
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