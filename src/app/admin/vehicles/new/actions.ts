"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { vehicleSchema } from "./vehicle-schema";

export type VehicleActionState = {
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createVehicle(
  _previousState: VehicleActionState,
  formData: FormData,
): Promise<VehicleActionState> {
  const registration = String(formData.get("registration") ?? "")
    .trim()
    .toUpperCase();

  const result = vehicleSchema.safeParse({
    brand: formData.get("brand"),
    model: formData.get("model"),
    trim: formData.get("trim"),
    year: formData.get("year"),
    registration,
    category: formData.get("category"),
    status: formData.get("status"),
    transmission: formData.get("transmission"),
    fuelType: formData.get("fuelType"),
    seats: formData.get("seats"),
    doors: formData.get("doors"),
    luggage: formData.get("luggage"),
    mileage: formData.get("mileage"),
    dailyPrice: formData.get("dailyPrice"),
    weeklyPrice: formData.get("weeklyPrice"),
    monthlyPrice: formData.get("monthlyPrice"),
    deposit: formData.get("deposit"),
    descriptionFr: formData.get("descriptionFr"),
    descriptionEn: formData.get("descriptionEn"),
    descriptionAr: formData.get("descriptionAr"),
    visible: formData.get("visible") === "on",
    featured: formData.get("featured") === "on",
  });

  if (!result.success) {
    return {
      message: "Please correct the highlighted information.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const data = result.data;
  const slug = createSlug(
    `${data.brand}-${data.model}-${data.registration}`,
  );

  const existingVehicle = await prisma.vehicle.findFirst({
    where: {
      OR: [
        { registration: data.registration },
        { slug },
      ],
    },
    select: {
      id: true,
    },
  });

  if (existingVehicle) {
    return {
      message: "A vehicle with this registration already exists.",
      errors: {
        registration: ["This registration is already registered."],
      },
    };
  }

  try {
    await prisma.vehicle.create({
      data: {
        ...data,
        slug,
      },
    });
  } catch (error) {
    console.error("Vehicle creation failed:", error);

    return {
      message: "The vehicle could not be created. Please try again.",
    };
  }

  revalidatePath("/admin/vehicles");
  redirect("/admin/vehicles");
}