"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type CustomerActionResult = {
  success: boolean;
  message: string;
};

const customerStatuses = [
  "NORMAL",
  "TRUSTED",
  "WATCHLIST",
  "BLOCKED",
] as const;

type CustomerStatus =
  (typeof customerStatuses)[number];

async function isAuthenticatedAdministrator() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  return !error && Boolean(data?.claims);
}

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

function isCustomerStatus(
  value: string,
): value is CustomerStatus {
  return customerStatuses.some(
    (status) => status === value,
  );
}

export async function updateCustomerProfile(
  formData: FormData,
): Promise<void> {
  if (!(await isAuthenticatedAdministrator())) {
    throw new Error(
      "Your session has expired. Please sign in again.",
    );
  }

  const phone = String(formData.get("phone") ?? "").trim();
  const displayName = String(
    formData.get("displayName") ?? "",
  ).trim();
  const emailValue = String(
    formData.get("email") ?? "",
  ).trim();
  const notesValue = String(
    formData.get("notes") ?? "",
  ).trim();
  const statusValue = String(
    formData.get("status") ?? "",
  );

  const phoneKey = normalizePhone(phone);

  if (phoneKey.length < 8) {
    throw new Error("The customer phone number is invalid.");
  }

  if (displayName.length < 2) {
    throw new Error("The customer name is required.");
  }

  if (!isCustomerStatus(statusValue)) {
    throw new Error("The customer status is invalid.");
  }

  try {
    await prisma.customerProfile.upsert({
      where: {
        phoneKey,
      },
      create: {
        phoneKey,
        displayName,
        phone,
        email: emailValue || null,
        status: statusValue,
        notes: notesValue || null,
      },
      update: {
        displayName,
        phone,
        email: emailValue || null,
        status: statusValue,
        notes: notesValue || null,
      },
    });
  } catch (error) {
    console.error("Customer profile update failed:", error);

    throw new Error(
      "The customer profile could not be saved.",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/customers");
  revalidatePath("/admin/reservations");
}