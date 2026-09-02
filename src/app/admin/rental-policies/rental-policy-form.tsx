"use client";

import { useActionState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Save,
} from "lucide-react";

import {
  saveRentalPolicy,
  type RentalPolicyActionState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: RentalPolicyActionState = {};

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

export type RentalPolicyValues = {
  id: string;
  name: string;
  minimumDriverAge: number | null;
  minimumLicenseYears: number | null;
  dailyMileageLimit: number | null;
  extraKilometrePrice: number | null;
  fuelPolicy: string | null;
  insuranceIncluded: boolean | null;
  insuranceDetails: string | null;
  insuranceExcess: number | null;
  airportDeliveryFee: number | null;
  cancellationPolicy: string | null;
  acceptedPayments: string | null;
  requiredDocuments: string | null;
  active: boolean;
  isDefault: boolean;
};

type RentalPolicyFormProps = {
  policy?: RentalPolicyValues;
};

function FieldError({
  errors,
}: {
  errors?: string[];
}) {
  if (!errors?.length) {
    return null;
  }

  return (
    <p className="mt-1 text-sm text-destructive" role="alert">
      {errors[0]}
    </p>
  );
}

export function RentalPolicyForm({
  policy,
}: RentalPolicyFormProps) {
  const action = saveRentalPolicy.bind(
    null,
    policy?.id ?? null,
  );

  const [state, formAction, pending] = useActionState(
    action,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-8">
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

      <section className="space-y-5">
        <div>
          <h3 className="font-semibold">Policy identity</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Give this collection of rental conditions a clear name.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`name-${policy?.id ?? "new"}`}>
            Policy name
          </Label>

          <Input
            id={`name-${policy?.id ?? "new"}`}
            name="name"
            placeholder="Standard Marrakech rental policy"
            defaultValue={policy?.name ?? ""}
            aria-invalid={Boolean(state.errors?.name)}
            required
          />

          <FieldError errors={state.errors?.name} />
        </div>
      </section>

      <div className="border-t" />

      <section className="space-y-5">
        <div>
          <h3 className="font-semibold">
            Driver requirements
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Minimum age and driving experience required.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`age-${policy?.id ?? "new"}`}>
              Minimum driver age
            </Label>

            <Input
              id={`age-${policy?.id ?? "new"}`}
              name="minimumDriverAge"
              type="number"
              min="0"
              placeholder="23"
              defaultValue={policy?.minimumDriverAge ?? ""}
            />

            <FieldError
              errors={state.errors?.minimumDriverAge}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`licence-${policy?.id ?? "new"}`}>
              Minimum licence years
            </Label>

            <Input
              id={`licence-${policy?.id ?? "new"}`}
              name="minimumLicenseYears"
              type="number"
              min="0"
              placeholder="2"
              defaultValue={
                policy?.minimumLicenseYears ?? ""
              }
            />

            <FieldError
              errors={state.errors?.minimumLicenseYears}
            />
          </div>
        </div>
      </section>

      <div className="border-t" />

      <section className="space-y-5">
        <div>
          <h3 className="font-semibold">
            Mileage and fuel
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Daily allowance, excess kilometre price and fuel return
            conditions.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor={`mileage-${policy?.id ?? "new"}`}>
              Daily mileage limit
            </Label>

            <Input
              id={`mileage-${policy?.id ?? "new"}`}
              name="dailyMileageLimit"
              type="number"
              min="0"
              placeholder="200"
              defaultValue={policy?.dailyMileageLimit ?? ""}
            />

            <FieldError
              errors={state.errors?.dailyMileageLimit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`extra-km-${policy?.id ?? "new"}`}>
              Extra kilometre price
            </Label>

            <Input
              id={`extra-km-${policy?.id ?? "new"}`}
              name="extraKilometrePrice"
              type="number"
              min="0"
              placeholder="5"
              defaultValue={
                policy?.extraKilometrePrice ?? ""
              }
            />

            <FieldError
              errors={state.errors?.extraKilometrePrice}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`fuel-${policy?.id ?? "new"}`}>
              Fuel policy
            </Label>

            <select
              id={`fuel-${policy?.id ?? "new"}`}
              name="fuelPolicy"
              className={selectClassName}
              defaultValue={policy?.fuelPolicy ?? ""}
            >
              <option value="">Not specified</option>
              <option value="FULL_TO_FULL">
                Full to full
              </option>
              <option value="SAME_TO_SAME">
                Same level on return
              </option>
              <option value="PREPURCHASE">
                Pre-purchased fuel
              </option>
            </select>

            <FieldError errors={state.errors?.fuelPolicy} />
          </div>
        </div>
      </section>

      <div className="border-t" />

      <section className="space-y-5">
        <div>
          <h3 className="font-semibold">Insurance</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Specify whether insurance is included and any excess
            payable by the customer.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor={`insurance-${policy?.id ?? "new"}`}
            >
              Insurance included
            </Label>

            <select
              id={`insurance-${policy?.id ?? "new"}`}
              name="insuranceIncluded"
              className={selectClassName}
              defaultValue={
                policy?.insuranceIncluded === true
                  ? "true"
                  : policy?.insuranceIncluded === false
                    ? "false"
                    : ""
              }
            >
              <option value="">Not specified</option>
              <option value="true">Included</option>
              <option value="false">Not included</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`excess-${policy?.id ?? "new"}`}>
              Insurance excess (MAD)
            </Label>

            <Input
              id={`excess-${policy?.id ?? "new"}`}
              name="insuranceExcess"
              type="number"
              min="0"
              placeholder="5000"
              defaultValue={policy?.insuranceExcess ?? ""}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label
              htmlFor={`insurance-details-${policy?.id ?? "new"}`}
            >
              Insurance details
            </Label>

            <Textarea
              id={`insurance-details-${policy?.id ?? "new"}`}
              name="insuranceDetails"
              rows={3}
              placeholder="Describe the insurance coverage and exclusions."
              defaultValue={policy?.insuranceDetails ?? ""}
            />
          </div>
        </div>
      </section>

      <div className="border-t" />

      <section className="space-y-5">
        <div>
          <h3 className="font-semibold">
            Delivery and conditions
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Customer-facing rental information.
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor={`airport-fee-${policy?.id ?? "new"}`}
            >
              Airport delivery fee (MAD)
            </Label>

            <Input
              id={`airport-fee-${policy?.id ?? "new"}`}
              name="airportDeliveryFee"
              type="number"
              min="0"
              placeholder="0"
              defaultValue={
                policy?.airportDeliveryFee ?? ""
              }
            />

            <p className="text-xs text-muted-foreground">
              Enter 0 when airport delivery is free.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-2">
              <Label
                htmlFor={`cancellation-${policy?.id ?? "new"}`}
              >
                Cancellation policy
              </Label>

              <Textarea
                id={`cancellation-${policy?.id ?? "new"}`}
                name="cancellationPolicy"
                rows={4}
                placeholder="Explain cancellation conditions."
                defaultValue={
                  policy?.cancellationPolicy ?? ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor={`payments-${policy?.id ?? "new"}`}
              >
                Accepted payments
              </Label>

              <Textarea
                id={`payments-${policy?.id ?? "new"}`}
                name="acceptedPayments"
                rows={4}
                placeholder="Cash, bank card or bank transfer."
                defaultValue={
                  policy?.acceptedPayments ?? ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor={`documents-${policy?.id ?? "new"}`}
              >
                Required documents
              </Label>

              <Textarea
                id={`documents-${policy?.id ?? "new"}`}
                name="requiredDocuments"
                rows={4}
                placeholder="Driving licence, passport and deposit."
                defaultValue={
                  policy?.requiredDocuments ?? ""
                }
              />
            </div>
          </div>
        </div>
      </section>

      <div className="border-t" />

      <section className="grid gap-4 sm:grid-cols-2">
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4">
          <input
            type="checkbox"
            name="active"
            defaultChecked={policy?.active ?? true}
            className="mt-1 size-4 accent-primary"
          />

          <span>
            <span className="block font-medium">
              Active policy
            </span>

            <span className="mt-1 block text-sm text-muted-foreground">
              This policy can be used on the public website.
            </span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4">
          <input
            type="checkbox"
            name="isDefault"
            defaultChecked={policy?.isDefault ?? false}
            className="mt-1 size-4 accent-primary"
          />

          <span>
            <span className="block font-medium">
              Default policy
            </span>

            <span className="mt-1 block text-sm text-muted-foreground">
              Used when a vehicle has no specific policy.
            </span>
          </span>
        </label>
      </section>

      <div className="flex justify-end border-t pt-5">
        <Button type="submit" disabled={pending}>
          <Save className="mr-2 size-4" />

          {pending
            ? "Saving policy..."
            : policy
              ? "Save policy changes"
              : "Create rental policy"}
        </Button>
      </div>
    </form>
  );
}