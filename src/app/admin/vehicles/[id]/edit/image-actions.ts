"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "vehicle-images";
const MAX_IMAGES = 12;

export type ImageActionResult = {
  success: boolean;
  message?: string;
};

type UploadedImage = {
  url: string;
  storagePath: string;
};

async function isAuthenticatedAdministrator() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  return !error && Boolean(data?.claims);
}

function refreshVehiclePages(vehicleId: string) {
  revalidatePath("/admin/vehicles");
  revalidatePath(`/admin/vehicles/${vehicleId}/edit`);
}

export async function registerVehicleImages(
  vehicleId: string,
  images: UploadedImage[],
): Promise<ImageActionResult> {
  if (!(await isAuthenticatedAdministrator())) {
    return {
      success: false,
      message: "Your session has expired. Please sign in again.",
    };
  }

  if (!images.length) {
    return {
      success: false,
      message: "No images were provided.",
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicUrlPrefix =
    `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/`;

  const invalidImage = images.some(
    (image) =>
      !image.storagePath.startsWith(`${vehicleId}/`) ||
      !image.url.startsWith(publicUrlPrefix),
  );

  if (invalidImage) {
    return {
      success: false,
      message: "One or more image paths are invalid.",
    };
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: vehicleId,
    },
    select: {
      brand: true,
      model: true,
      _count: {
        select: {
          images: true,
        },
      },
      images: {
        orderBy: {
          position: "desc",
        },
        take: 1,
        select: {
          position: true,
        },
      },
    },
  });

  if (!vehicle) {
    return {
      success: false,
      message: "Vehicle not found.",
    };
  }

  if (vehicle._count.images + images.length > MAX_IMAGES) {
    return {
      success: false,
      message: `A vehicle can have a maximum of ${MAX_IMAGES} images.`,
    };
  }

  const startingPosition =
    (vehicle.images[0]?.position ?? -1) + 1;

  try {
    await prisma.vehicleImage.createMany({
      data: images.map((image, index) => ({
        vehicleId,
        url: image.url,
        storagePath: image.storagePath,
        altText: `${vehicle.brand} ${vehicle.model}`,
        position: startingPosition + index,
        isCover:
          vehicle._count.images === 0 && index === 0,
      })),
    });
  } catch (error) {
    console.error("Image registration failed:", error);

    return {
      success: false,
      message: "The uploaded images could not be saved.",
    };
  }

  refreshVehiclePages(vehicleId);

  return {
    success: true,
  };
}

export async function setVehicleCoverImage(
  vehicleId: string,
  imageId: string,
): Promise<ImageActionResult> {
  if (!(await isAuthenticatedAdministrator())) {
    return {
      success: false,
      message: "Your session has expired. Please sign in again.",
    };
  }

  const image = await prisma.vehicleImage.findFirst({
    where: {
      id: imageId,
      vehicleId,
    },
    select: {
      id: true,
    },
  });

  if (!image) {
    return {
      success: false,
      message: "Image not found.",
    };
  }

  try {
    await prisma.$transaction([
      prisma.vehicleImage.updateMany({
        where: {
          vehicleId,
        },
        data: {
          isCover: false,
        },
      }),
      prisma.vehicleImage.update({
        where: {
          id: imageId,
        },
        data: {
          isCover: true,
        },
      }),
    ]);
  } catch (error) {
    console.error("Cover image update failed:", error);

    return {
      success: false,
      message: "The cover image could not be changed.",
    };
  }

  refreshVehiclePages(vehicleId);

  return {
    success: true,
  };
}

export async function moveVehicleImage(
  vehicleId: string,
  imageId: string,
  direction: "left" | "right",
): Promise<ImageActionResult> {
  if (!(await isAuthenticatedAdministrator())) {
    return {
      success: false,
      message: "Your session has expired. Please sign in again.",
    };
  }

  const images = await prisma.vehicleImage.findMany({
    where: {
      vehicleId,
    },
    orderBy: {
      position: "asc",
    },
    select: {
      id: true,
      position: true,
    },
  });

  const currentIndex = images.findIndex(
    (image) => image.id === imageId,
  );

  if (currentIndex === -1) {
    return {
      success: false,
      message: "Image not found.",
    };
  }

  const targetIndex =
    direction === "left"
      ? currentIndex - 1
      : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= images.length) {
    return {
      success: true,
    };
  }

  const currentImage = images[currentIndex];
  const targetImage = images[targetIndex];

  try {
    await prisma.$transaction([
      prisma.vehicleImage.update({
        where: {
          id: currentImage.id,
        },
        data: {
          position: targetImage.position,
        },
      }),
      prisma.vehicleImage.update({
        where: {
          id: targetImage.id,
        },
        data: {
          position: currentImage.position,
        },
      }),
    ]);
  } catch (error) {
    console.error("Image ordering failed:", error);

    return {
      success: false,
      message: "The image order could not be changed.",
    };
  }

  refreshVehiclePages(vehicleId);

  return {
    success: true,
  };
}

export async function deleteVehicleImage(
  vehicleId: string,
  imageId: string,
): Promise<ImageActionResult> {
  if (!(await isAuthenticatedAdministrator())) {
    return {
      success: false,
      message: "Your session has expired. Please sign in again.",
    };
  }

  const image = await prisma.vehicleImage.findFirst({
    where: {
      id: imageId,
      vehicleId,
    },
  });

  if (!image) {
    return {
      success: false,
      message: "Image not found.",
    };
  }

  if (image.storagePath) {
    const supabase = await createClient();

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([image.storagePath]);

    if (error) {
      console.error("Storage image deletion failed:", error);

      return {
        success: false,
        message: "The image could not be removed from storage.",
      };
    }
  }

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.vehicleImage.delete({
        where: {
          id: image.id,
        },
      });

      if (image.isCover) {
        const nextImage =
          await transaction.vehicleImage.findFirst({
            where: {
              vehicleId,
            },
            orderBy: {
              position: "asc",
            },
            select: {
              id: true,
            },
          });

        if (nextImage) {
          await transaction.vehicleImage.update({
            where: {
              id: nextImage.id,
            },
            data: {
              isCover: true,
            },
          });
        }
      }
    });
  } catch (error) {
    console.error("Database image deletion failed:", error);

    return {
      success: false,
      message: "The image record could not be deleted.",
    };
  }

  refreshVehiclePages(vehicleId);

  return {
    success: true,
  };
}