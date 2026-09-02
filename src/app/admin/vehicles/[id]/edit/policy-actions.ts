"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type VehiclePolicyActionState = {
  success?: boolean;
  message?: string;
};

async function requireAuthenticatedAdministrator() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/admin/login");
  }
}

export async function assignVehiclePolicy(
  vehicleId: string,
  _previousState: VehiclePolicyActionState,
  formData: FormData,
): Promise<VehiclePolicyActionState> {
  await requireAuthenticatedAdministrator();

  const submittedPolicyId = String(
    formData.get("rentalPolicyId") ?? "",
  ).trim();

  const rentalPolicyId =
    submittedPolicyId === "" ? null : submittedPolicyId;

  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: vehicleId,
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!vehicle) {
    return {
      success: false,
      message: "The vehicle no longer exists.",
    };
  }

  if (rentalPolicyId) {
    const policy = await prisma.rentalPolicy.findFirst({
      where: {
        id: rentalPolicyId,
        active: true,
      },
      select: {
        id: true,
      },
    });

    if (!policy) {
      return {
        success: false,
        message:
          "The selected rental policy does not exist or is inactive.",
      };
    }
  }

  try {
    await prisma.vehicle.update({
      where: {
        id: vehicleId,
      },
      data: {
        rentalPolicyId,
      },
    });
  } catch (error) {
    console.error("Vehicle policy assignment failed:", error);

    return {
      success: false,
      message:
        "The rental policy could not be assigned. Please try again.",
    };
  }

  revalidatePath(`/admin/vehicles/${vehicleId}/edit`);
  revalidatePath(`/vehicles/${vehicle.slug}`);
  revalidatePath(`/en/vehicles/${vehicle.slug}`);
  revalidatePath(`/fr/vehicles/${vehicle.slug}`);

  return {
    success: true,
    message: rentalPolicyId
      ? "The vehicle-specific policy was assigned successfully."
      : "This vehicle now uses the default rental policy.",
  };
}