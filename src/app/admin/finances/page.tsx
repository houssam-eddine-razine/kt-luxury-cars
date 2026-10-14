import {
  Banknote,
  CalendarClock,
  CircleDollarSign,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { FinanceManager } from "./finance-manager";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

function utcDate(
  year: number,
  month: number,
  day: number,
) {
  return new Date(Date.UTC(year, month, day));
}

function isoDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("fr-MA", {
    maximumFractionDigits: 0,
  }).format(value)} MAD`;
}

export default async function FinancesPage() {
  const now = new Date();

  const monthStart = utcDate(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    1,
  );

  const nextMonthStart = utcDate(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    1,
  );

  const today = utcDate(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  const nextThirtyDays = new Date(today);
  nextThirtyDays.setUTCDate(nextThirtyDays.getUTCDate() + 30);

  const [
    vehicles,
    expenses,
    monthlyRevenueResult,
    monthlyCollectedResult,
    monthlyExpensesResult,
    unpaidRevenueResult,
    plannedExpensesResult,
  ] = await Promise.all([
    prisma.vehicle.findMany({
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

    prisma.expense.findMany({
      orderBy: [
        {
          status: "asc",
        },
        {
          expenseDate: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 250,
      include: {
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            registration: true,
          },
        },
      },
    }),

    prisma.booking.aggregate({
      where: {
        status: {
          not: "CANCELLED",
        },
        pickupDate: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
      _sum: {
        totalPrice: true,
      },
    }),

    prisma.booking.aggregate({
      where: {
        status: {
          not: "CANCELLED",
        },
        pickupDate: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
      _sum: {
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

    prisma.booking.aggregate({
      where: {
        status: {
          not: "CANCELLED",
        },
      },
      _sum: {
        totalPrice: true,
        amountPaid: true,
      },
    }),

    prisma.expense.aggregate({
      where: {
        status: "PLANNED",
        dueDate: {
          gte: today,
          lte: nextThirtyDays,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const monthlyRevenue =
    monthlyRevenueResult._sum.totalPrice ?? 0;

  const monthlyCollected =
    monthlyCollectedResult._sum.amountPaid ?? 0;

  const monthlyExpenses =
    monthlyExpensesResult._sum.amount ?? 0;

  const totalBookedRevenue =
    unpaidRevenueResult._sum.totalPrice ?? 0;

  const totalCollected =
    unpaidRevenueResult._sum.amountPaid ?? 0;

  const outstandingRevenue = Math.max(
    0,
    totalBookedRevenue - totalCollected,
  );

  const upcomingExpenses =
    plannedExpensesResult._sum.amount ?? 0;

  const monthlyBalance =
    monthlyCollected - monthlyExpenses;

  const indicators = [
    {
      label: "Booked this month",
      value: monthlyRevenue,
      description: "Confirmed rental value",
      icon: TrendingUp,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Collected this month",
      value: monthlyCollected,
      description: "Payments received",
      icon: Banknote,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Paid expenses",
      value: monthlyExpenses,
      description: "Current month",
      icon: TrendingDown,
      color: "bg-red-50 text-red-700",
    },
    {
      label: "Operating balance",
      value: monthlyBalance,
      description: "Collected minus expenses",
      icon: CircleDollarSign,
      color:
        monthlyBalance >= 0
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700",
    },
    {
      label: "Customer balance due",
      value: outstandingRevenue,
      description: "Across active bookings",
      icon: WalletCards,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Expenses due soon",
      value: upcomingExpenses,
      description: "Next 30 days",
      icon: CalendarClock,
      color: "bg-purple-50 text-purple-700",
    },
  ];

  const publicVehicles = vehicles.map((vehicle) => ({
    id: vehicle.id,
    name: `${vehicle.brand} ${vehicle.model}`,
    registration: vehicle.registration,
  }));

  const publicExpenses = expenses.map((expense) => ({
    id: expense.id,
    title: expense.title,
    category: expense.category,
    status: expense.status,
    source: expense.source,
    amount: expense.amount,
    expenseDate: isoDate(expense.expenseDate)!,
    dueDate: isoDate(expense.dueDate),
    paidDate: isoDate(expense.paidDate),
    supplier: expense.supplier,
    reference: expense.reference,
    notes: expense.notes,
    recurring: expense.recurring,
    recurrenceFrequency: expense.recurrenceFrequency,
    nextDueDate: isoDate(expense.nextDueDate),
    vehicle: expense.vehicle
      ? {
          id: expense.vehicle.id,
          name: `${expense.vehicle.brand} ${expense.vehicle.model}`,
          registration: expense.vehicle.registration,
        }
      : null,
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9a762f]">
            Business control
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102e2b] sm:text-4xl">
            Finances
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Follow rental income, operating expenses, vehicle
            charges and upcoming payments from one place.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm text-neutral-600 shadow-sm">
          <ReceiptText className="size-4 text-[#a47d2f]" />
          Amounts are displayed in MAD
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {indicators.map((indicator) => {
          const Icon = indicator.icon;

          return (
            <Card key={indicator.label}>
              <CardContent className="p-5">
                <div
                  className={`flex size-11 items-center justify-center rounded-xl ${indicator.color}`}
                >
                  <Icon className="size-5" />
                </div>

                <p className="mt-4 text-sm text-neutral-500">
                  {indicator.label}
                </p>

                <p className="mt-1 text-xl font-semibold tracking-tight text-neutral-900">
                  {formatMoney(indicator.value)}
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  {indicator.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <FinanceManager
        vehicles={publicVehicles}
        expenses={publicExpenses}
        today={today.toISOString().slice(0, 10)}
      />
    </div>
  );
}