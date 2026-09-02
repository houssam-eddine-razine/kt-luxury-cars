"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { rentalPolicySchema } from "./policy-schema";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type RentalPolicyActionState = {
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

function refreshPolicyPages() {
  revalidatePath("/admin/rental-policies");
  revalidatePath("/admin/vehicles");
  revalidatePath("/vehicles", "layout");
  revalidatePath("/en/vehicles", "layout");
  revalidatePath("/fr/vehicles", "layout");
}

function getPolicyData(formData: FormData) {
  const fuelPolicyValue = String(
    formData.get("fuelPolicy") ?? "",
  );

  const insuranceIncludedValue = String(
    formData.get("insuranceIncluded") ?? "",
  );

  return rentalPolicySchema.safeParse({
    name: formData.get("name"),

    minimumDriverAge: formData.get("minimumDriverAge"),
    minimumLicenseYears: formData.get(
      "minimumLicenseYears",
    ),

    dailyMileageLimit: formData.get("dailyMileageLimit"),
    extraKilometrePrice: formData.get(
      "extraKilometrePrice",
    ),

    fuelPolicy:
      fuelPolicyValue === ""
        ? undefined
        : fuelPolicyValue,

    insuranceIncluded:
      insuranceIncludedValue === ""
        ? undefined
        : insuranceIncludedValue,

    insuranceDetails: formData.get("insuranceDetails"),
    insuranceExcess: formData.get("insuranceExcess"),

    airportDeliveryFee: formData.get(
      "airportDeliveryFee",
    ),

    cancellationPolicy: formData.get(
      "cancellationPolicy",
    ),

    acceptedPayments: formData.get("acceptedPayments"),
    requiredDocuments: formData.get(
      "requiredDocuments",
    ),

    active: formData.get("active") === "on",
    isDefault: formData.get("isDefault") === "on",
  });
}

export async function saveRentalPolicy(
  policyId: string | null,
  _previousState: RentalPolicyActionState,
  formData: FormData,
): Promise<RentalPolicyActionState> {
  await requireAuthenticatedAdministrator();

  const result = getPolicyData(formData);

  if (!result.success) {
    return {
      success: false,
      message: "Please correct the highlighted information.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const data = result.data;

  const duplicate = await prisma.rentalPolicy.findFirst({
    where: {
      name: {
        equals: data.name,
        mode: "insensitive",
      },

      ...(policyId
        ? {
            id: {
              not: policyId,
            },
          }
        : {}),
    },
    select: {
      id: true,
    },
  });

  if (duplicate) {
    return {
      success: false,
      message: "A rental policy with this name already exists.",
      errors: {
        name: ["Choose a different policy name."],
      },
    };
  }

  try {
    await prisma.$transaction(async (transaction) => {
      if (data.isDefault) {
        await transaction.rentalPolicy.updateMany({
          where: policyId
            ? {
                id: {
                  not: policyId,
                },
              }
            : undefined,
          data: {
            isDefault: false,
          },
        });
      }

      if (policyId) {
        const existingPolicy =
          await transaction.rentalPolicy.findUnique({
            where: {
              id: policyId,
            },
            select: {
              id: true,
            },
          });

        if (!existingPolicy) {
          throw new Error("POLICY_NOT_FOUND");
        }

        await transaction.rentalPolicy.update({
          where: {
            id: policyId,
          },
          data,
        });

        return;
      }

      await transaction.rentalPolicy.create({
        data,
      });
    });
  } catch (error) {
    console.error("Rental policy save failed:", error);

    if (
      error instanceof Error &&
      error.message === "POLICY_NOT_FOUND"
    ) {
      return {
        success: false,
        message: "This rental policy no longer exists.",
      };
    }

    return {
      success: false,
      message:
        "The rental policy could not be saved. Please try again.",
    };
  }

  refreshPolicyPages();

  return {
    success: true,
    message: policyId
      ? "Rental policy updated successfully."
      : "Rental policy created successfully.",
  };
}

export async function setDefaultRentalPolicy(
  policyId: string,
) {
  await requireAuthenticatedAdministrator();

  const policy = await prisma.rentalPolicy.findUnique({
    where: {
      id: policyId,
    },
    select: {
      id: true,
    },
  });

  if (!policy) {
    return;
  }

  await prisma.$transaction([
    prisma.rentalPolicy.updateMany({
      data: {
        isDefault: false,
      },
    }),

    prisma.rentalPolicy.update({
      where: {
        id: policyId,
      },
      data: {
        isDefault: true,
        active: true,
      },
    }),
  ]);

  refreshPolicyPages();
}

export async function toggleRentalPolicy(
  policyId: string,
  active: boolean,
) {
  await requireAuthenticatedAdministrator();

  const policy = await prisma.rentalPolicy.findUnique({
    where: {
      id: policyId,
    },
    select: {
      id: true,
    },
  });

  if (!policy) {
    return;
  }

  await prisma.rentalPolicy.update({
    where: {
      id: policyId,
    },
    data: {
      active,
      ...(!active
        ? {
            isDefault: false,
          }
        : {}),
    },
  });

  refreshPolicyPages();
}