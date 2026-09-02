import Link from "next/link";
import {
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  UserRound,
} from "lucide-react";

import { updateReservationRequest } from "./actions";
import { prisma } from "@/lib/prisma";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const reservationStatuses = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

type ReservationStatus =
  (typeof reservationStatuses)[number];

type ReservationsPageProps = {
  searchParams: Promise<{
    status?: string;
    query?: string;
  }>;
};

const statusLabels: Record<
  ReservationStatus,
  string
> = {
  NEW: "New request",
  CONTACTED: "Contacted",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusStyles: Record<
  ReservationStatus,
  string
> = {
  NEW: "bg-purple-100 text-purple-700",
  CONTACTED: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-neutral-200 text-neutral-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const locationLabels: Record<string, string> = {
  airport: "Marrakech Airport",
  cityCentre: "Marrakech city centre",
  trainStation: "Marrakech train station",
  hotelRiad: "Hotel or riad",
  privateVilla: "Private villa",
};

function isReservationStatus(
  value: string | undefined,
): value is ReservationStatus {
  return reservationStatuses.some(
    (status) => status === value,
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
  }).format(value);
}

function rentalDuration(
  pickupDate: Date,
  returnDate: Date,
) {
  const milliseconds =
    returnDate.getTime() - pickupDate.getTime();

  return Math.max(
    1,
    Math.round(milliseconds / 86_400_000),
  );
}

export default async function ReservationsPage({
  searchParams,
}: ReservationsPageProps) {
  const parameters = await searchParams;

  const selectedStatus = isReservationStatus(
    parameters.status,
  )
    ? parameters.status
    : undefined;

  const query = parameters.query?.trim() ?? "";

  const requests =
    await prisma.reservationRequest.findMany({
      where: {
        ...(selectedStatus
          ? {
              status: selectedStatus,
            }
          : {}),

        ...(query
          ? {
              OR: [
                {
                  reference: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  customerName: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  phone: {
                    contains: query,
                  },
                },
                {
                  email: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  vehicle: {
                    is: {
                      brand: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                  },
                },
                {
                  vehicle: {
                    is: {
                      model: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              ],
            }
          : {}),
      },

      orderBy: [
        {
          status: "asc",
        },
        {
          createdAt: "desc",
        },
      ],

      include: {
        vehicle: {
          include: {
            images: {
              where: {
                isCover: true,
              },
              take: 1,
            },
          },
        },
      },
    });

  const [
    totalRequests,
    newRequests,
    contactedRequests,
    confirmedRequests,
  ] = await Promise.all([
    prisma.reservationRequest.count(),

    prisma.reservationRequest.count({
      where: {
        status: "NEW",
      },
    }),

    prisma.reservationRequest.count({
      where: {
        status: "CONTACTED",
      },
    }),

    prisma.reservationRequest.count({
      where: {
        status: "CONFIRMED",
      },
    }),
  ]);

  const indicators = [
    {
      label: "Total requests",
      value: totalRequests,
      icon: CalendarDays,
      color: "bg-neutral-100 text-neutral-700",
    },
    {
      label: "New requests",
      value: newRequests,
      icon: Clock3,
      color: "bg-purple-100 text-purple-700",
    },
    {
      label: "Contacted",
      value: contactedRequests,
      icon: MessageCircle,
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Confirmed",
      value: confirmedRequests,
      icon: CheckCircle2,
      color: "bg-emerald-100 text-emerald-700",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Customer enquiries
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Reservation requests
        </h1>

        <p className="mt-2 text-muted-foreground">
          Track every website request, contact customers and update
          its progress.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {indicators.map((indicator) => {
          const Icon = indicator.icon;

          return (
            <Card key={indicator.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-full ${indicator.color}`}
                >
                  <Icon className="size-5" />
                </span>

                <div>
                  <p className="text-sm text-muted-foreground">
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

      <Card>
        <CardContent className="p-4 sm:p-5">
          <form
            method="get"
            className="flex flex-col gap-3 lg:flex-row"
          >
            <label className="relative flex-1">
              <span className="sr-only">
                Search requests
              </span>

              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="search"
                name="query"
                defaultValue={query}
                placeholder="Search customer, phone, reference or vehicle"
                className="min-h-11 w-full rounded-md border border-input bg-background pl-11 pr-4 text-sm outline-none focus:border-ring focus:ring-4 focus:ring-ring/20"
              />
            </label>

            <select
              name="status"
              defaultValue={selectedStatus ?? ""}
              className="min-h-11 rounded-md border border-input bg-background px-4 text-sm outline-none focus:border-ring focus:ring-4 focus:ring-ring/20 lg:min-w-48"
            >
              <option value="">All statuses</option>

              {reservationStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>

            <Button type="submit">
              <Search className="mr-2 size-4" />
              Search
            </Button>

            {(query || selectedStatus) && (
              <Link
                href="/admin/reservations"
                className={buttonVariants({
                  variant: "outline",
                })}
              >
                Clear
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CalendarDays className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
              No reservation requests
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              New customer requests from the website will appear
              here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Showing {requests.length} request
            {requests.length === 1 ? "" : "s"}
          </p>

          {requests.map((request) => {
            const vehicleName = [
              request.vehicle.brand,
              request.vehicle.model,
              request.vehicle.trim,
            ]
              .filter(Boolean)
              .join(" ");

            const coverImage =
              request.vehicle.images[0]?.url;

            const numberOfDays = rentalDuration(
              request.pickupDate,
              request.returnDate,
            );

            const estimatedTotal =
              numberOfDays *
              request.advertisedDailyRate;

            const phoneDigits =
              request.phone.replace(/\D/g, "");

            const replyMessage = encodeURIComponent(
              `Hello ${request.customerName}, this is KT Luxury Cars regarding your request ${request.reference} for the ${vehicleName}.`,
            );

            const whatsappUrl =
              `https://wa.me/${phoneDigits}?text=${replyMessage}`;

            return (
              <Card
                key={request.id}
                className={
                  request.status === "NEW"
                    ? "border-purple-200 shadow-sm"
                    : ""
                }
              >
                <CardContent className="p-0">
                  <div className="grid lg:grid-cols-[220px_1fr]">
                    <div className="relative min-h-48 overflow-hidden bg-muted lg:min-h-full">
                      {coverImage ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url("${coverImage}")`,
                          }}
                          role="img"
                          aria-label={vehicleName}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CarFront className="size-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-5 p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-mono text-sm font-semibold">
                              {request.reference}
                            </p>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                statusStyles[
                                  request.status
                                ]
                              }`}
                            >
                              {
                                statusLabels[
                                  request.status
                                ]
                              }
                            </span>

                            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase">
                              {request.locale}
                            </span>
                          </div>

                          <h2 className="mt-3 text-xl font-semibold">
                            {vehicleName}
                          </h2>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Received{" "}
                            {formatDateTime(
                              request.createdAt,
                            )}
                          </p>
                        </div>

                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={buttonVariants({
                            className:
                              "bg-[#128C5A] hover:bg-[#0F774C]",
                          })}
                        >
                          <MessageCircle className="mr-2 size-4" />
                          Reply on WhatsApp
                        </a>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-lg bg-muted/40 p-4">
                          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                            <UserRound className="size-4" />
                            Customer
                          </p>

                          <p className="mt-2 font-semibold">
                            {request.customerName}
                          </p>

                          <a
                            href={`tel:${request.phone}`}
                            className="mt-1 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                          >
                            <Phone className="size-3.5" />
                            {request.phone}
                          </a>

                          {request.email && (
                            <a
                              href={`mailto:${request.email}`}
                              className="mt-1 flex items-center gap-2 break-all text-sm text-muted-foreground hover:text-foreground"
                            >
                              <Mail className="size-3.5 shrink-0" />
                              {request.email}
                            </a>
                          )}
                        </div>

                        <div className="rounded-lg bg-muted/40 p-4">
                          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                            <CalendarDays className="size-4" />
                            Rental dates
                          </p>

                          <p className="mt-2 font-semibold">
                            {formatDate(
                              request.pickupDate,
                            )}
                          </p>

                          <p className="text-sm text-muted-foreground">
                            to{" "}
                            {formatDate(
                              request.returnDate,
                            )}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {numberOfDays} day
                            {numberOfDays === 1 ? "" : "s"}
                          </p>
                        </div>

                        <div className="rounded-lg bg-muted/40 p-4">
                          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                            <MapPin className="size-4" />
                            Delivery
                          </p>

                          <p className="mt-2 font-semibold">
                            {locationLabels[
                              request.deliveryLocation
                            ] ??
                              request.deliveryLocation}
                          </p>
                        </div>

                        <div className="rounded-lg bg-muted/40 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                            Advertised estimate
                          </p>

                          <p className="mt-2 text-xl font-semibold">
                            {formatPrice(estimatedTotal)} MAD
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatPrice(
                              request.advertisedDailyRate,
                            )}{" "}
                            MAD × {numberOfDays} days
                          </p>
                        </div>
                      </div>

                      <details className="rounded-lg border">
                        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
                          Manage request
                        </summary>

                        <form
                          action={updateReservationRequest.bind(
                            null,
                            request.id,
                          )}
                          className="space-y-4 border-t p-4"
                        >
                          <div className="space-y-2">
                            <label
                              htmlFor={`status-${request.id}`}
                              className="text-sm font-medium"
                            >
                              Request status
                            </label>

                            <select
                              id={`status-${request.id}`}
                              name="status"
                              defaultValue={request.status}
                              className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                            >
                              {reservationStatuses.map(
                                (status) => (
                                  <option
                                    key={status}
                                    value={status}
                                  >
                                    {statusLabels[status]}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor={`notes-${request.id}`}
                              className="text-sm font-medium"
                            >
                              Internal notes
                            </label>

                            <Textarea
                              id={`notes-${request.id}`}
                              name="internalNotes"
                              rows={4}
                              placeholder="Customer preferences, agreed price, follow-up details..."
                              defaultValue={
                                request.internalNotes ?? ""
                              }
                            />

                            <p className="text-xs text-muted-foreground">
                              These notes are visible only in the
                              admin dashboard.
                            </p>
                          </div>

                          <Button type="submit">
                            Save request
                          </Button>
                        </form>
                      </details>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}