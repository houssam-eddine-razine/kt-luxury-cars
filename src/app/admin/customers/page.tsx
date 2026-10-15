import {
  CircleDollarSign,
  Clock3,
  Mail,
  Phone,
  Search,
  ShieldAlert,
  Star,
  Users,
} from "lucide-react";

import { updateCustomerProfile } from "./actions";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

type CustomersPageProps = {
  searchParams: Promise<{
    query?: string;
    status?: string;
  }>;
};

type Customer = {
  key: string;
  name: string;
  phone: string;
  email: string | null;
  rentals: number;
  requests: number;
  revenue: number;
  paid: number;
  outstanding: number;
  lastActivity: Date;
  status: "NORMAL" | "TRUSTED" | "WATCHLIST" | "BLOCKED";
  notes: string | null;
};

const statusLabels = {
  NORMAL: "Normal",
  TRUSTED: "Trusted",
  WATCHLIST: "Watchlist",
  BLOCKED: "Blocked",
};

const statusStyles = {
  NORMAL: "bg-neutral-100 text-neutral-700",
  TRUSTED: "bg-emerald-100 text-emerald-700",
  WATCHLIST: "bg-amber-100 text-amber-700",
  BLOCKED: "bg-red-100 text-red-700",
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
  const selectedStatus = parameters.status ?? "ALL";

  const [bookings, requests, savedProfiles] =
    await Promise.all([
      prisma.booking.findMany({
        where: {
          status: {
            not: "CANCELLED",
          },
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
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.customerProfile.findMany(),
    ]);

  const profiles = new Map(
    savedProfiles.map((profile) => [
      profile.phoneKey,
      profile,
    ]),
  );

  const customers = new Map<string, Customer>();

  for (const request of requests) {
    const key = normalizePhone(request.phone);
    const saved = profiles.get(key);
    const customer = customers.get(key);

    if (customer) {
      customer.requests += 1;

      if (request.createdAt > customer.lastActivity) {
        customer.lastActivity = request.createdAt;
      }

      continue;
    }

    customers.set(key, {
      key,
      name: saved?.displayName ?? request.customerName,
      phone: saved?.phone ?? request.phone,
      email: saved?.email ?? request.email,
      rentals: 0,
      requests: 1,
      revenue: 0,
      paid: 0,
      outstanding: 0,
      lastActivity: request.createdAt,
      status: saved?.status ?? "NORMAL",
      notes: saved?.notes ?? null,
    });
  }

  for (const booking of bookings) {
    const key = normalizePhone(booking.phone);
    const saved = profiles.get(key);
    const customer = customers.get(key);

    if (customer) {
      customer.rentals += 1;
      customer.revenue += booking.totalPrice;
      customer.paid += booking.amountPaid;
      customer.outstanding += Math.max(
        booking.totalPrice - booking.amountPaid,
        0,
      );

      if (booking.createdAt > customer.lastActivity) {
        customer.lastActivity = booking.createdAt;
      }

      continue;
    }

    customers.set(key, {
      key,
      name: saved?.displayName ?? booking.customerName,
      phone: saved?.phone ?? booking.phone,
      email: saved?.email ?? booking.email,
      rentals: 1,
      requests: 0,
      revenue: booking.totalPrice,
      paid: booking.amountPaid,
      outstanding: Math.max(
        booking.totalPrice - booking.amountPaid,
        0,
      ),
      lastActivity: booking.createdAt,
      status: saved?.status ?? "NORMAL",
      notes: saved?.notes ?? null,
    });
  }

  const allCustomers = Array.from(customers.values());

  const filteredCustomers = allCustomers
    .filter((customer) => {
      const matchesQuery =
        !query ||
        [customer.name, customer.phone, customer.email]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        selectedStatus === "ALL" ||
        customer.status === selectedStatus;

      return matchesQuery && matchesStatus;
    })
    .sort(
      (first, second) =>
        second.lastActivity.getTime() -
        first.lastActivity.getTime(),
    );

  const totalRevenue = allCustomers.reduce(
    (total, customer) => total + customer.revenue,
    0,
  );

  const outstanding = allCustomers.reduce(
    (total, customer) => total + customer.outstanding,
    0,
  );

  const trusted = allCustomers.filter(
    (customer) => customer.status === "TRUSTED",
  ).length;

  const risky = allCustomers.filter(
    (customer) =>
      customer.status === "WATCHLIST" ||
      customer.status === "BLOCKED",
  ).length;

  const indicators = [
    {
      label: "Customers",
      value: allCustomers.length,
      icon: Users,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Trusted",
      value: trusted,
      icon: Star,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Requires attention",
      value: risky,
      icon: ShieldAlert,
      color: "bg-red-50 text-red-700",
    },
    {
      label: "Total revenue",
      value: formatMoney(totalRevenue),
      icon: CircleDollarSign,
      color: "bg-purple-50 text-purple-700",
    },
    {
      label: "Outstanding",
      value: formatMoney(outstanding),
      icon: Clock3,
      color: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Customer relationships
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-[#102e2b] sm:text-4xl">
          Customers
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          Rental history, payment information and internal
          customer management.
        </p>
      </header>

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

      <form className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]">
        <label className="relative">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

          <input
            name="query"
            defaultValue={parameters.query ?? ""}
            placeholder="Search name, phone or email"
            className="h-12 w-full rounded-xl border bg-neutral-50 pl-11 pr-4 text-sm outline-none"
          />
        </label>

        <select
          name="status"
          defaultValue={selectedStatus}
          className="h-12 rounded-xl border bg-neutral-50 px-4 text-sm"
        >
          <option value="ALL">All statuses</option>
          <option value="NORMAL">Normal</option>
          <option value="TRUSTED">Trusted</option>
          <option value="WATCHLIST">Watchlist</option>
          <option value="BLOCKED">Blocked</option>
        </select>

        <button
          type="submit"
          className="h-12 rounded-xl bg-[#0B1726] px-6 text-sm font-semibold text-white"
        >
          Search
        </button>
      </form>

      <section className="grid gap-4">
        {filteredCustomers.map((customer) => (
          <details
            key={customer.key}
            className="group overflow-hidden rounded-2xl border bg-white shadow-sm"
          >
            <summary className="grid cursor-pointer list-none gap-5 p-5 md:grid-cols-[1.3fr_repeat(4,0.55fr)] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">
                    {customer.name}
                  </h2>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[customer.status]}`}
                  >
                    {statusLabels[customer.status]}
                  </span>
                </div>

                <p className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
                  <Phone className="size-3.5" />
                  {customer.phone}
                </p>

                {customer.email && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                    <Mail className="size-3.5" />
                    {customer.email}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-neutral-500">
                  Rentals
                </p>
                <p className="font-semibold">
                  {customer.rentals}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-500">
                  Revenue
                </p>
                <p className="font-semibold">
                  {formatMoney(customer.revenue)}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-500">
                  Outstanding
                </p>
                <p className="font-semibold text-red-700">
                  {formatMoney(customer.outstanding)}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-500">
                  Last activity
                </p>
                <p className="font-semibold">
                  {formatDate(customer.lastActivity)}
                </p>
              </div>
            </summary>

            <form
              action={updateCustomerProfile}
              className="border-t bg-neutral-50 p-5"
            >
              <input
                type="hidden"
                name="displayName"
                value={customer.name}
              />

              <input
                type="hidden"
                name="phone"
                value={customer.phone}
              />

              <input
                type="hidden"
                name="email"
                value={customer.email ?? ""}
              />

              <div className="grid gap-4 md:grid-cols-[220px_1fr_auto] md:items-end">
                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Customer status
                  </span>

                  <select
                    name="status"
                    defaultValue={customer.status}
                    className="h-12 w-full rounded-xl border bg-white px-4 text-sm"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="TRUSTED">Trusted</option>
                    <option value="WATCHLIST">
                      Watchlist
                    </option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Internal notes
                  </span>

                  <textarea
                    name="notes"
                    defaultValue={customer.notes ?? ""}
                    rows={3}
                    placeholder="Damage history, payment behaviour or preferences..."
                    className="w-full rounded-xl border bg-white px-4 py-3 text-sm"
                  />
                </label>

                <button
                  type="submit"
                  className="min-h-12 rounded-xl bg-[#0B1726] px-5 text-sm font-semibold text-white"
                >
                  Save profile
                </button>
              </div>
            </form>
          </details>
        ))}

        {filteredCustomers.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
            <Users className="mx-auto size-10 text-neutral-300" />
            <p className="mt-4 font-semibold">
              No customers found
            </p>
          </div>
        )}
      </section>
    </div>
  );
}