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
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
  ]),

  internalNotes: z
    .string()
    .trim()
    .max(3000)
    .optional(),
});

async function requireAuthenticatedAdministrator() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/admin/login");
  }
}

export async function updateReservationRequest(
  requestId: string,
  formData: FormData,
) {
  await requireAuthenticatedAdministrator();

  const result = reservationUpdateSchema.safeParse({
    status: formData.get("status"),
    internalNotes:
      formData.get("internalNotes") ?? "",
  });

  if (!result.success) {
    return;
  }

  const request =
    await prisma.reservationRequest.findUnique({
      where: {
        id: requestId,
      },
      select: {
        id: true,
      },
    });

  if (!request) {
    return;
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

    return;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/reservations");
}