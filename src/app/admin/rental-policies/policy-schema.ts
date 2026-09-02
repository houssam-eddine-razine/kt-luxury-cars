import { z } from "zod";

const optionalNumber = z.preprocess(
  (value) =>
    value === "" || value === null ? undefined : value,
  z.coerce.number().int().nonnegative().optional(),
);

const optionalText = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === ""
      ? undefined
      : value,
  z.string().trim().optional(),
);

const optionalBoolean = z.preprocess(
  (value) => {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    return undefined;
  },
  z.boolean().optional(),
);

export const rentalPolicySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Policy name is required.")
    .max(100),

  minimumDriverAge: optionalNumber,
  minimumLicenseYears: optionalNumber,

  dailyMileageLimit: optionalNumber,
  extraKilometrePrice: optionalNumber,

  fuelPolicy: z
    .enum([
      "FULL_TO_FULL",
      "SAME_TO_SAME",
      "PREPURCHASE",
    ])
    .optional(),

  insuranceIncluded: optionalBoolean,
  insuranceDetails: optionalText,
  insuranceExcess: optionalNumber,

  airportDeliveryFee: optionalNumber,

  cancellationPolicy: optionalText,
  acceptedPayments: optionalText,
  requiredDocuments: optionalText,

  active: z.boolean(),
  isDefault: z.boolean(),
});

export type RentalPolicyFormData = z.infer<
  typeof rentalPolicySchema
>;