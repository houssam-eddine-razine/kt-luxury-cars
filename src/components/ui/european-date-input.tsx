"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";

type EuropeanDateInputProps = {
  id: string;
  name?: string;
  value: string;
  onChange: (isoDate: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
};

function isoToEuropean(value: string) {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})$/,
  );

  if (!match) {
    return "";
  }

  const [, year, month, day] = match;

  return `${day}/${month}/${year}`;
}

function formatTypedValue(value: string) {
  const digits = value
    .replace(/\D/g, "")
    .slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(
    2,
    4,
  )}/${digits.slice(4)}`;
}

function europeanToIso(value: string) {
  const match = value.match(
    /^(\d{2})\/(\d{2})\/(\d{4})$/,
  );

  if (!match) {
    return null;
  }

  const [, dayText, monthText, yearText] = match;

  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);

  const date = new Date(
    Date.UTC(year, month - 1, day),
  );

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${yearText}-${monthText}-${dayText}`;
}

export function EuropeanDateInput({
  id,
  name,
  value,
  onChange,
  min,
  max,
  required,
  placeholder = "DD/MM/YYYY",
  className = "",
}: EuropeanDateInputProps) {
  const [displayValue, setDisplayValue] =
    useState(() => isoToEuropean(value));

  const [invalid, setInvalid] = useState(false);

  function updateDate(typedValue: string) {
    const formattedValue =
      formatTypedValue(typedValue);

    setDisplayValue(formattedValue);

    if (formattedValue.length < 10) {
      setInvalid(false);
      onChange("");
      return;
    }

    const isoDate =
      europeanToIso(formattedValue);

    if (
      !isoDate ||
      (min && isoDate < min) ||
      (max && isoDate > max)
    ) {
      setInvalid(true);
      onChange("");
      return;
    }

    setInvalid(false);
    onChange(isoDate);
  }

  return (
    <div>
      {name && (
        <input
          type="hidden"
          name={name}
          value={value}
        />
      )}

      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={displayValue}
          onChange={(event) =>
            updateDate(event.target.value)
          }
          onBlur={() => {
            if (
              required &&
              displayValue.length > 0 &&
              displayValue.length < 10
            ) {
              setInvalid(true);
            }
          }}
          placeholder={placeholder}
          aria-invalid={invalid}
          className={`${className} pr-11 ${
            invalid
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : ""
          }`}
        />

        <CalendarDays className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {invalid && (
        <p
          role="alert"
          className="mt-1 text-xs font-medium text-red-700"
        >
          Enter a valid date using DD/MM/YYYY.
        </p>
      )}
    </div>
  );
}