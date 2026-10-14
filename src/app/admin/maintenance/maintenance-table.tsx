"use client";

import {
  CalendarClock,
  Check,
  RotateCcw,
  TriangleAlert,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useState,
  useTransition,
} from "react";

import {
  cancelMaintenance,
  completeMaintenance,
  rescheduleMaintenance,
  type MaintenanceManagementResult,
} from "./actions";
import { EuropeanDateInput } from "@/components/ui/european-date-input";

type MaintenanceRow = {
  id: string;
  type: string;
  status: string;
  scheduledDate: string;
  endDate: string | null;
  completedDate: string | null;
  nextDueDate: string | null;
  mileageAtService: number | null;
  nextServiceMileage: number | null;
  cost: number | null;
  garage: string | null;
  notes: string | null;
  hasBookingConflict: boolean;
  vehicle: {
    brand: string;
    model: string;
    registration: string;
    mileage: number;
  };
};

type MaintenanceTableProps = {
  events: MaintenanceRow[];
};

const typeLabels: Record<string, string> = {
  OIL_CHANGE: "Vidange",
  BRAKE_PADS: "Plaquettes de frein",
  ADBLUE: "AdBlue",
  TIRES: "Pneus",
  TECHNICAL_INSPECTION: "Contrôle technique",
  INSURANCE: "Assurance",
  REPAIR: "Réparation",
  CLEANING: "Nettoyage",
  OTHER: "Autre entretien",
};

const typeStyles: Record<string, string> = {
  OIL_CHANGE: "bg-amber-100 text-amber-800",
  BRAKE_PADS: "bg-red-100 text-red-800",
  ADBLUE: "bg-violet-100 text-violet-800",
  TIRES: "bg-slate-100 text-slate-800",
  TECHNICAL_INSPECTION:
    "bg-orange-100 text-orange-800",
  INSURANCE: "bg-emerald-100 text-emerald-800",
  REPAIR: "bg-rose-100 text-rose-800",
  CLEANING: "bg-cyan-100 text-cyan-800",
  OTHER: "bg-neutral-100 text-neutral-800",
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusStyles: Record<string, string> = {
  SCHEDULED: "border-blue-200 bg-blue-50 text-blue-700",
  IN_PROGRESS:
    "border-amber-200 bg-amber-50 text-amber-700",
  COMPLETED:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED:
    "border-neutral-200 bg-neutral-50 text-neutral-500",
};

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function formatNumber(value: number | null) {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-GB").format(value);
}

export function MaintenanceTable({
  events,
}: MaintenanceTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<
    string | null
  >(null);
  const [rescheduleDates, setRescheduleDates] =
    useState<Record<string, string>>({});
  const [feedback, setFeedback] =
    useState<MaintenanceManagementResult | null>(null);

  function execute(
    action: () => Promise<MaintenanceManagementResult>,
  ) {
    setFeedback(null);

    startTransition(async () => {
      const result = await action();

      setFeedback(result);

      if (result.success) {
        setExpandedId(null);
        router.refresh();
      }
    });
  }

  if (events.length === 0) {
    return (
      <div className="rounded-xl border bg-background px-6 py-16 text-center">
        <CalendarClock className="mx-auto size-10 text-muted-foreground" />

        <h2 className="mt-4 text-lg font-semibold">
          No maintenance records found
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Change the filters or schedule maintenance from the
          planning calendar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm font-medium ${
            feedback.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-semibold">
                  Vehicle
                </th>
                <th className="px-4 py-3 font-semibold">
                  Maintenance
                </th>
                <th className="px-4 py-3 font-semibold">
                  Scheduled
                </th>
                <th className="px-4 py-3 font-semibold">
                  Mileage
                </th>
                <th className="px-4 py-3 font-semibold">
                  Next service
                </th>
                <th className="px-4 py-3 font-semibold">
                  Cost
                </th>
                <th className="px-4 py-3 font-semibold">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {events.map((event) => {
                const editable =
                  event.status !== "COMPLETED" &&
                  event.status !== "CANCELLED";

                const expanded =
                  expandedId === event.id;

                return (
                  <tr
                    key={event.id}
                    className={
                      event.hasBookingConflict
                        ? "bg-red-50/40"
                        : ""
                    }
                  >
                    <td className="px-4 py-4 align-top">
                      <p className="font-semibold">
                        {event.vehicle.brand}{" "}
                        {event.vehicle.model}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {event.vehicle.registration}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Current:{" "}
                        {formatNumber(
                          event.vehicle.mileage,
                        )}{" "}
                        km
                      </p>

                      {event.hasBookingConflict && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold text-red-700">
                          <TriangleAlert className="size-3" />
                          Needs rescheduling
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          typeStyles[event.type] ??
                          typeStyles.OTHER
                        }`}
                      >
                        {typeLabels[event.type] ??
                          event.type}
                      </span>

                      {event.garage && (
                        <p className="mt-2 max-w-48 truncate text-xs text-muted-foreground">
                          {event.garage}
                        </p>
                      )}

                      {event.notes && (
                        <p
                          title={event.notes}
                          className="mt-1 max-w-48 truncate text-xs text-muted-foreground"
                        >
                          {event.notes}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4 align-top">
                      <p className="font-medium">
                        {formatDate(
                          event.scheduledDate,
                        )}
                      </p>

                      {event.endDate && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Until{" "}
                          {formatDate(event.endDate)}
                        </p>
                      )}

                      {event.completedDate && (
                        <p className="mt-1 text-xs text-emerald-700">
                          Completed{" "}
                          {formatDate(
                            event.completedDate,
                          )}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4 align-top">
                      {formatNumber(
                        event.mileageAtService,
                      )}{" "}
                      {event.mileageAtService !== null
                        ? "km"
                        : ""}
                    </td>

                    <td className="px-4 py-4 align-top">
                      <p>
                        {formatNumber(
                          event.nextServiceMileage,
                        )}{" "}
                        {event.nextServiceMileage !== null
                          ? "km"
                          : ""}
                      </p>

                      {event.nextDueDate && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(
                            event.nextDueDate,
                          )}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4 align-top font-medium">
                      {event.cost !== null
                        ? `${formatNumber(event.cost)} MAD`
                        : "—"}
                    </td>

                    <td className="px-4 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          statusStyles[event.status] ??
                          statusStyles.SCHEDULED
                        }`}
                      >
                        {statusLabels[event.status] ??
                          event.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <div className="flex justify-end gap-2">
                        {editable && (
                          <>
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() =>
                                execute(() =>
                                  completeMaintenance(
                                    event.id,
                                  ),
                                )
                              }
                              className="inline-flex min-h-9 items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                            >
                              <Check className="mr-1 size-3.5" />
                              Complete
                            </button>

                            <button
                              type="button"
                              disabled={pending}
                              onClick={() => {
                                setExpandedId(
                                  expanded
                                    ? null
                                    : event.id,
                                );

                                setRescheduleDates(
                                  (current) => ({
                                    ...current,
                                    [event.id]:
                                      current[event.id] ??
                                      event.scheduledDate,
                                  }),
                                );
                              }}
                              className="inline-flex min-h-9 items-center rounded-md border px-3 text-xs font-semibold transition hover:bg-muted disabled:opacity-50"
                            >
                              <RotateCcw className="mr-1 size-3.5" />
                              Reschedule
                            </button>

                            <button
                              type="button"
                              disabled={pending}
                              onClick={() =>
                                execute(() =>
                                  cancelMaintenance(
                                    event.id,
                                  ),
                                )
                              }
                              className="inline-flex size-9 items-center justify-center rounded-md border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                              title="Cancel maintenance"
                            >
                              <X className="size-4" />
                            </button>
                          </>
                        )}
                      </div>

                      {expanded && editable && (
                        <div className="mt-3 min-w-64 rounded-lg border bg-muted/30 p-3">
                          <p className="mb-2 text-xs font-semibold">
                            New maintenance date
                          </p>

                          <EuropeanDateInput
                            id={`reschedule-${event.id}`}
                            value={
                              rescheduleDates[
                                event.id
                              ] ?? ""
                            }
                            onChange={(value) =>
                              setRescheduleDates(
                                (current) => ({
                                  ...current,
                                  [event.id]: value,
                                }),
                              )
                            }
                            required
                            placeholder="DD/MM/YYYY"
                            className="min-h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-[#a47d2f]"
                          />

                          <button
                            type="button"
                            disabled={
                              pending ||
                              !rescheduleDates[
                                event.id
                              ]
                            }
                            onClick={() =>
                              execute(() =>
                                rescheduleMaintenance(
                                  event.id,
                                  rescheduleDates[
                                    event.id
                                  ] ?? "",
                                ),
                              )
                            }
                            className="mt-3 inline-flex min-h-9 w-full items-center justify-center rounded-md bg-[#0B1726] px-3 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            Save new date
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}