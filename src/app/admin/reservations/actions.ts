"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const reservationUpdateSchema = z.object({
  status: z.enum([
    "NEW",
    "CONTACTED",
    "DECLINED",
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
  ]),

  internalNotes: z
    .string()
    .trim()
    .max(3000, "Internal notes are too long.")
    .optional(),
});

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

async function requireAuthenticatedAdministrator() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/admin/login");
  }
}

function reservationRedirect(
  result:
    | "saved"
    | "blocked"
    | "invalid"
    | "missing"
    | "failed",
): never {
  redirect(`/admin/reservations?result=${result}`);
}

export async function updateReservationRequest(
  requestId: string,
  formData: FormData,
): Promise<void> {
  await requireAuthenticatedAdministrator();

  const result = reservationUpdateSchema.safeParse({
    status: formData.get("status"),
    internalNotes: formData.get("internalNotes") ?? "",
  });

  if (!result.success) {
    reservationRedirect("invalid");
  }

  const request =
    await prisma.reservationRequest.findUnique({
      where: {
        id: requestId,
      },
      select: {
        id: true,
        phone: true,
      },
    });

  if (!request) {
    reservationRedirect("missing");
  }

  const phoneKey = normalizePhone(request.phone);

  if (result.data.status === "CONFIRMED") {
    const customerProfile =
      await prisma.customerProfile.findUnique({
        where: {
          phoneKey,
        },
        select: {
          status: true,
        },
      });

    if (customerProfile?.status === "BLOCKED") {
      reservationRedirect("blocked");
    }
  }

  try {
    await prisma.reservationRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: result.data.status,
        internalNotes:
          result.data.internalNotes &&
          result.data.internalNotes.length > 0
            ? result.data.internalNotes
            : null,
      },
    });
  } catch (error) {
    console.error(
      "Reservation request update failed:",
      error,
    );

    reservationRedirect("failed");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/reservations");
  revalidatePath("/admin/customers");

  reservationRedirect("saved");
}