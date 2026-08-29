import {
  CarFront,
  ClipboardPlus,
  KeyRound,
  RotateCcw,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const indicators = [
  {
    label: "Available today",
    value: "4",
    icon: CarFront,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Currently rented",
    value: "3",
    icon: KeyRound,
    color: "bg-amber-50 text-amber-700",
  },
  {
    label: "Returns today",
    value: "2",
    icon: RotateCcw,
    color: "bg-blue-50 text-blue-700",
  },
  {
    label: "New requests",
    value: "5",
    icon: ClipboardPlus,
    color: "bg-purple-50 text-purple-700",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-[#102e2b]">
          Good morning, Houssam.
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          Here&apos;s what is happening with your fleet today.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {indicators.map((indicator) => {
          const Icon = indicator.icon;

          return (
            <Card key={indicator.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex size-12 items-center justify-center rounded-full ${indicator.color}`}
                >
                  <Icon className="size-5" />
                </div>

                <div>
                  <p className="text-sm text-neutral-500">
                    {indicator.label}
                  </p>

                  <p className="mt-1 text-3xl font-semibold">
                    {indicator.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}