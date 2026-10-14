"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const optionalNumber = z.preprocess(
  (value) =>
    value === "" || value === null ? undefined : value,
  z.coerce.number().int().nonnegative().optional(),
);

const bookingSchema = z.object({
  vehicleId: z.string().uuid(),
  customerName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(8).max(30),

  email: z
    .union([
      z.string().trim().email().max(150),
      z.literal(""),
    ])
    .optional(),

  pickupDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/),

  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/),

  pickupTime: z.string().trim().max(10).optional(),
  returnTime: z.string().trim().max(10).optional(),

  pickupLocation: z.string().trim().min(2).max(200),

  returnLocation: z
    .string()
    .trim()
    .max(200)
    .optional(),

  dailyRate: z.coerce.number().int().positive(),
  totalPrice: optionalNumber,
  depositRequired: optionalNumber,
  depositPaid: optionalNumber,
  amountPaid: optionalNumber,

  internalNotes: z
    .string()
    .trim()
    .max(3000)
    .optional(),
});

export type BookingActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

async function requireAuthenticatedAdministrator() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/admin/login");
  }
}

function normalizePhone(value: string) {
  const prefix = value.trim().startsWith("+")
    ? "+"
    : "";

  return `${prefix}${value.replace(/\D/g, "")}`;
}

function createBookingReference() {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  const randomPart = randomUUID()
    .replaceAll("-", "")
    .slice(0, 6)
    .toUpperCase();

  return `BKG-${date}-${randomPart}`;
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function calculateRentalDays(
  pickupDate: Date,
  returnDate: Date,
) {
  return Math.max(
    1,
    Math.round(
      (returnDate.getTime() - pickupDate.getTime()) /
        86_400_000,
    ),
  );
}

export async function createBooking(
  _previousState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  await requireAuthenticatedAdministrator();

  const result = bookingSchema.safeParse({
    vehicleId: formData.get("vehicleId"),
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    pickupDate: formData.get("pickupDate"),
    returnDate: formData.get("returnDate"),
    pickupTime: formData.get("pickupTime"),
    returnTime: formData.get("returnTime"),
    pickupLocation: formData.get("pickupLocation"),
    returnLocation: formData.get("returnLocation"),
    dailyRate: formData.get("dailyRate"),
    totalPrice: formData.get("totalPrice"),
    depositRequired: formData.get("depositRequired"),
    depositPaid: formData.get("depositPaid"),
    amountPaid: formData.get("amountPaid"),
    internalNotes: formData.get("internalNotes"),
  });

  if (!result.success) {
    return {
      success: false,
      message: "Please correct the booking information.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const data = result.data;
  const pickupDate = parseDate(data.pickupDate);
  const returnDate = parseDate(data.returnDate);

  if (returnDate <= pickupDate) {
    return {
      success: false,
      message:
        "The return date must be after the pick-up date.",
      errors: {
        returnDate: [
          "Choose a date after the pick-up date.",
        ],
      },
    };
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: data.vehicleId,
    },
    select: {
      id: true,
      brand: true,
      model: true,
    },
  });

  if (!vehicle) {
    return {
      success: false,
      message: "The selected vehicle no longer exists.",
    };
  }

  /*
   * Two bookings overlap when an existing booking starts before
   * the new return date and ends after the new pick-up date.
   */
  const conflictingBooking =
    await prisma.booking.findFirst({
      where: {
        vehicleId: vehicle.id,
        status: {
          not: "CANCELLED",
        },
        pickupDate: {
          lt: returnDate,
        },
        returnDate: {
          gt: pickupDate,
        },
      },
      select: {
        reference: true,
        customerName: true,
        pickupDate: true,
        returnDate: true,
      },
    });

  if (conflictingBooking) {
    return {
      success: false,
      message:
        `This vehicle is already booked during the selected dates ` +
        `(${conflictingBooking.reference}, ${conflictingBooking.customerName}).`,
    };
  }

  const numberOfDays = calculateRentalDays(
    pickupDate,
    returnDate,
  );

  const totalPrice =
    data.totalPrice ??
    data.dailyRate * numberOfDays;

  const amountPaid = data.amountPaid ?? 0;

  const paymentStatus =
    amountPaid >= totalPrice
      ? "PAID"
      : amountPaid > 0
        ? "PARTIAL"
        : "UNPAID";

  try {
    const booking = await prisma.booking.create({
      data: {
        reference: createBookingReference(),
        status: "CONFIRMED",

        customerName: data.customerName,
        phone: normalizePhone(data.phone),
        email:
          data.email && data.email.length > 0
            ? data.email.toLowerCase()
            : null,

        pickupDate,
        returnDate,

        pickupTime:
          data.pickupTime || null,

        returnTime:
          data.returnTime || null,

        pickupLocation: data.pickupLocation,

        returnLocation:
          data.returnLocation || null,

        dailyRate: data.dailyRate,
        totalPrice,

        depositRequired:
          data.depositRequired ?? null,

        depositPaid:
          data.depositPaid ?? 0,

        amountPaid,
        paymentStatus,

        internalNotes:
          data.internalNotes || null,

        vehicleId: vehicle.id,
      },
      select: {
        reference: true,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/planning");

    return {
      success: true,
      message:
        `Booking ${booking.reference} created successfully.`,
    };
  } catch (error) {
    console.error("Booking creation failed:", error);

    return {
      success: false,
      message:
        "The booking could not be created. Please try again.",
    };
  }
}