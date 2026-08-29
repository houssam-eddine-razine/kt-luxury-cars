"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Pencil, Trash2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

type VehicleActionsProps = {
  vehicleId: string;
  vehicleName: string;
  deleteAction: () => Promise<void>;
  mobile?: boolean;
};

function DeleteButton({
  vehicleName,
  mobile,
}: {
  vehicleName: string;
  mobile: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="destructive"
      size="sm"
      disabled={pending}
      className={mobile ? "w-full" : ""}
      onClick={(event) => {
        const confirmed = window.confirm(
          `Delete ${vehicleName}?\n\nThis action cannot be undone.`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <Trash2 className="mr-2 size-4" />
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}

export function VehicleActions({
  vehicleId,
  vehicleName,
  deleteAction,
  mobile = false,
}: VehicleActionsProps) {
  return (
    <div
      className={
        mobile
          ? "grid grid-cols-2 gap-2"
          : "flex items-center justify-end gap-2"
      }
    >
      <Link
        href={`/admin/vehicles/${vehicleId}/edit`}
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className: mobile ? "w-full" : "",
        })}
      >
        <Pencil className="mr-2 size-4" />
        Edit
      </Link>

      <form action={deleteAction} className={mobile ? "w-full" : ""}>
        <DeleteButton
          vehicleName={vehicleName}
          mobile={mobile}
        />
      </form>
    </div>
  );
}