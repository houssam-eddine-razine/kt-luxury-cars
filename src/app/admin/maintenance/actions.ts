"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type MaintenanceManagementResult = {
  success: boolean;
  message: string;
};

type MaintenanceExpenseCategory =
  | "INSURANCE"
  | "REPAIR"
  | "PARTS"
  | "ADBLUE"
  | "CLEANING"
  | "OTHER";

function utcToday() {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    ),
  );
}

function parseIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? null : date;
}

async function isAuthenticatedAdministrator() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  return !error && Boolean(data?.claims);
}

function maintenanceTypeLabel(type: string) {
  const labels: Record<string, string> = {
    OIL_CHANGE: "Oil change",
    BRAKE_PADS: "Brake pads",
    ADBLUE: "AdBlue",
    TIRES: "Tires",
    TECHNICAL_INSPECTION: "Technical inspection",
    INSURANCE: "Insurance",
    REPAIR: "Repair",
    CLEANING: "Cleaning",
    OTHER: "Maintenance",
  };

  return labels[type] ?? "Maintenance";
}

function maintenanceExpenseCategory(
  type: string,
): MaintenanceExpenseCategory {
  if (type === "INSURANCE") {
    return "INSURANCE";
  }

  if (type === "REPAIR") {
    return "REPAIR";
  }

  if (type === "ADBLUE") {
    return "ADBLUE";
  }

  if (type === "CLEANING") {
    return "CLEANING";
  }

  if (
    type === "OIL_CHANGE" ||
    type === "BRAKE_PADS" ||
    type === "TIRES"
  ) {
    return "PARTS";
  }

  return "OTHER";
}

function refreshMaintenancePages() {
  revalidatePath("/admin");
  revalidatePath("/admin/planning");
  revalidatePath("/admin/maintenance");
  revalidatePath("/admin/finances");
}

export async function completeMaintenance(
  maintenanceId: string,
): Promise<MaintenanceManagementResult> {
  if (!(await isAuthenticatedAdministrator())) {
    return {
      success: false,
      message: "Your session has expired.",
    };
  }

  const maintenance =
    await prisma.maintenanceEvent.findUnique({
      where: {
        id: maintenanceId,
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
    });

  if (!maintenance) {
    return {
      success: false,
      message: "Maintenance record not found.",
    };
  }

  if (maintenance.status === "CANCELLED") {
    return {
      success: false,
      message:
        "Cancelled maintenance cannot be completed.",
    };
  }

  const completionDate =
    maintenance.completedDate ?? utcToday();

  const vehicleName =
    `${maintenance.vehicle.brand} ${maintenance.vehicle.model}`;

  const expenseTitle =
    `${maintenanceTypeLabel(maintenance.type)} · ${vehicleName}`;

  try {
    const result = await prisma.$transaction(
      async (transaction) => {
        /*
         * Only the first request changes the maintenance status.
         * Repeated clicks update zero rows.
         */
        const updated =
          await transaction.maintenanceEvent.updateMany({
            where: {
              id: maintenance.id,
              status: {
                in: ["SCHEDULED", "IN_PROGRESS"],
              },
            },
            data: {
              status: "COMPLETED",
              completedDate: completionDate,
              blocksAvailability: false,
            },
          });

        if (
          maintenance.mileageAtService !== null &&
          maintenance.mileageAtService >
            maintenance.vehicle.mileage
        ) {
          await transaction.vehicle.update({
            where: {
              id: maintenance.vehicle.id,
            },
            data: {
              mileage: maintenance.mileageAtService,
            },
          });
        }

        /*
         * maintenanceEventId is unique, so one maintenance
         * record can only create one linked expense.
         */
        if (
          maintenance.cost !== null &&
          maintenance.cost > 0
        ) {
          await transaction.expense.upsert({
            where: {
              maintenanceEventId: maintenance.id,
            },
            create: {
              title: expenseTitle,
              category: maintenanceExpenseCategory(
                maintenance.type,
              ),
              status: "PAID",
              source: "MAINTENANCE",
              amount: maintenance.cost,
              expenseDate: completionDate,
              paidDate: completionDate,
              supplier: maintenance.garage,
              notes: maintenance.notes,
              recurring: false,
              vehicleId: maintenance.vehicle.id,
              maintenanceEventId: maintenance.id,
            },
            update: {
              title: expenseTitle,
              category: maintenanceExpenseCategory(
                maintenance.type,
              ),
              status: "PAID",
              source: "MAINTENANCE",
              amount: maintenance.cost,
              expenseDate: completionDate,
              paidDate: completionDate,
              supplier: maintenance.garage,
              notes: maintenance.notes,
              vehicleId: maintenance.vehicle.id,
            },
          });
        }

        return {
          newlyCompleted: updated.count === 1,
        };
      },
    );

    refreshMaintenancePages();

    if (!result.newlyCompleted) {
      return {
        success: true,
        message:
          maintenance.cost !== null &&
          maintenance.cost > 0
            ? "Maintenance was already completed. Its finance expense was verified without creating a duplicate."
            : "Maintenance was already completed.",
      };
    }

    return {
      success: true,
      message:
        maintenance.cost !== null &&
        maintenance.cost > 0
          ? `${vehicleName} maintenance completed and ${maintenance.cost} MAD was recorded in Finances.`
          : `${vehicleName} maintenance marked as completed. No expense was created because no cost was entered.`,
    };
  } catch (error) {
    console.error("Maintenance completion failed:", error);

    return {
      success: false,
      message:
        "Maintenance could not be completed. No finance expense was created.",
    };
  }
}

export async function cancelMaintenance(
  maintenanceId: string,
): Promise<MaintenanceManagementResult> {
  if (!(await isAuthenticatedAdministrator())) {
    return {
      success: false,
      message: "Your session has expired.",
    };
  }

  const maintenance =
    await prisma.maintenanceEvent.findUnique({
      where: {
        id: maintenanceId,
      },
      select: {
        id: true,
        status: true,
        vehicle: {
          select: {
            brand: true,
            model: true,
          },
        },
      },
    });

  if (!maintenance) {
    return {
      success: false,
      message: "Maintenance record not found.",
    };
  }

  if (maintenance.status === "COMPLETED") {
    return {
      success: false,
      message:
        "Completed maintenance cannot be cancelled because it may already have a finance expense.",
    };
  }

  if (maintenance.status === "CANCELLED") {
    return {
      success: true,
      message: "This maintenance is already cancelled.",
    };
  }

  try {
    const updated =
      await prisma.maintenanceEvent.updateMany({
        where: {
          id: maintenance.id,
          status: {
            in: ["SCHEDULED", "IN_PROGRESS"],
          },
        },
        data: {
          status: "CANCELLED",
          blocksAvailability: false,
        },
      });

    if (updated.count === 0) {
      return {
        success: false,
        message:
          "The maintenance status changed before this action was completed. Refresh the page.",
      };
    }
  } catch (error) {
    console.error(
      "Maintenance cancellation failed:",
      error,
    );

    return {
      success: false,
      message: "Maintenance could not be cancelled.",
    };
  }

  refreshMaintenancePages();

  return {
    success: true,
    message:
      `${maintenance.vehicle.brand} ${maintenance.vehicle.model} maintenance cancelled.`,
  };
}

export async function rescheduleMaintenance(
  maintenanceId: string,
  newDateValue: string,
): Promise<MaintenanceManagementResult> {
  if (!(await isAuthenticatedAdministrator())) {
    return {
      success: false,
      message: "Your session has expired.",
    };
  }

  const newDate = parseIsoDate(newDateValue);

  if (!newDate) {
    return {
      success: false,
      message: "Enter a valid rescheduling date.",
    };
  }

  const maintenance =
    await prisma.maintenanceEvent.findUnique({
      where: {
        id: maintenanceId,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
          },
        },
      },
    });

  if (!maintenance) {
    return {
      success: false,
      message: "Maintenance record not found.",
    };
  }

  if (
    maintenance.status === "COMPLETED" ||
    maintenance.status === "CANCELLED"
  ) {
    return {
      success: false,
      message:
        "Completed or cancelled maintenance cannot be rescheduled.",
    };
  }

  const originalDuration = maintenance.endDate
    ? maintenance.endDate.getTime() -
      maintenance.scheduledDate.getTime()
    : 0;

  const newEndDate = maintenance.endDate
    ? new Date(newDate.getTime() + originalDuration)
    : null;

  try {
    const updated =
      await prisma.maintenanceEvent.updateMany({
        where: {
          id: maintenance.id,
          status: {
            in: ["SCHEDULED", "IN_PROGRESS"],
          },
        },
        data: {
          scheduledDate: newDate,
          endDate: newEndDate,
          status: "SCHEDULED",
          blocksAvailability: false,
        },
      });

    if (updated.count === 0) {
      return {
        success: false,
        message:
          "The maintenance status changed before rescheduling. Refresh the page.",
      };
    }
  } catch (error) {
    console.error(
      "Maintenance rescheduling failed:",
      error,
    );

    return {
      success: false,
      message: "Maintenance could not be rescheduled.",
    };
  }

  const conflictEnd = newEndDate
    ? new Date(newEndDate.getTime() + 86_400_000)
    : new Date(newDate.getTime() + 86_400_000);

  const overlappingBooking =
    await prisma.booking.findFirst({
      where: {
        vehicleId: maintenance.vehicle.id,
        status: {
          not: "CANCELLED",
        },
        pickupDate: {
          lt: conflictEnd,
        },
        returnDate: {
          gt: newDate,
        },
      },
      select: {
        reference: true,
      },
    });

  refreshMaintenancePages();

  return {
    success: true,
    message: overlappingBooking
      ? `Maintenance rescheduled, but it overlaps booking ${overlappingBooking.reference}. The reservation remains active; move the maintenance when possible.`
      : `${maintenance.vehicle.brand} ${maintenance.vehicle.model} maintenance rescheduled successfully.`,
  };
}