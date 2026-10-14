"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type MaintenanceManagementResult = {
  success: boolean;
  message: string;
};

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

function refreshMaintenancePages() {
  revalidatePath("/admin");
  revalidatePath("/admin/planning");
  revalidatePath("/admin/maintenance");
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
      message: "Cancelled maintenance cannot be completed.",
    };
  }

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.maintenanceEvent.update({
        where: {
          id: maintenance.id,
        },
        data: {
          status: "COMPLETED",
          completedDate: utcToday(),
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
    });
  } catch (error) {
    console.error("Maintenance completion failed:", error);

    return {
      success: false,
      message: "Maintenance could not be completed.",
    };
  }

  refreshMaintenancePages();

  return {
    success: true,
    message: `${maintenance.vehicle.brand} ${maintenance.vehicle.model} maintenance marked as completed.`,
  };
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
      message: "Completed maintenance cannot be cancelled.",
    };
  }

  try {
    await prisma.maintenanceEvent.update({
      where: {
        id: maintenance.id,
      },
      data: {
        status: "CANCELLED",
      },
    });
  } catch (error) {
    console.error("Maintenance cancellation failed:", error);

    return {
      success: false,
      message: "Maintenance could not be cancelled.",
    };
  }

  refreshMaintenancePages();

  return {
    success: true,
    message: `${maintenance.vehicle.brand} ${maintenance.vehicle.model} maintenance cancelled.`,
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
    await prisma.maintenanceEvent.update({
      where: {
        id: maintenance.id,
      },
      data: {
        scheduledDate: newDate,
        endDate: newEndDate,
        status: "SCHEDULED",
        blocksAvailability: false,
      },
    });
  } catch (error) {
    console.error("Maintenance rescheduling failed:", error);

    return {
      success: false,
      message: "Maintenance could not be rescheduled.",
    };
  }

  const conflictEnd = newEndDate
    ? new Date(newEndDate.getTime() + 86_400_000)
    : new Date(newDate.getTime() + 86_400_000);

  const overlappingBooking = await prisma.booking.findFirst({
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
      ? `Maintenance rescheduled, but it overlaps booking ${overlappingBooking.reference}. Move it again when possible.`
      : `${maintenance.vehicle.brand} ${maintenance.vehicle.model} maintenance rescheduled successfully.`,
  };
}