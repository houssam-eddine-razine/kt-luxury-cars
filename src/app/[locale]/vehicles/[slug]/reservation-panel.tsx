"use client";

import {
  ArrowRight,
  CalendarDays,
  Check,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type ReservationPanelProps = {
  vehicle: {
    brand: string;
    model: string;
    trim: string | null;
    dailyPrice: number;
    deposit: number | null;
  };
};

function getToday() {
  const date = new Date();

  return new Date(
    date.getTime() -
      date.getTimezoneOffset() * 60_000,
  )
    .toISOString()
    .split("T")[0];
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
  }).format(value);
}

const fieldClassName =
  "min-h-14 w-full rounded-[12px] border border-[#D8CDBB] bg-[#F7F2E9] px-4 text-sm font-semibold text-[#0B1726] outline-none transition focus:border-[#A47D2F] focus:ring-4 focus:ring-[#C8A45D]/15";

export function ReservationPanel({
  vehicle,
}: ReservationPanelProps) {
  const translations =
    useTranslations("Reservation");

  const [today] = useState(getToday);
  const [pickupDate, setPickupDate] =
    useState("");
  const [returnDate, setReturnDate] =
    useState("");
  const [location, setLocation] =
    useState("airport");
  const [error, setError] = useState("");

  const locations = [
    {
      value: "airport",
      label: translations("airport"),
    },
    {
      value: "cityCentre",
      label: translations("cityCentre"),
    },
    {
      value: "trainStation",
      label: translations("trainStation"),
    },
    {
      value: "hotelRiad",
      label: translations("hotelRiad"),
    },
    {
      value: "privateVilla",
      label: translations("privateVilla"),
    },
  ];

  const vehicleName = [
    vehicle.brand,
    vehicle.model,
    vehicle.trim,
  ]
    .filter(Boolean)
    .join(" ");

  function requestVehicle() {
    if (!pickupDate || !returnDate) {
      setError(translations("missingDates"));
      return;
    }

    if (returnDate <= pickupDate) {
      setError(translations("invalidDates"));
      return;
    }

    setError("");

    const selectedLocation =
      locations.find(
        (item) => item.value === location,
      )?.label ?? location;

    const message = [
      translations("messageGreeting"),
      "",
      translations("messageVehicle", {
        vehicle: vehicleName,
      }),
      "",
      translations("messagePickup", {
        date: pickupDate,
      }),
      translations("messageReturn", {
        date: returnDate,
      }),
      translations("messageLocation", {
        location: selectedLocation,
      }),
      translations("messageRate", {
        price: formatPrice(
          vehicle.dailyPrice,
        ),
      }),
      "",
      translations("messageClosing"),
    ].join("\n");

    const whatsappUrl =
      `https://wa.me/212619019549?text=${encodeURIComponent(
        message,
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <aside className="overflow-hidden rounded-[22px] border border-[#D8CDBB] bg-white shadow-[0_22px_60px_rgba(11,23,38,0.12)]">
      <div className="bg-[#0B1726] p-5 text-white sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#DFBE72]">
              {translations("dailyRate")}
            </p>

            <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
              <p className="font-heading text-3xl font-semibold sm:text-4xl">
                {formatPrice(vehicle.dailyPrice)} MAD
              </p>

              <p className="text-xs text-white/60">
                {translations("perDay")}
              </p>
            </div>
          </div>

          {vehicle.deposit !== null && (
            <div className="shrink-0 text-right">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#DFBE72]/75">
                {translations("deposit")}
              </p>

              <p className="mt-1 text-sm font-bold">
                {formatPrice(vehicle.deposit)} MAD
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-[#0B1726] sm:text-3xl">
            {translations("title")}
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#74808A]">
            {translations("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8D6B2B]">
              <CalendarDays className="size-4" />
              {translations("pickup")}
            </span>

            <input
              type="date"
              required
              min={today}
              value={pickupDate}
              onChange={(event) => {
                const value =
                  event.target.value;

                setPickupDate(value);
                setError("");

                if (
                  returnDate &&
                  returnDate <= value
                ) {
                  setReturnDate("");
                }
              }}
              className={`${fieldClassName} [color-scheme:light]`}
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8D6B2B]">
              <CalendarDays className="size-4" />
              {translations("return")}
            </span>

            <input
              type="date"
              required
              min={pickupDate || today}
              value={returnDate}
              onChange={(event) => {
                setReturnDate(
                  event.target.value,
                );
                setError("");
              }}
              className={`${fieldClassName} [color-scheme:light]`}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8D6B2B]">
            <MapPin className="size-4" />
            {translations(
              "deliveryLocation",
            )}
          </span>

          <select
            value={location}
            onChange={(event) => {
              setLocation(event.target.value);
              setError("");
            }}
            className={`${fieldClassName} cursor-pointer`}
          >
            {locations.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <p
            role="alert"
            className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={requestVehicle}
          className="group flex min-h-16 w-full items-center justify-between rounded-[14px] bg-[#128C5A] px-5 text-sm font-bold text-white shadow-[0_12px_26px_rgba(18,140,90,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0F774C]"
        >
          <span className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-white/15">
              <MessageCircle className="size-5" />
            </span>

            <span className="text-left">
              <span className="block">
                {translations(
                  "requestWhatsapp",
                )}
              </span>

              <span className="mt-0.5 block text-[10px] font-medium text-white/70 sm:text-xs">
                {translations(
                  "personalConfirmation",
                )}
              </span>
            </span>
          </span>

          <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
        </button>

        <div className="grid gap-3 border-t border-[#E8DFD2] pt-5 text-xs text-[#66727D] sm:grid-cols-3 lg:grid-cols-1">
          {[
            translations("noPayment"),
            translations(
              "availabilityConfirmed",
            ),
            translations(
              "conditionsBeforeConfirmation",
            ),
          ].map((item) => (
            <p
              key={item}
              className="flex items-center gap-2"
            >
              <Check className="size-4 shrink-0 text-[#A47D2F]" />
              {item}
            </p>
          ))}
        </div>
      </div>
    </aside>
  );
}