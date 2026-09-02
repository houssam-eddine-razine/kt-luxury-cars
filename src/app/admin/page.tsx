import {
  CalendarCheck2,
  CarFront,
  ClipboardPlus,
  KeyRound,
  RotateCcw,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const now = new Date();

  const todayStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    ),
  );

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(
    tomorrowStart.getUTCDate() + 1,
  );

  const [
    availableVehicles,
    rentedVehicles,
    newRequests,
    confirmedRequests,
    pickupsToday,
    returnsToday,
  ] = await Promise.all([
    prisma.vehicle.count({
      where: {
        status: "AVAILABLE",
      },
    }),

    prisma.vehicle.count({
      where: {
        status: "RENTED",
      },
    }),

    prisma.reservationRequest.count({
      where: {
        status: "NEW",
      },
    }),

    prisma.reservationRequest.count({
      where: {
        status: "CONFIRMED",
      },
    }),

    prisma.reservationRequest.count({
      where: {
        status: "CONFIRMED",
        pickupDate: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    }),

    prisma.reservationRequest.count({
      where: {
        status: "CONFIRMED",
        returnDate: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    }),
  ]);

  const indicators = [
    {
      label: "Available today",
      value: availableVehicles,
      icon: CarFront,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Currently rented",
      value: rentedVehicles,
      icon: KeyRound,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "New requests",
      value: newRequests,
      icon: ClipboardPlus,
      color: "bg-purple-50 text-purple-700",
    },
    {
      label: "Confirmed requests",
      value: confirmedRequests,
      icon: CalendarCheck2,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Pick-ups today",
      value: pickupsToday,
      icon: CalendarCheck2,
      color: "bg-cyan-50 text-cyan-700",
    },
    {
      label: "Returns today",
      value: returnsToday,
      icon: RotateCcw,
      color: "bg-indigo-50 text-indigo-700",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-[#102e2b]">
          Good morning, Houssam.
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          Here&apos;s what is happening with your fleet today.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {indicators.map((indicator) => {
          const Icon = indicator.icon;

          return (
            <Card key={indicator.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-full ${indicator.color}`}
                >
                  <Icon className="size-5" />
                </div>

                <div>
                  <p className="text-sm text-neutral-500">
                    {indicator.label}
                  </p>

                  <p className="mt-1 text-3xl font-semibold">
                    {indicator.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}