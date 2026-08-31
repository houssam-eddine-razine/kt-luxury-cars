"use client";

import {
  type ChangeEvent,
  type DragEvent,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Crown,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  deleteVehicleImage,
  moveVehicleImage,
  registerVehicleImages,
  setVehicleCoverImage,
} from "./image-actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const BUCKET_NAME = "vehicle-images";
const MAX_IMAGES = 12;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const acceptedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const extensionByType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export type VehicleImageItem = {
  id: string;
  url: string;
  storagePath: string | null;
  altText: string | null;
  position: number;
  isCover: boolean;
};

type SelectedImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type ImageManagerProps = {
  vehicleId: string;
  vehicleName: string;
  images: VehicleImageItem[];
};

export function ImageManager({
  vehicleId,
  vehicleName,
  images,
}: ImageManagerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedImages, setSelectedImages] = useState<
    SelectedImage[]
  >([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string>();
  const [successMessage, setSuccessMessage] =
    useState<string>();
  const [pending, startTransition] = useTransition();

  const remainingSlots =
    MAX_IMAGES - images.length - selectedImages.length;

  function showError(value: string) {
    setSuccessMessage(undefined);
    setMessage(value);
  }

  function addFiles(files: File[]) {
    setMessage(undefined);
    setSuccessMessage(undefined);

    const validFiles: File[] = [];

    for (const file of files) {
      if (!acceptedTypes.includes(file.type)) {
        showError(
          `${file.name} is not a supported image format.`,
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        showError(`${file.name} is larger than 5 MB.`);
        continue;
      }

      validFiles.push(file);
    }

    const available =
      MAX_IMAGES - images.length - selectedImages.length;

    if (available <= 0) {
      showError(
        `A vehicle can have a maximum of ${MAX_IMAGES} images.`,
      );
      return;
    }

    if (validFiles.length > available) {
      showError(
        `Only ${available} more image${
          available === 1 ? "" : "s"
        } can be added.`,
      );
    }

    const acceptedFiles = validFiles.slice(0, available);

    setSelectedImages((current) => [
      ...current,
      ...acceptedFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  }

  function removeSelectedImage(imageId: string) {
    setSelectedImages((current) => {
      const image = current.find((item) => item.id === imageId);

      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }

      return current.filter((item) => item.id !== imageId);
    });
  }

  async function uploadImages() {
    if (!selectedImages.length || uploading) {
      return;
    }

    setUploading(true);
    setMessage(undefined);
    setSuccessMessage(undefined);

    const supabase = createClient();
    const uploadedImages: {
      storagePath: string;
      url: string;
    }[] = [];

    try {
      for (const selectedImage of selectedImages) {
        const extension =
          extensionByType[selectedImage.file.type];

        const storagePath =
          `${vehicleId}/${crypto.randomUUID()}.${extension}`;

        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, selectedImage.file, {
            cacheControl: "3600",
            contentType: selectedImage.file.type,
            upsert: false,
          });

        if (error) {
          throw new Error(error.message);
        }

        const { data } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(storagePath);

        uploadedImages.push({
          storagePath,
          url: data.publicUrl,
        });
      }

      const result = await registerVehicleImages(
        vehicleId,
        uploadedImages,
      );

      if (!result.success) {
        await supabase.storage
          .from(BUCKET_NAME)
          .remove(
            uploadedImages.map(
              (image) => image.storagePath,
            ),
          );

        throw new Error(
          result.message ?? "Images could not be saved.",
        );
      }

      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });

      setSelectedImages([]);
      setSuccessMessage(
        `${uploadedImages.length} image${
          uploadedImages.length === 1 ? "" : "s"
        } uploaded successfully.`,
      );

      router.refresh();
    } catch (error) {
      console.error("Vehicle image upload failed:", error);

      showError(
        error instanceof Error
          ? error.message
          : "The images could not be uploaded.",
      );
    } finally {
      setUploading(false);
    }
  }

  function runImageAction(
    action: () => Promise<{
      success: boolean;
      message?: string;
    }>,
  ) {
    setMessage(undefined);
    setSuccessMessage(undefined);

    startTransition(async () => {
      const result = await action();

      if (!result.success) {
        showError(
          result.message ?? "The action could not be completed.",
        );
        return;
      }

      router.refresh();
    });
  }

  function handleDelete(image: VehicleImageItem) {
    const confirmed = window.confirm(
      `Delete this image from ${vehicleName}?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    runImageAction(() =>
      deleteVehicleImage(vehicleId, image.id),
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{message}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-7 text-center transition ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/20 hover:border-primary/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          multiple
          className="hidden"
          onChange={handleInputChange}
        />

        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          <ImagePlus className="size-6 text-primary" />
        </div>

        <h3 className="mt-4 font-semibold">
          Add vehicle images
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Drag and drop images here, or choose files from your
          device. JPEG, PNG, WebP or AVIF, maximum 5 MB each.
        </p>

        <Button
          type="button"
          variant="outline"
          className="mt-5"
          disabled={remainingSlots <= 0 || uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-2 size-4" />
          Choose images
        </Button>

        <p className="mt-3 text-xs text-muted-foreground">
          {remainingSlots} of {MAX_IMAGES} slots remaining
        </p>
      </div>

      {selectedImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">
                Ready to upload
              </h3>

              <p className="text-sm text-muted-foreground">
                {selectedImages.length} image
                {selectedImages.length === 1 ? "" : "s"} selected
              </p>
            </div>

            <Button
              type="button"
              onClick={uploadImages}
              disabled={uploading}
              className="w-full sm:w-auto"
            >
              {uploading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Upload className="mr-2 size-4" />
              )}

              {uploading
                ? "Uploading..."
                : `Upload ${selectedImages.length} image${
                    selectedImages.length === 1 ? "" : "s"
                  }`}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {selectedImages.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url("${image.previewUrl}")`,
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    removeSelectedImage(image.id)
                  }
                  disabled={uploading}
                  className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/65 text-white transition hover:bg-destructive disabled:opacity-50"
                  aria-label={`Remove ${image.file.name}`}
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length > 0 ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Vehicle gallery</h3>

            <p className="text-sm text-muted-foreground">
              The first image is displayed first. Select one image
              as the website cover.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {images.map((image, index) => (
              <article
                key={image.id}
                className={`overflow-hidden rounded-xl border bg-background shadow-sm ${
                  image.isCover
                    ? "ring-2 ring-[#d4aa50] ring-offset-2"
                    : ""
                }`}
              >
                <div className="relative aspect-[4/3] bg-muted">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url("${image.url}")`,
                    }}
                    role="img"
                    aria-label={
                      image.altText ?? `${vehicleName} image`
                    }
                  />

                  {image.isCover && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-[#d4aa50] px-3 py-1.5 text-xs font-semibold text-[#173d32] shadow">
                      <Crown className="size-3.5" />
                      Cover image
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Image {index + 1}
                    </p>

                    {!image.isCover && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() =>
                          runImageAction(() =>
                            setVehicleCoverImage(
                              vehicleId,
                              image.id,
                            ),
                          )
                        }
                      >
                        <Crown className="mr-2 size-4" />
                        Set cover
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending || index === 0}
                      onClick={() =>
                        runImageAction(() =>
                          moveVehicleImage(
                            vehicleId,
                            image.id,
                            "left",
                          ),
                        )
                      }
                      aria-label="Move image left"
                    >
                      <ArrowLeft className="size-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        pending || index === images.length - 1
                      }
                      onClick={() =>
                        runImageAction(() =>
                          moveVehicleImage(
                            vehicleId,
                            image.id,
                            "right",
                          ),
                        )
                      }
                      aria-label="Move image right"
                    >
                      <ArrowRight className="size-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={pending}
                      onClick={() => handleDelete(image)}
                      aria-label="Delete image"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-muted/20 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            This vehicle does not have any images yet. The first
            uploaded image will automatically become its cover.
          </p>
        </div>
      )}
    </div>
  );
}