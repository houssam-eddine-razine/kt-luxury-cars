import Link from "next/link";
import {
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Mail,
  Phone,
  Search,
  UserRound,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

type CustomersPageProps = {
  searchParams: Promise<{
    query?: string;
  }>;
};

type CustomerProfile = {
  key: string;
  name: string;
  phone: string;
  email: string | null;
  rentals: number;
  requests: number;
  totalRevenue: number;
  amountPaid: number;
  outstanding: number;
  lastActivity: Date;
  activeRental: boolean;
};

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("212")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `212${digits.slice(1)}`;
  }

  return digits;
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

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const parameters = await searchParams;
  const query = parameters.query?.trim().toLowerCase() ?? "";
  const today = new Date();

  const [bookings, requests] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        customerName: true,
        phone: true,
        email: true,
        totalPrice: true,
        amountPaid: true,
        pickupDate: true,
        returnDate: true,
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.reservationRequest.findMany({
      where: {
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        customerName: true,
        phone: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const customerMap = new Map<string, CustomerProfile>();

  for (const request of requests) {
    const key = normalizePhone(request.phone);
    const current = customerMap.get(key);

    if (current) {
      current.requests += 1;

      if (request.createdAt > current.lastActivity) {
        current.lastActivity = request.createdAt;
        current.name = request.customerName;
        current.email = request.email ?? current.email;
        current.phone = request.phone;
      }

      continue;
    }

    customerMap.set(key, {
      key,
      name: request.customerName,
      phone: request.phone,
      email: request.email,
      rentals: 0,
      requests: 1,
      totalRevenue: 0,
      amountPaid: 0,
      outstanding: 0,
      lastActivity: request.createdAt,
      activeRental: false,
    });
  }

  for (const booking of bookings) {
    const key = normalizePhone(booking.phone);
    const current = customerMap.get(key);

    const activeRental =
      booking.status === "ACTIVE" ||
      (booking.pickupDate <= today &&
        booking.returnDate > today);

    if (current) {
      current.rentals += 1;
      current.totalRevenue += booking.totalPrice;
      current.amountPaid += booking.amountPaid;
      current.outstanding += Math.max(
        booking.totalPrice - booking.amountPaid,
        0,
      );
      current.activeRental =
        current.activeRental || activeRental;

      if (booking.createdAt > current.lastActivity) {
        current.lastActivity = booking.createdAt;
        current.name = booking.customerName;
        current.email = booking.email ?? current.email;
        current.phone = booking.phone;
      }

      continue;
    }

    customerMap.set(key, {
      key,
      name: booking.customerName,
      phone: booking.phone,
      email: booking.email,
      rentals: 1,
      requests: 0,
      totalRevenue: booking.totalPrice,
      amountPaid: booking.amountPaid,
      outstanding: Math.max(
        booking.totalPrice - booking.amountPaid,
        0,
      ),
      lastActivity: booking.createdAt,
      activeRental,
    });
  }

  const allCustomers = Array.from(customerMap.values());

  const customers = allCustomers
    .filter((customer) => {
      if (!query) {
        return true;
      }

      return [
        customer.name,
        customer.phone,
        customer.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort(
      (first, second) =>
        second.lastActivity.getTime() -
        first.lastActivity.getTime(),
    );

  const totalRevenue = allCustomers.reduce(
    (total, customer) =>
      total + customer.totalRevenue,
    0,
  );

  const outstanding = allCustomers.reduce(
    (total, customer) =>
      total + customer.outstanding,
    0,
  );

  const repeatCustomers = allCustomers.filter(
    (customer) => customer.rentals > 1,
  ).length;

  const activeCustomers = allCustomers.filter(
    (customer) => customer.activeRental,
  ).length;

  const indicators = [
    {
      label: "Total customers",
      value: allCustomers.length,
      icon: Users,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Active rentals",
      value: activeCustomers,
      icon: CalendarDays,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Repeat customers",
      value: repeatCustomers,
      icon: UserRound,
      color: "bg-purple-50 text-purple-700",
    },
    {
      label: "Customer revenue",
      value: formatMoney(totalRevenue),
      icon: CircleDollarSign,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Outstanding",
      value: formatMoney(outstanding),
      icon: Clock3,
      color: "bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Customer relationships
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102e2b] sm:text-4xl">
          Customers
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          Profiles are grouped automatically using the customer
          phone number.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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

                <p className="mt-1 text-2xl font-semibold">
                  {indicator.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <form className="rounded-2xl border bg-white p-4 shadow-sm">
        <label className="relative block">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-neutral-400" />

          <input
            name="query"
            defaultValue={parameters.query ?? ""}
            placeholder="Search by name, phone or email"
            className="h-12 w-full rounded-xl border bg-neutral-50 pl-12 pr-28 text-sm outline-none focus:border-[#a47d2f] focus:bg-white"
          />

          <button
            type="submit"
            className="absolute right-1.5 top-1.5 h-9 rounded-lg bg-[#0B1726] px-4 text-xs font-semibold text-white"
          >
            Search
          </button>
        </label>
      </form>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Customer directory
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              {customers.length} customer
              {customers.length === 1 ? "" : "s"}
            </p>
          </div>

          {query && (
            <Link
              href="/admin/customers"
              className="text-sm font-semibold text-[#8d6b2b]"
            >
              Clear search
            </Link>
          )}
        </div>

        {customers.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
            <Users className="mx-auto size-10 text-neutral-300" />

            <p className="mt-4 font-semibold">
              No customers found
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {customers.map((customer) => (
              <Card key={customer.key}>
                <CardContent className="grid gap-5 p-5 md:grid-cols-[1.4fr_repeat(4,0.6fr)] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold">
                        {customer.name}
                      </h3>

                      {customer.activeRental && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                          Active rental
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500">
                      <a
                        href={`tel:${customer.phone}`}
                        className="flex items-center gap-1"
                      >
                        <Phone className="size-3.5" />
                        {customer.phone}
                      </a>

                      {customer.email && (
                        <a
                          href={`mailto:${customer.email}`}
                          className="flex items-center gap-1"
                        >
                          <Mail className="size-3.5" />
                          {customer.email}
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-500">
                      Rentals
                    </p>
                    <p className="mt-1 font-semibold">
                      {customer.rentals}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-500">
                      Revenue
                    </p>
                    <p className="mt-1 font-semibold">
                      {formatMoney(customer.totalRevenue)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-500">
                      Outstanding
                    </p>
                    <p
                      className={`mt-1 font-semibold ${
                        customer.outstanding > 0
                          ? "text-red-700"
                          : "text-emerald-700"
                      }`}
                    >
                      {formatMoney(customer.outstanding)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 md:block">
                    <div>
                      <p className="text-xs text-neutral-500">
                        Last activity
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {formatDate(customer.lastActivity)}
                      </p>
                    </div>

                    <a
                      href={`https://wa.me/${normalizePhone(
                        customer.phone,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center rounded-lg bg-[#128c5a] px-3 text-xs font-semibold text-white md:mt-3"
                    >
                      WhatsApp
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}