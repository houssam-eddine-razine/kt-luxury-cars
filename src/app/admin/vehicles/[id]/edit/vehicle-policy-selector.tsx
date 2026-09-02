"use client";

import { useActionState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Save,
} from "lucide-react";

import {
  assignVehiclePolicy,
  type VehiclePolicyActionState,
} from "./policy-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const initialState: VehiclePolicyActionState = {};

type RentalPolicyOption = {
  id: string;
  name: string;
  isDefault: boolean;
};

type VehiclePolicySelectorProps = {
  vehicleId: string;
  currentPolicyId: string | null;
  policies: RentalPolicyOption[];
};

export function VehiclePolicySelector({
  vehicleId,
  currentPolicyId,
  policies,
}: VehiclePolicySelectorProps) {
  const action = assignVehiclePolicy.bind(
    null,
    vehicleId,
  );

  const [state, formAction, pending] = useActionState(
    action,
    initialState,
  );

  const defaultPolicy = policies.find(
    (policy) => policy.isDefault,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.message && (
        <div
          className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${
            state.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}
          role={state.success ? "status" : "alert"}
        >
          {state.success ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
          )}

          <p>{state.message}</p>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-lg border bg-muted/20 p-4">
        <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-primary" />

        <div>
          <p className="font-medium">
            Rental conditions displayed to customers
          </p>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Leave this vehicle on the default policy or assign
            different conditions specifically to it.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="rentalPolicyId">
            Rental policy
          </Label>

          <select
            id="rentalPolicyId"
            name="rentalPolicyId"
            defaultValue={currentPolicyId ?? ""}
            className="flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">
              Use default policy
              {defaultPolicy
                ? ` — ${defaultPolicy.name}`
                : " — no default configured"}
            </option>

            {policies.map((policy) => (
              <option key={policy.id} value={policy.id}>
                {policy.name}
                {policy.isDefault ? " — Default" : ""}
              </option>
            ))}
          </select>

          <p className="text-xs text-muted-foreground">
            Only active rental policies are shown.
          </p>
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="w-full md:w-auto"
        >
          <Save className="mr-2 size-4" />

          {pending ? "Assigning..." : "Save policy"}
        </Button>
      </div>
    </form>
  );
}