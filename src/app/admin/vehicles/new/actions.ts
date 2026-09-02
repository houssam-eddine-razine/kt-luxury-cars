"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { vehicleSchema } from "./vehicle-schema";

const VEHICLE_IMAGES_BUCKET = "vehicle-images";

export type VehicleActionState = {
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

async function requireAuthenticatedAdministrator() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/admin/login");
  }

  return supabase;
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getVehicleData(formData: FormData) {
  const registration = String(
    formData.get("registration") ?? "",
  )
    .trim()
    .toUpperCase();

  return vehicleSchema.safeParse({
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
}

function extractStoragePathFromUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const marker =
      `/storage/v1/object/public/${VEHICLE_IMAGES_BUCKET}/`;

    const markerIndex = parsedUrl.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const encodedPath = parsedUrl.pathname.slice(
      markerIndex + marker.length,
    );

    return decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
}

export async function createVehicle(
  _previousState: VehicleActionState,
  formData: FormData,
): Promise<VehicleActionState> {
  await requireAuthenticatedAdministrator();

  const result = getVehicleData(formData);

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
        {
          registration: data.registration,
        },
        {
          slug,
        },
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
        registration: [
          "This registration is already registered.",
        ],
      },
    };
  }

  let vehicleId: string;

  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        ...data,
        slug,
      },
      select: {
        id: true,
      },
    });

    vehicleId = vehicle.id;
  } catch (error) {
    console.error("Vehicle creation failed:", error);

    return {
      message:
        "The vehicle could not be created. Please try again.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/vehicles");

  redirect(
    `/admin/vehicles/${vehicleId}/edit?created=true`,
  );
}

export async function updateVehicle(
  vehicleId: string,
  _previousState: VehicleActionState,
  formData: FormData,
): Promise<VehicleActionState> {
  await requireAuthenticatedAdministrator();

  const result = getVehicleData(formData);

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

  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: vehicleId,
    },
    select: {
      id: true,
    },
  });

  if (!vehicle) {
    return {
      message: "The vehicle no longer exists.",
    };
  }

  const duplicate = await prisma.vehicle.findFirst({
    where: {
      id: {
        not: vehicleId,
      },
      OR: [
        {
          registration: data.registration,
        },
        {
          slug,
        },
      ],
    },
    select: {
      id: true,
    },
  });

  if (duplicate) {
    return {
      message: "Another vehicle uses this registration.",
      errors: {
        registration: [
          "This registration is already registered.",
        ],
      },
    };
  }

  try {
    await prisma.vehicle.update({
      where: {
        id: vehicleId,
      },
      data: {
        ...data,
        slug,
      },
    });
  } catch (error) {
    console.error("Vehicle update failed:", error);

    return {
      message:
        "The changes could not be saved. Please try again.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/vehicles");
  revalidatePath(`/admin/vehicles/${vehicleId}/edit`);

  redirect("/admin/vehicles");
}

export async function deleteVehicle(vehicleId: string) {
  const supabase =
    await requireAuthenticatedAdministrator();

  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: vehicleId,
    },
    select: {
      id: true,
      images: {
        select: {
          url: true,
          storagePath: true,
        },
      },
    },
  });

  if (!vehicle) {
    revalidatePath("/admin/vehicles");
    redirect("/admin/vehicles");
  }

  const storagePaths = Array.from(
    new Set(
      vehicle.images
        .map(
          (image) =>
            image.storagePath ??
            extractStoragePathFromUrl(image.url),
        )
        .filter(
          (path): path is string =>
            typeof path === "string" && path.length > 0,
        ),
    ),
  );

  if (
    vehicle.images.length > 0 &&
    storagePaths.length !== vehicle.images.length
  ) {
    console.error(
      "Vehicle deletion stopped because one or more image paths could not be resolved.",
    );

    return;
  }

  if (storagePaths.length > 0) {
    const { data, error } = await supabase.storage
      .from(VEHICLE_IMAGES_BUCKET)
      .remove(storagePaths);

    if (error) {
      console.error(
        "Vehicle image cleanup failed:",
        error,
      );

      return;
    }

    if (!data || data.length !== storagePaths.length) {
      console.error(
        "Vehicle deletion stopped because not all storage images were removed.",
        {
          expected: storagePaths.length,
          removed: data?.length ?? 0,
        },
      );

      return;
    }
  }

  try {
    await prisma.vehicle.delete({
      where: {
        id: vehicleId,
      },
    });
  } catch (error) {
    console.error("Vehicle deletion failed:", error);
    return;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/vehicles");

  redirect("/admin/vehicles");
}