"use client";

import {
  type FormEvent,
  useMemo,
  useState,
} from "react";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  Check,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

const phone = "212619019549";

function getToday() {
  const date = new Date();

  return new Date(
    date.getTime() -
      date.getTimezoneOffset() * 60_000,
  )
    .toISOString()
    .split("T")[0];
}

const fieldClassName =
  "min-h-14 w-full rounded-[12px] border border-[#D8CDBB] bg-white px-4 text-[15px] font-semibold text-[#0B1726] outline-none transition focus:border-[#A47D2F] focus:ring-4 focus:ring-[#C8A45D]/15";

export function BookingBar() {
  const translations =
    useTranslations("Booking");

  const today = useMemo(() => getToday(), []);

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

  const categories = [
    {
      value: "allCategories",
      label: translations("allCategories"),
    },
    {
      value: "city",
      label: translations("city"),
    },
    {
      value: "premium",
      label: translations("premium"),
    },
    {
      value: "luxury",
      label: translations("luxury"),
    },
    {
      value: "suv",
      label: translations("suv"),
    },
  ];

  const [location, setLocation] =
    useState("airport");

  const [pickup, setPickup] = useState("");
  const [returnDate, setReturnDate] =
    useState("");

  const [category, setCategory] =
    useState("allCategories");

  const [error, setError] = useState("");

  function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!pickup || !returnDate) {
      setError(translations("missingDates"));
      return;
    }

    if (returnDate < pickup) {
      setError(translations("invalidDates"));
      return;
    }

    setError("");

    const selectedLocation =
      locations.find(
        (item) => item.value === location,
      )?.label ?? location;

    const selectedCategory =
      categories.find(
        (item) => item.value === category,
      )?.label ?? category;

    const message = [
      translations("requestGreeting"),
      "",
      translations("requestIntroduction"),
      "",
      translations("pickupLocationLine", {
        location: selectedLocation,
      }),
      translations("pickupDateLine", {
        date: pickup,
      }),
      translations("returnDateLine", {
        date: returnDate,
      }),
      translations("categoryLine", {
        category: selectedCategory,
      }),
    ].join("\n");

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(
        message,
      )}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  const directMessage = encodeURIComponent(
    translations("directMessage"),
  );

  return (
    <form
      onSubmit={submit}
      className="overflow-hidden rounded-[22px] border border-[#D8CDBB] bg-[#FFFCF7] shadow-[0_22px_60px_rgba(11,23,38,0.14)] sm:rounded-[26px]"
    >
      <div className="border-b border-[#E4DACB] px-5 py-5 sm:px-7 sm:py-6 lg:flex lg:items-center lg:justify-between lg:gap-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#9A762F] sm:text-base">
            {translations("title")}
          </p>

          <p className="mt-1.5 text-sm leading-6 text-[#66727D] sm:text-[15px]">
            {translations("subtitle")}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#596875] lg:mt-0">
          <span className="flex items-center gap-2">
            <Check className="size-4 text-[#A47D2F]" />
            {translations("noOnlinePayment")}
          </span>

          <span className="flex items-center gap-2">
            <Check className="size-4 text-[#A47D2F]" />
            {translations("personalConfirmation")}
          </span>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:p-7 md:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <span className="mb-2.5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#8D6B2B]">
            <MapPin className="size-4" />
            {translations("pickup")}
          </span>

          <select
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
            className={fieldClassName}
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

        <label className="block">
          <span className="mb-2.5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#8D6B2B]">
            <CalendarDays className="size-4" />
            {translations("pickupDate")}
          </span>

          <input
            type="date"
            required
            min={today}
            value={pickup}
            onChange={(event) => {
              const selectedDate =
                event.target.value;

              setPickup(selectedDate);

              if (
                returnDate &&
                returnDate < selectedDate
              ) {
                setReturnDate("");
              }
            }}
            className={`${fieldClassName} [color-scheme:light]`}
          />
        </label>

        <label className="block">
          <span className="mb-2.5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#8D6B2B]">
            <CalendarDays className="size-4" />
            {translations("returnDate")}
          </span>

          <input
            type="date"
            required
            min={pickup || today}
            value={returnDate}
            onChange={(event) =>
              setReturnDate(event.target.value)
            }
            className={`${fieldClassName} [color-scheme:light]`}
          />
        </label>

        <label className="block">
          <span className="mb-2.5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#8D6B2B]">
            <CarFront className="size-4" />
            {translations("vehicle")}
          </span>

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            className={fieldClassName}
          >
            {categories.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p
          role="alert"
          className="mx-5 mb-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 sm:mx-7"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 border-t border-[#E4DACB] bg-[#F7F2E9] p-5 sm:p-7 md:flex-row md:items-center md:justify-between">
        <p className="text-center text-xs leading-5 text-[#74808A] md:text-left">
          {translations("deliveryNote")}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={`https://wa.me/${phone}?text=${directMessage}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[12px] border border-[#B9964D] bg-white px-5 text-sm font-bold text-[#0B1726] transition hover:bg-[#F1E7D5]"
          >
            <MessageCircle className="size-5 text-[#128C5A]" />
            {translations("speakDirectly")}
          </a>

          <button
            type="submit"
            className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-[12px] bg-[#C8A45D] px-6 text-sm font-extrabold text-[#0B1726] shadow-[0_12px_25px_rgba(164,125,47,0.2)] transition hover:bg-[#D9B86F] sm:min-w-56"
          >
            {translations("checkAvailability")}

            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </form>
  );
}