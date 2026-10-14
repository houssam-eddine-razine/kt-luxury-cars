"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type MaintenanceActionState = {
  success: boolean;
  message?: string;
};

const maintenanceSchema = z.object({
  vehicleId: z.string().uuid(),
  type: z.enum([
    "OIL_CHANGE",
    "BRAKE_PADS",
    "ADBLUE",
    "TIRES",
    "TECHNICAL_INSPECTION",
    "INSURANCE",
    "REPAIR",
    "CLEANING",
    "OTHER",
  ]),
  status: z.enum([
    "SCHEDULED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ]),
  scheduledDate: z.string().date(),
  endDate: z.string().optional(),
  completedDate: z.string().optional(),
  nextDueDate: z.string().optional(),
  mileageAtService: z.number().int().nonnegative().optional(),
  nextServiceMileage: z.number().int().nonnegative().optional(),
  cost: z.number().int().nonnegative().optional(),
  garage: z.string().trim().max(150).optional(),
  notes: z.string().trim().max(2000).optional(),
});

function optionalText(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  return value.trim();
}

function optionalNumber(formData: FormData, name: string) {
  const value = optionalText(formData, name);

  if (value === undefined) {
    return undefined;
  }

  return Number(value);
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

async function isAuthenticatedAdministrator() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  return !error && Boolean(data?.claims);
}

export async function createMaintenanceEvent(
  _previousState: MaintenanceActionState,
  formData: FormData,
): Promise<MaintenanceActionState> {
  if (!(await isAuthenticatedAdministrator())) {
    return {
      success: false,
      message: "Your session has expired. Please sign in again.",
    };
  }

  const result = maintenanceSchema.safeParse({
    vehicleId: formData.get("vehicleId"),
    type: formData.get("type"),
    status: formData.get("status"),
    scheduledDate: formData.get("scheduledDate"),
    endDate: optionalText(formData, "endDate"),
    completedDate: optionalText(formData, "completedDate"),
    nextDueDate: optionalText(formData, "nextDueDate"),
    mileageAtService: optionalNumber(
      formData,
      "mileageAtService",
    ),
    nextServiceMileage: optionalNumber(
      formData,
      "nextServiceMileage",
    ),
    cost: optionalNumber(formData, "cost"),
    garage: optionalText(formData, "garage"),
    notes: optionalText(formData, "notes"),
  });

  if (!result.success) {
    return {
      success: false,
      message:
        result.error.issues[0]?.message ??
        "Please check the maintenance information.",
    };
  }

  const values = result.data;

  const scheduledDate = parseDate(values.scheduledDate);
  const endDate = values.endDate
    ? parseDate(values.endDate)
    : null;
  const completedDate = values.completedDate
    ? parseDate(values.completedDate)
    : values.status === "COMPLETED"
      ? scheduledDate
      : null;
  const nextDueDate = values.nextDueDate
    ? parseDate(values.nextDueDate)
    : null;

  if (endDate && endDate < scheduledDate) {
    return {
      success: false,
      message:
        "The end date cannot be before the scheduled date.",
    };
  }

  if (
    values.nextServiceMileage !== undefined &&
    values.mileageAtService !== undefined &&
    values.nextServiceMileage <= values.mileageAtService
  ) {
    return {
      success: false,
      message:
        "The next service mileage must be greater than the current mileage.",
    };
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: values.vehicleId,
    },
    select: {
      id: true,
      brand: true,
      model: true,
      mileage: true,
    },
  });

  if (!vehicle) {
    return {
      success: false,
      message: "Vehicle not found.",
    };
  }

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.maintenanceEvent.create({
        data: {
          vehicleId: values.vehicleId,
          type: values.type,
          status: values.status,
          scheduledDate,
          endDate,
          completedDate,
          nextDueDate,
          mileageAtService: values.mileageAtService,
          nextServiceMileage:
            values.nextServiceMileage,
          cost: values.cost,
          garage: values.garage,
          notes: values.notes,
          blocksAvailability: false,
        },
      });

      if (
        values.mileageAtService !== undefined &&
        values.mileageAtService > vehicle.mileage
      ) {
        await transaction.vehicle.update({
          where: {
            id: vehicle.id,
          },
          data: {
            mileage: values.mileageAtService,
          },
        });
      }
    });
  } catch (error) {
    console.error("Maintenance creation failed:", error);

    return {
      success: false,
      message:
        "The maintenance event could not be saved.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/planning");
  revalidatePath("/admin/maintenance");
  revalidatePath(`/admin/vehicles/${vehicle.id}/edit`);

  return {
    success: true,
    message: `Maintenance saved for ${vehicle.brand} ${vehicle.model}. Reservations remain available.`,
  };
}