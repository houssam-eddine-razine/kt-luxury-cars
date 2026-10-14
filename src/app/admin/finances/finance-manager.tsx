"use client";

import {
  useActionState,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  CalendarClock,
  CarFront,
  Check,
  ChevronDown,
  Filter,
  Plus,
  ReceiptText,
  Repeat2,
  Search,
  X,
} from "lucide-react";

import {
  cancelExpense,
  createExpense,
  markExpensePaid,
  type FinanceActionResult,
} from "./actions";
import { EuropeanDateInput } from "@/components/ui/european-date-input";

type VehicleOption = {
  id: string;
  name: string;
  registration: string;
};

type ExpenseItem = {
  id: string;
  title: string;
  category: string;
  status: string;
  source: string;
  amount: number;
  expenseDate: string;
  dueDate: string | null;
  paidDate: string | null;
  supplier: string | null;
  reference: string | null;
  notes: string | null;
  recurring: boolean;
  recurrenceFrequency: string | null;
  nextDueDate: string | null;
  vehicle: {
    id: string;
    name: string;
    registration: string;
  } | null;
};

type FinanceManagerProps = {
  vehicles: VehicleOption[];
  expenses: ExpenseItem[];
  today: string;
};

const initialState: FinanceActionResult = {
  success: false,
  message: "",
};

const categories = [
  {
    value: "VEHICLE_FINANCE",
    label: "Vehicle finance",
  },
  {
    value: "INSURANCE",
    label: "Insurance",
  },
  {
    value: "REPAIR",
    label: "Repairs",
  },
  {
    value: "PARTS",
    label: "Parts",
  },
  {
    value: "FUEL",
    label: "Fuel",
  },
  {
    value: "ADBLUE",
    label: "AdBlue",
  },
  {
    value: "CLEANING",
    label: "Cleaning",
  },
  {
    value: "TAXES",
    label: "Taxes",
  },
  {
    value: "ACCOUNTING",
    label: "Accounting",
  },
  {
    value: "MARKETING",
    label: "Marketing",
  },
  {
    value: "SALARY",
    label: "Salaries",
  },
  {
    value: "RENT",
    label: "Rent",
  },
  {
    value: "UTILITIES",
    label: "Utilities",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

const categoryLabels = Object.fromEntries(
  categories.map((category) => [
    category.value,
    category.label,
  ]),
);

const statusLabels: Record<string, string> = {
  PLANNED: "Planned",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

const recurrenceLabels: Record<string, string> = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("fr-MA", {
    maximumFractionDigits: 0,
  }).format(value)} MAD`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(
    new Date(`${value.slice(0, 10)}T00:00:00.000Z`),
  );
}

function statusClass(status: string) {
  if (status === "PAID") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/15";
  }

  if (status === "PLANNED") {
    return "bg-amber-50 text-amber-700 ring-amber-600/15";
  }

  return "bg-neutral-100 text-neutral-500 ring-neutral-500/15";
}

export function FinanceManager({
  vehicles,
  expenses,
  today,
}: FinanceManagerProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [expenseDate, setExpenseDate] = useState(today);
  const [dueDate, setDueDate] = useState("");
  const [recurring, setRecurring] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ACTIVE");
  const [categoryFilter, setCategoryFilter] =
    useState("ALL");

  const [state, formAction, pending] = useActionState(
    createExpense,
    initialState,
  );

  const [actionPending, startTransition] =
    useTransition();

  const [actionMessage, setActionMessage] =
    useState("");

  const [actionSuccess, setActionSuccess] =
    useState(false);

  const filteredExpenses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return expenses.filter((expense) => {
      const searchableText = [
        expense.title,
        expense.supplier,
        expense.reference,
        expense.vehicle?.name,
        expense.vehicle?.registration,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedSearch === "" ||
        searchableText.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE"
          ? expense.status !== "CANCELLED"
          : expense.status === statusFilter);

      const matchesCategory =
        categoryFilter === "ALL" ||
        expense.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    categoryFilter,
    expenses,
    search,
    statusFilter,
  ]);

  function runExpenseAction(
    action: () => Promise<FinanceActionResult>,
  ) {
    setActionMessage("");

    startTransition(async () => {
      const result = await action();

      setActionSuccess(result.success);
      setActionMessage(result.message);
    });
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <button
          type="button"
          onClick={() =>
            setFormOpen((current) => !current)
          }
          className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
        >
          <span className="flex min-w-0 items-center gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#0B1726] text-[#d4aa50]">
              <Plus className="size-5" />
            </span>

            <span>
              <span className="block text-base font-semibold text-neutral-900">
                Add an expense
              </span>

              <span className="mt-1 block text-sm text-neutral-500">
                Record a payment or schedule a future
                charge.
              </span>
            </span>
          </span>

          <ChevronDown
            className={`size-5 shrink-0 text-neutral-400 transition ${
              formOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {formOpen && (
          <form
            action={formAction}
            className="border-t bg-neutral-50/60 p-5 sm:p-6"
          >
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Expense title
                </span>

                <input
                  name="title"
                  required
                  placeholder="Example: Audi insurance"
                  className="h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition focus:border-[#a47d2f] focus:ring-4 focus:ring-[#d4aa50]/15"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Category
                </span>

                <select
                  name="category"
                  required
                  defaultValue=""
                  className="h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition focus:border-[#a47d2f] focus:ring-4 focus:ring-[#d4aa50]/15"
                >
                  <option value="" disabled>
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.value}
                      value={category.value}
                    >
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Amount
                </span>

                <div className="relative">
                  <input
                    name="amount"
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="0"
                    className="h-12 w-full rounded-xl border bg-white px-4 pr-16 text-sm outline-none transition focus:border-[#a47d2f] focus:ring-4 focus:ring-[#d4aa50]/15"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-500">
                    MAD
                  </span>
                </div>
              </label>

              <label
                htmlFor="expenseDate"
                className="space-y-2"
              >
                <span className="text-sm font-medium">
                  Expense date
                </span>

                <EuropeanDateInput
                  id="expenseDate"
                  name="expenseDate"
                  value={expenseDate}
                  onChange={setExpenseDate}
                  required
                  className="h-12 bg-white"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Payment status
                </span>

                <select
                  name="status"
                  defaultValue="PAID"
                  className="h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition focus:border-[#a47d2f] focus:ring-4 focus:ring-[#d4aa50]/15"
                >
                  <option value="PAID">Paid</option>

                  <option value="PLANNED">
                    Planned / unpaid
                  </option>
                </select>
              </label>

              <label
                htmlFor="dueDate"
                className="space-y-2"
              >
                <span className="text-sm font-medium">
                  Due date
                </span>

                <EuropeanDateInput
                  id="dueDate"
                  name="dueDate"
                  value={dueDate}
                  onChange={setDueDate}
                  className="h-12 bg-white"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Vehicle
                </span>

                <select
                  name="vehicleId"
                  defaultValue=""
                  className="h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition focus:border-[#a47d2f] focus:ring-4 focus:ring-[#d4aa50]/15"
                >
                  <option value="">
                    General business expense
                  </option>

                  {vehicles.map((vehicle) => (
                    <option
                      key={vehicle.id}
                      value={vehicle.id}
                    >
                      {vehicle.name} ·{" "}
                      {vehicle.registration}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Supplier
                </span>

                <input
                  name="supplier"
                  placeholder="Garage, insurer, supplier..."
                  className="h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition focus:border-[#a47d2f] focus:ring-4 focus:ring-[#d4aa50]/15"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  Reference
                </span>

                <input
                  name="reference"
                  placeholder="Invoice or payment reference"
                  className="h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition focus:border-[#a47d2f] focus:ring-4 focus:ring-[#d4aa50]/15"
                />
              </label>

              <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-white px-4 md:col-span-2 xl:col-span-1">
                <input
                  name="recurring"
                  type="checkbox"
                  checked={recurring}
                  onChange={(event) =>
                    setRecurring(event.target.checked)
                  }
                  className="size-4 accent-[#0B1726]"
                />

                <span>
                  <span className="block text-sm font-medium">
                    Recurring charge
                  </span>

                  <span className="text-xs text-neutral-500">
                    Credit, insurance, rent or subscription
                  </span>
                </span>
              </label>

              {recurring && (
                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Repeats
                  </span>

                  <select
                    name="recurrenceFrequency"
                    defaultValue="MONTHLY"
                    className="h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition focus:border-[#a47d2f] focus:ring-4 focus:ring-[#d4aa50]/15"
                  >
                    <option value="WEEKLY">
                      Weekly
                    </option>

                    <option value="MONTHLY">
                      Monthly
                    </option>

                    <option value="QUARTERLY">
                      Every three months
                    </option>

                    <option value="YEARLY">
                      Yearly
                    </option>
                  </select>
                </label>
              )}

              <label className="space-y-2 md:col-span-2 xl:col-span-3">
                <span className="text-sm font-medium">
                  Notes
                </span>

                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Optional details about this expense"
                  className="w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a47d2f] focus:ring-4 focus:ring-[#d4aa50]/15"
                />
              </label>
            </div>

            {state.message && (
              <p
                role="status"
                className={`mt-5 rounded-xl border px-4 py-3 text-sm font-medium ${
                  state.success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {state.message}
              </p>
            )}

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="min-h-12 rounded-xl border bg-white px-5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={pending}
                className="min-h-12 rounded-xl bg-[#0B1726] px-6 text-sm font-semibold text-white transition hover:bg-[#17283d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending
                  ? "Saving..."
                  : "Save expense"}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_210px_230px]">
          <label className="relative">
            <span className="sr-only">
              Search expenses
            </span>

            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search title, supplier, vehicle or reference"
              className="h-12 w-full rounded-xl border bg-neutral-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#a47d2f] focus:bg-white focus:ring-4 focus:ring-[#d4aa50]/15"
            />
          </label>

          <label className="relative">
            <span className="sr-only">
              Filter by status
            </span>

            <Filter className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-12 w-full appearance-none rounded-xl border bg-neutral-50 pl-11 pr-10 text-sm outline-none transition focus:border-[#a47d2f] focus:bg-white"
            >
              <option value="ACTIVE">
                Active expenses
              </option>

              <option value="ALL">
                All statuses
              </option>

              <option value="PAID">Paid</option>

              <option value="PLANNED">
                Planned
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          </label>

          <label className="relative">
            <span className="sr-only">
              Filter by category
            </span>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="h-12 w-full appearance-none rounded-xl border bg-neutral-50 px-4 pr-10 text-sm outline-none transition focus:border-[#a47d2f] focus:bg-white"
            >
              <option value="ALL">
                All categories
              </option>

              {categories.map((category) => (
                <option
                  key={category.value}
                  value={category.value}
                >
                  {category.label}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          </label>
        </div>
      </section>

      {actionMessage && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            actionSuccess
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {actionMessage}
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Expense management
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              {filteredExpenses.length} expense
              {filteredExpenses.length === 1
                ? ""
                : "s"}{" "}
              shown
            </p>
          </div>

          {(search ||
            statusFilter !== "ACTIVE" ||
            categoryFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ACTIVE");
                setCategoryFilter("ALL");
              }}
              className="flex min-h-10 items-center gap-2 rounded-lg border bg-white px-3 text-sm font-medium text-neutral-600"
            >
              <X className="size-4" />
              Clear
            </button>
          )}
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white px-5 py-14 text-center">
            <ReceiptText className="mx-auto size-10 text-neutral-300" />

            <h3 className="mt-4 font-semibold">
              No expenses found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              Add your first expense or change the current
              filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredExpenses.map((expense) => (
              <article
                key={expense.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(120px,0.55fr))_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusClass(
                          expense.status,
                        )}`}
                      >
                        {statusLabels[expense.status] ??
                          expense.status}
                      </span>

                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-600">
                        {categoryLabels[
                          expense.category
                        ] ?? expense.category}
                      </span>

                      {expense.source ===
                        "MAINTENANCE" && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                          Maintenance
                        </span>
                      )}

                      {expense.recurring && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700">
                          <Repeat2 className="size-3" />

                          {expense.recurrenceFrequency
                            ? recurrenceLabels[
                                expense
                                  .recurrenceFrequency
                              ]
                            : "Recurring"}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 truncate text-base font-semibold text-neutral-900">
                      {expense.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                      {expense.vehicle && (
                        <span className="flex items-center gap-1.5">
                          <CarFront className="size-3.5" />

                          {expense.vehicle.name} ·{" "}
                          {
                            expense.vehicle
                              .registration
                          }
                        </span>
                      )}

                      {expense.supplier && (
                        <span>
                          {expense.supplier}
                        </span>
                      )}

                      {expense.reference && (
                        <span>
                          Ref: {expense.reference}
                        </span>
                      )}
                    </div>

                    {expense.notes && (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-500">
                        {expense.notes}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-neutral-500">
                      Amount
                    </p>

                    <p className="mt-1 text-lg font-semibold text-neutral-900">
                      {formatMoney(expense.amount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-500">
                      Expense date
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {formatDate(
                        expense.expenseDate,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="flex items-center gap-1 text-xs text-neutral-500">
                      <CalendarClock className="size-3.5" />

                      {expense.status === "PAID"
                        ? "Paid"
                        : "Due"}
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {formatDate(
                        expense.status === "PAID"
                          ? expense.paidDate
                          : expense.dueDate,
                      )}
                    </p>

                    {expense.nextDueDate &&
                      expense.status !==
                        "CANCELLED" && (
                        <p className="mt-1 text-[11px] text-purple-600">
                          Next:{" "}
                          {formatDate(
                            expense.nextDueDate,
                          )}
                        </p>
                      )}
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {expense.status ===
                      "PLANNED" && (
                      <button
                        type="button"
                        disabled={actionPending}
                        onClick={() =>
                          runExpenseAction(() =>
                            markExpensePaid(
                              expense.id,
                            ),
                          )
                        }
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Check className="size-4" />
                        Mark paid
                      </button>
                    )}

                    {expense.status ===
                      "PLANNED" &&
                      expense.source !==
                        "MAINTENANCE" && (
                        <button
                          type="button"
                          disabled={actionPending}
                          onClick={() => {
                            if (
                              window.confirm(
                                "Cancel this planned expense?",
                              )
                            ) {
                              runExpenseAction(() =>
                                cancelExpense(
                                  expense.id,
                                ),
                              );
                            }
                          }}
                          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <X className="size-4" />
                          Cancel
                        </button>
                      )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}