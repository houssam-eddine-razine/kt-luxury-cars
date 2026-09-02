import {
  CheckCircle2,
  CircleSlash2,
  Crown,
  FileCheck2,
  Plus,
} from "lucide-react";

import {
  setDefaultRentalPolicy,
  toggleRentalPolicy,
} from "./actions";
import {
  RentalPolicyForm,
  type RentalPolicyValues,
} from "./rental-policy-form";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function RentalPoliciesPage() {
  const policies = await prisma.rentalPolicy.findMany({
    orderBy: [
      {
        isDefault: "desc",
      },
      {
        active: "desc",
      },
      {
        updatedAt: "desc",
      },
    ],
    include: {
      _count: {
        select: {
          vehicles: true,
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Fleet configuration
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Rental policies
        </h1>

        <p className="mt-2 max-w-3xl text-muted-foreground">
          Manage driver requirements, mileage, fuel, insurance,
          delivery fees and the conditions displayed to customers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Plus className="size-5" />
            </span>

            <div>
              <CardTitle>Create a rental policy</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Create a reusable collection of rental conditions.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <RentalPolicyForm />
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Existing policies
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {policies.length} rental{" "}
            {policies.length === 1 ? "policy" : "policies"}{" "}
            configured.
          </p>
        </div>

        {policies.length === 0 ? (
          <Card>
            <CardContent className="py-14 text-center">
              <FileCheck2 className="mx-auto size-10 text-muted-foreground" />

              <h3 className="mt-4 text-lg font-semibold">
                No rental policies yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Create your first policy above and mark it as the
                default policy.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {policies.map((policy) => {
              const policyValues: RentalPolicyValues = {
                id: policy.id,
                name: policy.name,
                minimumDriverAge:
                  policy.minimumDriverAge,
                minimumLicenseYears:
                  policy.minimumLicenseYears,
                dailyMileageLimit:
                  policy.dailyMileageLimit,
                extraKilometrePrice:
                  policy.extraKilometrePrice,
                fuelPolicy: policy.fuelPolicy,
                insuranceIncluded:
                  policy.insuranceIncluded,
                insuranceDetails:
                  policy.insuranceDetails,
                insuranceExcess:
                  policy.insuranceExcess,
                airportDeliveryFee:
                  policy.airportDeliveryFee,
                cancellationPolicy:
                  policy.cancellationPolicy,
                acceptedPayments:
                  policy.acceptedPayments,
                requiredDocuments:
                  policy.requiredDocuments,
                active: policy.active,
                isDefault: policy.isDefault,
              };

              return (
                <Card
                  key={policy.id}
                  className={
                    policy.isDefault
                      ? "border-[#d4aa50] shadow-sm"
                      : ""
                  }
                >
                  <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                            policy.active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {policy.active ? (
                            <CheckCircle2 className="size-5" />
                          ) : (
                            <CircleSlash2 className="size-5" />
                          )}
                        </span>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle>{policy.name}</CardTitle>

                            {policy.isDefault && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#d4aa50]/20 px-3 py-1 text-xs font-semibold text-[#8a681e]">
                                <Crown className="size-3.5" />
                                Default
                              </span>
                            )}

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                policy.active
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {policy.active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-muted-foreground">
                            Assigned directly to{" "}
                            {policy._count.vehicles} vehicle
                            {policy._count.vehicles === 1
                              ? ""
                              : "s"}
                            .
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!policy.isDefault && (
                          <form
                            action={setDefaultRentalPolicy.bind(
                              null,
                              policy.id,
                            )}
                          >
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                            >
                              <Crown className="mr-2 size-4" />
                              Make default
                            </Button>
                          </form>
                        )}

                        <form
                          action={toggleRentalPolicy.bind(
                            null,
                            policy.id,
                            !policy.active,
                          )}
                        >
                          <Button
                            type="submit"
                            variant={
                              policy.active
                                ? "outline"
                                : "default"
                            }
                            size="sm"
                          >
                            {policy.active
                              ? "Deactivate"
                              : "Activate"}
                          </Button>
                        </form>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <details className="group rounded-lg border">
                      <summary className="cursor-pointer list-none px-5 py-4 font-medium">
                        <span className="group-open:hidden">
                          Edit rental policy
                        </span>

                        <span className="hidden group-open:inline">
                          Close policy editor
                        </span>
                      </summary>

                      <div className="border-t p-5">
                        <RentalPolicyForm
                          policy={policyValues}
                        />
                      </div>
                    </details>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}