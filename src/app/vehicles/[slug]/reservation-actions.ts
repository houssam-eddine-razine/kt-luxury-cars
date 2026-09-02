"use server";

import { randomUUID } from "crypto";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const reservationSchema = z.object({
  vehicleId: z.string().uuid(),

  customerName: z
    .string()
    .trim()
    .min(2)
    .max(100),

  phone: z
    .string()
    .trim()
    .min(8)
    .max(30),

  email: z
    .union([
      z.string().trim().email().max(150),
      z.literal(""),
    ])
    .optional(),

  locale: z.enum(["en", "fr"]),

  pickupDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/),

  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/),

  deliveryLocation: z.enum([
    "airport",
    "cityCentre",
    "trainStation",
    "hotelRiad",
    "privateVilla",
  ]),

  website: z.string().max(200).optional(),
});

export type ReservationRequestInput = z.infer<
  typeof reservationSchema
>;

export type ReservationRequestResult =
  | {
      success: true;
      reference: string;
    }
  | {
      success: false;
      error:
        | "INVALID_INFORMATION"
        | "INVALID_DATES"
        | "VEHICLE_NOT_FOUND"
        | "SAVE_FAILED";
    };

function normalizePhone(value: string) {
  const trimmed = value.trim();

  const prefix = trimmed.startsWith("+") ? "+" : "";

  const digits = trimmed.replace(/\D/g, "");

  return `${prefix}${digits}`;
}

function createReference() {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  const randomPart = randomUUID()
    .replaceAll("-", "")
    .slice(0, 6)
    .toUpperCase();

  return `KT-${date}-${randomPart}`;
}

export async function createReservationRequest(
  input: ReservationRequestInput,
): Promise<ReservationRequestResult> {
  const result = reservationSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: "INVALID_INFORMATION",
    };
  }

  const data = result.data;

  /*
   * Hidden anti-spam field. Real customers leave it empty.
   */
  if (data.website) {
    return {
      success: true,
      reference: createReference(),
    };
  }

  const normalizedPhone = normalizePhone(data.phone);

  if (
    normalizedPhone.replace(/\D/g, "").length < 8 ||
    normalizedPhone.replace(/\D/g, "").length > 18
  ) {
    return {
      success: false,
      error: "INVALID_INFORMATION",
    };
  }

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  if (
    data.pickupDate < today ||
    data.returnDate <= data.pickupDate
  ) {
    return {
      success: false,
      error: "INVALID_DATES",
    };
  }

  const pickupDate = new Date(
    `${data.pickupDate}T00:00:00.000Z`,
  );

  const returnDate = new Date(
    `${data.returnDate}T00:00:00.000Z`,
  );

  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: data.vehicleId,
      visible: true,
      status: {
        not: "INACTIVE",
      },
    },
    select: {
      id: true,
      dailyPrice: true,
    },
  });

  if (!vehicle) {
    return {
      success: false,
      error: "VEHICLE_NOT_FOUND",
    };
  }

  /*
   * Prevent repeated clicks from creating duplicate requests.
   */
  const duplicateTimeLimit = new Date(
    Date.now() - 10 * 60 * 1000,
  );

  const existingRequest =
    await prisma.reservationRequest.findFirst({
      where: {
        vehicleId: vehicle.id,
        phone: normalizedPhone,
        pickupDate,
        returnDate,
        status: {
          not: "CANCELLED",
        },
        createdAt: {
          gte: duplicateTimeLimit,
        },
      },
      select: {
        reference: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  if (existingRequest) {
    return {
      success: true,
      reference: existingRequest.reference,
    };
  }

  const reference = createReference();

  try {
    await prisma.reservationRequest.create({
      data: {
        reference,
        customerName: data.customerName.trim(),
        phone: normalizedPhone,
        email:
          data.email && data.email.trim() !== ""
            ? data.email.trim().toLowerCase()
            : null,
        locale: data.locale,
        pickupDate,
        returnDate,
        deliveryLocation: data.deliveryLocation,
        advertisedDailyRate: vehicle.dailyPrice,
        vehicleId: vehicle.id,
      },
    });
  } catch (error) {
    console.error(
      "Reservation request creation failed:",
      error,
    );

    return {
      success: false,
      error: "SAVE_FAILED",
    };
  }

  return {
    success: true,
    reference,
  };
}