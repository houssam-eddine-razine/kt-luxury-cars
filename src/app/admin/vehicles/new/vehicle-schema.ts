import { z } from "zod";

const optionalNumber = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.number().int().nonnegative().optional(),
);

const optionalText = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === ""
      ? undefined
      : value,
  z.string().trim().optional(),
);

export const vehicleSchema = z.object({
  brand: z.string().trim().min(2, "Brand is required."),
  model: z.string().trim().min(1, "Model is required."),
  trim: optionalText,

  year: z.coerce
    .number()
    .int()
    .min(2000, "Enter a valid year.")
    .max(new Date().getFullYear() + 1),

  registration: z
    .string()
    .trim()
    .min(2, "Registration is required.")
    .max(30),

  category: z.enum([
    "ECONOMY",
    "COMPACT",
    "SUV",
    "PREMIUM",
    "LUXURY",
  ]),

  status: z.enum([
    "AVAILABLE",
    "RESERVED",
    "RENTED",
    "MAINTENANCE",
    "INACTIVE",
  ]),

  transmission: z.enum(["AUTOMATIC", "MANUAL"]),

  fuelType: z.enum([
    "GASOLINE",
    "DIESEL",
    "HYBRID",
    "ELECTRIC",
  ]),

  seats: z.coerce.number().int().min(1).max(20),
  doors: z.coerce.number().int().min(2).max(10),
  luggage: z.coerce.number().int().min(0).max(20),
  mileage: z.coerce.number().int().nonnegative(),

  dailyPrice: z.coerce.number().int().positive(),
  weeklyPrice: optionalNumber,
  monthlyPrice: optionalNumber,
  deposit: optionalNumber,

  descriptionFr: optionalText,
  descriptionEn: optionalText,
  descriptionAr: optionalText,

  visible: z.boolean(),
  featured: z.boolean(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;