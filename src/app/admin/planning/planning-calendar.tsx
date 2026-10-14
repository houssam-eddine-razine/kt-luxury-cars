import Link from "next/link";
import {
  CarFront,
  Droplets,
  Plus,
  ShieldCheck,
  Wrench,
} from "lucide-react";

type CalendarDay = {
  iso: string;
  weekday: string;
  label: string;
  isToday: boolean;
};

type CalendarBooking = {
  id: string;
  reference: string;
  customerName: string;
  pickupDate: string;
  returnDate: string;
  status: string;
};

type CalendarMaintenance = {
  id: string;
  type: string;
  status: string;
  scheduledDate: string;
  endDate: string | null;
  blocksAvailability: boolean;
};

type CalendarVehicle = {
  id: string;
  brand: string;
  model: string;
  registration: string;
  status: string;
  bookings: CalendarBooking[];
  maintenanceEvents: CalendarMaintenance[];
};

type PlanningCalendarProps = {
  startDate: string;
  zoom: string;
  cellWidth: number;
  days: CalendarDay[];
  vehicles: CalendarVehicle[];
};

const bookingStyles: Record<string, string> = {
  PENDING:
    "border-amber-200 bg-amber-100 text-amber-800",
  CONFIRMED:
    "border-blue-200 bg-blue-100 text-blue-800",
  ACTIVE:
    "border-emerald-200 bg-emerald-100 text-emerald-800",
  COMPLETED:
    "border-neutral-200 bg-neutral-100 text-neutral-700",
};

const maintenanceStyles: Record<string, string> = {
  OIL_CHANGE:
    "border-amber-300 bg-amber-100 text-amber-900",
  BRAKE_PADS:
    "border-red-300 bg-red-100 text-red-900",
  ADBLUE:
    "border-violet-300 bg-violet-100 text-violet-900",
  TIRES:
    "border-slate-300 bg-slate-100 text-slate-900",
  TECHNICAL_INSPECTION:
    "border-orange-300 bg-orange-100 text-orange-900",
  INSURANCE:
    "border-emerald-300 bg-emerald-100 text-emerald-900",
  REPAIR:
    "border-rose-300 bg-rose-100 text-rose-900",
  CLEANING:
    "border-cyan-300 bg-cyan-100 text-cyan-900",
  OTHER:
    "border-neutral-300 bg-neutral-100 text-neutral-800",
};

const maintenanceLabels: Record<string, string> = {
  OIL_CHANGE: "Vidange",
  BRAKE_PADS: "Plaquettes",
  ADBLUE: "AdBlue",
  TIRES: "Pneus",
  TECHNICAL_INSPECTION: "Contrôle",
  INSURANCE: "Assurance",
  REPAIR: "Réparation",
  CLEANING: "Nettoyage",
  OTHER: "Entretien",
};

function MaintenanceIcon({
  type,
}: {
  type: string;
}) {
  if (type === "ADBLUE" || type === "OIL_CHANGE") {
    return <Droplets className="size-3 shrink-0" />;
  }

  if (type === "INSURANCE") {
    return <ShieldCheck className="size-3 shrink-0" />;
  }

  return <Wrench className="size-3 shrink-0" />;
}

export function PlanningCalendar({
  startDate,
  zoom,
  cellWidth,
  days,
  vehicles,
}: PlanningCalendarProps) {
  const vehicleColumnWidth = 230;
  const compact = cellWidth < 60;
  const detailed = cellWidth >= 90;

  return (
    <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
      <div className="overflow-x-auto overscroll-x-contain">
        <div
          className="min-w-max"
          style={{
            width: `${
              vehicleColumnWidth +
              days.length * cellWidth
            }px`,
          }}
        >
          <div
            className="sticky top-0 z-20 grid border-b bg-background"
            style={{
              gridTemplateColumns: `${vehicleColumnWidth}px repeat(${days.length}, ${cellWidth}px)`,
            }}
          >
            <div className="sticky left-0 z-30 flex items-center border-r bg-background px-4 py-3 font-semibold">
              Fleet
            </div>

            {days.map((day) => (
              <div
                key={day.iso}
                className={`border-r px-1 py-3 text-center ${
                  day.isToday
                    ? "bg-[#d4aa50]/20"
                    : ""
                }`}
              >
                {!compact && (
                  <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {day.weekday}
                  </p>
                )}

                <p
                  className={`font-semibold ${
                    compact
                      ? "text-[9px]"
                      : "mt-1 text-xs"
                  }`}
                >
                  {compact
                    ? day.label.slice(0, 2)
                    : day.label}
                </p>
              </div>
            ))}
          </div>

          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`grid border-b last:border-b-0 ${
                detailed ? "min-h-24" : "min-h-20"
              }`}
              style={{
                gridTemplateColumns: `${vehicleColumnWidth}px repeat(${days.length}, ${cellWidth}px)`,
              }}
            >
              <div className="sticky left-0 z-10 flex items-center gap-3 border-r bg-background px-4 py-3 shadow-[4px_0_8px_rgba(0,0,0,0.03)]">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  {vehicle.status === "MAINTENANCE" ? (
                    <Wrench className="size-4 text-amber-700" />
                  ) : (
                    <CarFront className="size-4 text-primary" />
                  )}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {vehicle.brand} {vehicle.model}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {vehicle.registration}
                  </p>
                </div>
              </div>

              {days.map((day, dayIndex) => {
                const booking = vehicle.bookings.find(
                  (item) =>
                    day.iso >= item.pickupDate &&
                    day.iso < item.returnDate,
                );

                const maintenance =
                  vehicle.maintenanceEvents.find((item) => {
                    const finalDate =
                      item.endDate ??
                      item.scheduledDate;

                    return (
                      day.iso >= item.scheduledDate &&
                      day.iso <= finalDate
                    );
                  });

                const previousDay =
                  dayIndex > 0
                    ? days[dayIndex - 1]
                    : undefined;

                const bookingBegins =
                  booking &&
                  (!previousDay ||
                    previousDay.iso <
                      booking.pickupDate);

                const maintenanceBegins =
                  maintenance &&
                  (!previousDay ||
                    previousDay.iso <
                      maintenance.scheduledDate);

                if (booking) {
                  return (
                    <div
                      key={day.iso}
                      className={`relative border-r p-1 ${
                        day.isToday
                          ? "bg-[#d4aa50]/10"
                          : ""
                      }`}
                    >
                      <div
                        title={`${booking.reference} — ${booking.customerName}`}
                        className={`flex h-full min-h-16 flex-col justify-center overflow-hidden rounded-md border p-1.5 ${
                          bookingStyles[
                            booking.status
                          ] ??
                          bookingStyles.CONFIRMED
                        }`}
                      >
                        {bookingBegins &&
                        !compact ? (
                          <>
                            <p className="truncate text-[11px] font-semibold">
                              {booking.customerName}
                            </p>

                            {detailed && (
                              <p className="mt-1 truncate text-[9px] opacity-75">
                                {booking.reference}
                              </p>
                            )}
                          </>
                        ) : (
                          <span className="mx-auto size-1.5 rounded-full bg-current opacity-50" />
                        )}
                      </div>

                      {maintenance && (
                        <span
                          title={
                            maintenanceLabels[
                              maintenance.type
                            ] ?? "Maintenance"
                          }
                          className={`absolute bottom-1 right-1 flex size-5 items-center justify-center rounded-full border ${
                            maintenanceStyles[
                              maintenance.type
                            ] ??
                            maintenanceStyles.OTHER
                          }`}
                        >
                          <MaintenanceIcon
                            type={maintenance.type}
                          />
                        </span>
                      )}
                    </div>
                  );
                }

                if (maintenance) {
                  const maintenanceLabel =
                    maintenanceLabels[
                      maintenance.type
                    ] ?? "Maintenance";

                  return (
                    <div
                      key={day.iso}
                      className={`border-r p-1 ${
                        day.isToday
                          ? "bg-[#d4aa50]/10"
                          : ""
                      }`}
                    >
                      <div
                        title={`${maintenanceLabel}${
                          maintenance.blocksAvailability
                            ? " — vehicle unavailable"
                            : ""
                        }`}
                        className={`flex h-full min-h-16 items-center justify-center overflow-hidden rounded-md border p-1.5 ${
                          maintenanceStyles[
                            maintenance.type
                          ] ??
                          maintenanceStyles.OTHER
                        }`}
                      >
                        {maintenanceBegins &&
                        !compact ? (
                          <span className="flex min-w-0 items-center gap-1 text-[10px] font-semibold">
                            <MaintenanceIcon
                              type={maintenance.type}
                            />

                            <span className="truncate">
                              {maintenanceLabel}
                            </span>
                          </span>
                        ) : (
                          <MaintenanceIcon
                            type={maintenance.type}
                          />
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={day.iso}
                    className={`group flex min-h-20 items-center justify-center gap-1 border-r transition hover:bg-emerald-50 ${
                      day.isToday
                        ? "bg-[#d4aa50]/10"
                        : ""
                    }`}
                  >
                    <Link
                      href={`/admin/planning?start=${startDate}&zoom=${zoom}&vehicleId=${vehicle.id}&pickupDate=${day.iso}#new-booking`}
                      title={`Create booking for ${vehicle.brand} ${vehicle.model}`}
                      className="flex size-7 items-center justify-center rounded-full text-transparent transition group-hover:bg-emerald-100 group-hover:text-emerald-700"
                    >
                      <Plus className="size-3.5" />
                    </Link>

                    {!compact && (
                      <Link
                        href={`/admin/planning?start=${startDate}&zoom=${zoom}&maintenanceVehicleId=${vehicle.id}&maintenanceDate=${day.iso}#new-maintenance`}
                        title={`Schedule maintenance for ${vehicle.brand} ${vehicle.model}`}
                        className="flex size-7 items-center justify-center rounded-full text-transparent transition group-hover:bg-amber-100 group-hover:text-amber-700"
                      >
                        <Wrench className="size-3.5" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {vehicles.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Add vehicles before creating bookings or maintenance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}