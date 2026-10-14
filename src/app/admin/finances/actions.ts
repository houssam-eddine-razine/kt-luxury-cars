"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type FinanceActionResult = {
  success: boolean;
  message: string;
};

const expenseCategories = [
  "VEHICLE_FINANCE",
  "INSURANCE",
  "REPAIR",
  "PARTS",
  "FUEL",
  "ADBLUE",
  "CLEANING",
  "TAXES",
  "ACCOUNTING",
  "MARKETING",
  "SALARY",
  "RENT",
  "UTILITIES",
  "OTHER",
] as const;

const expenseStatuses = [
  "PLANNED",
  "PAID",
  "CANCELLED",
] as const;

const recurrenceFrequencies = [
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
] as const;

type ExpenseCategoryValue =
  (typeof expenseCategories)[number];

type ExpenseStatusValue =
  (typeof expenseStatuses)[number];

type RecurrenceFrequencyValue =
  (typeof recurrenceFrequencies)[number];

async function isAuthenticatedAdministrator() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  return !error && Boolean(data?.claims);
}

function parseIsoDate(value: FormDataEntryValue | null) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function parsePositiveAmount(
  value: FormDataEntryValue | null,
) {
  if (typeof value !== "string") {
    return null;
  }

  const amount = Number(value);

  if (!Number.isInteger(amount) || amount <= 0) {
    return null;
  }

  return amount;
}

function optionalText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const cleanedValue = value.trim();

  return cleanedValue === "" ? null : cleanedValue;
}

function isExpenseCategory(
  value: string,
): value is ExpenseCategoryValue {
  return expenseCategories.some(
    (category) => category === value,
  );
}

function isExpenseStatus(
  value: string,
): value is ExpenseStatusValue {
  return expenseStatuses.some(
    (status) => status === value,
  );
}

function isRecurrenceFrequency(
  value: string,
): value is RecurrenceFrequencyValue {
  return recurrenceFrequencies.some(
    (frequency) => frequency === value,
  );
}

function advanceDate(
  date: Date,
  frequency: RecurrenceFrequencyValue,
) {
  const nextDate = new Date(date);

  if (frequency === "WEEKLY") {
    nextDate.setUTCDate(nextDate.getUTCDate() + 7);
  }

  if (frequency === "MONTHLY") {
    nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
  }

  if (frequency === "QUARTERLY") {
    nextDate.setUTCMonth(nextDate.getUTCMonth() + 3);
  }

  if (frequency === "YEARLY") {
    nextDate.setUTCFullYear(nextDate.getUTCFullYear() + 1);
  }

  return nextDate;
}

function refreshFinancePages() {
  revalidatePath("/admin");
  revalidatePath("/admin/finances");
  revalidatePath("/admin/maintenance");
}

export async function createExpense(
  _previousState: FinanceActionResult,
  formData: FormData,
): Promise<FinanceActionResult> {
  void _previousState;

  if (!(await isAuthenticatedAdministrator())) {
    return {
      success: false,
      message:
        "Your session has expired. Please sign in again.",
    };
  }

  const title = optionalText(formData.get("title"));
  const categoryValue = String(
    formData.get("category") ?? "",
  );
  const statusValue = String(
    formData.get("status") ?? "",
  );
  const amount = parsePositiveAmount(
    formData.get("amount"),
  );
  const expenseDate = parseIsoDate(
    formData.get("expenseDate"),
  );
  const dueDate = parseIsoDate(formData.get("dueDate"));
  const vehicleId = optionalText(
    formData.get("vehicleId"),
  );
  const supplier = optionalText(
    formData.get("supplier"),
  );
  const reference = optionalText(
    formData.get("reference"),
  );
  const notes = optionalText(formData.get("notes"));

  const recurring = formData.get("recurring") === "on";
  const recurrenceValue = String(
    formData.get("recurrenceFrequency") ?? "",
  );

  if (!title || title.length < 2) {
    return {
      success: false,
      message: "Enter a clear expense title.",
    };
  }

  if (!isExpenseCategory(categoryValue)) {
    return {
      success: false,
      message: "Select a valid expense category.",
    };
  }

  if (!isExpenseStatus(statusValue)) {
    return {
      success: false,
      message: "Select a valid payment status.",
    };
  }

  if (!amount) {
    return {
      success: false,
      message: "Enter a valid amount greater than zero.",
    };
  }

  if (!expenseDate) {
    return {
      success: false,
      message: "Enter a valid expense date.",
    };
  }

  let recurrenceFrequency:
    | RecurrenceFrequencyValue
    | null = null;

  if (recurring) {
    if (!isRecurrenceFrequency(recurrenceValue)) {
      return {
        success: false,
        message: "Select how often this charge repeats.",
      };
    }

    recurrenceFrequency = recurrenceValue;
  }

  if (vehicleId) {
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
        success: false,
        message: "The selected vehicle no longer exists.",
      };
    }
  }

  const effectiveDueDate =
    dueDate ??
    (statusValue === "PLANNED" ? expenseDate : null);

  const nextDueDate =
    recurring && recurrenceFrequency
      ? advanceDate(
          effectiveDueDate ?? expenseDate,
          recurrenceFrequency,
        )
      : null;

  try {
    await prisma.expense.create({
      data: {
        title,
        category: categoryValue,
        status: statusValue,
        source: "MANUAL",
        amount,
        expenseDate,
        dueDate: effectiveDueDate,
        paidDate:
          statusValue === "PAID" ? expenseDate : null,
        supplier,
        reference,
        notes,
        recurring,
        recurrenceFrequency,
        nextDueDate,
        vehicleId,
      },
    });
  } catch (error) {
    console.error("Expense creation failed:", error);

    return {
      success: false,
      message: "The expense could not be saved.",
    };
  }

  refreshFinancePages();

  return {
    success: true,
    message: "Expense saved successfully.",
  };
}

export async function markExpensePaid(
  expenseId: string,
): Promise<FinanceActionResult> {
  if (!(await isAuthenticatedAdministrator())) {
    return {
      success: false,
      message: "Your session has expired.",
    };
  }

  try {
    const result = await prisma.$transaction(
      async (transaction) => {
        const expense = await transaction.expense.findUnique({
          where: {
            id: expenseId,
          },
        });

        if (!expense) {
          return {
            status: "NOT_FOUND" as const,
          };
        }

        if (expense.status === "CANCELLED") {
          return {
            status: "CANCELLED" as const,
          };
        }

        /*
         * Only one request can change this expense from
         * PLANNED to PAID. Repeated clicks will update zero rows.
         */
        const updated =
          await transaction.expense.updateMany({
            where: {
              id: expense.id,
              status: "PLANNED",
            },
            data: {
              status: "PAID",
              paidDate: new Date(),
            },
          });

        if (updated.count === 0) {
          return {
            status: "ALREADY_PAID" as const,
          };
        }

        if (
          expense.recurring &&
          expense.recurrenceFrequency &&
          expense.nextDueDate
        ) {
          const nextDate = expense.nextDueDate;

          /*
           * Check for an existing future occurrence before
           * creating another one.
           */
          const existingNextExpense =
            await transaction.expense.findFirst({
              where: {
                title: expense.title,
                category: expense.category,
                amount: expense.amount,
                vehicleId: expense.vehicleId,
                expenseDate: nextDate,
                recurring: true,
                status: {
                  not: "CANCELLED",
                },
              },
              select: {
                id: true,
              },
            });

          if (!existingNextExpense) {
            const followingDate = advanceDate(
              nextDate,
              expense.recurrenceFrequency,
            );

            await transaction.expense.create({
              data: {
                title: expense.title,
                category: expense.category,
                status: "PLANNED",
                source: "MANUAL",
                amount: expense.amount,
                expenseDate: nextDate,
                dueDate: nextDate,
                paidDate: null,
                supplier: expense.supplier,
                reference: expense.reference,
                notes: expense.notes,
                recurring: true,
                recurrenceFrequency:
                  expense.recurrenceFrequency,
                nextDueDate: followingDate,
                vehicleId: expense.vehicleId,
              },
            });
          }
        }

        return {
          status: "PAID" as const,
        };
      },
    );

    if (result.status === "NOT_FOUND") {
      return {
        success: false,
        message: "Expense not found.",
      };
    }

    if (result.status === "CANCELLED") {
      return {
        success: false,
        message:
          "A cancelled expense cannot be marked as paid.",
      };
    }

    if (result.status === "ALREADY_PAID") {
      return {
        success: true,
        message:
          "This expense was already paid. No duplicate was created.",
      };
    }
  } catch (error) {
    console.error("Expense payment update failed:", error);

    return {
      success: false,
      message: "The payment status could not be updated.",
    };
  }

  refreshFinancePages();

  return {
    success: true,
    message:
      "Expense marked as paid. The next recurring payment was scheduled once.",
  };
}

export async function cancelExpense(
  expenseId: string,
): Promise<FinanceActionResult> {
  if (!(await isAuthenticatedAdministrator())) {
    return {
      success: false,
      message: "Your session has expired.",
    };
  }

  const expense = await prisma.expense.findUnique({
    where: {
      id: expenseId,
    },
    select: {
      id: true,
      status: true,
      source: true,
    },
  });

  if (!expense) {
    return {
      success: false,
      message: "Expense not found.",
    };
  }

  if (expense.source === "MAINTENANCE") {
    return {
      success: false,
      message:
        "Maintenance expenses must be managed from Maintenance.",
    };
  }

  if (expense.status === "PAID") {
    return {
      success: false,
      message:
        "A paid expense cannot be cancelled. Create a correction entry instead.",
    };
  }

  if (expense.status === "CANCELLED") {
    return {
      success: true,
      message: "This expense is already cancelled.",
    };
  }

  try {
    await prisma.expense.update({
      where: {
        id: expense.id,
      },
      data: {
        status: "CANCELLED",
      },
    });
  } catch (error) {
    console.error("Expense cancellation failed:", error);

    return {
      success: false,
      message: "The expense could not be cancelled.",
    };
  }

  refreshFinancePages();

  return {
    success: true,
    message: "Expense cancelled.",
  };
}