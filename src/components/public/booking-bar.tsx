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

const phone = "212619019549";

function getToday() {
  const date = new Date();

  return new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  )
    .toISOString()
    .split("T")[0];
}

const fieldClassName =
  "min-h-14 w-full rounded-[12px] border border-[#d8cdbb] bg-white px-4 text-[15px] font-semibold text-[#0B1726] outline-none transition focus:border-[#a47d2f] focus:ring-4 focus:ring-[#c8a45d]/15";

export function BookingBar() {
  const today = useMemo(() => getToday(), []);

  const [location, setLocation] = useState(
    "Marrakech Airport",
  );
  const [pickup, setPickup] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [category, setCategory] = useState(
    "All categories",
  );
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pickup || !returnDate) {
      setError(
        "Please select your pick-up and return dates.",
      );
      return;
    }

    if (returnDate < pickup) {
      setError(
        "The return date must be after the pick-up date.",
      );
      return;
    }

    setError("");

    const message = [
      "Hello KT Luxury Cars,",
      "",
      "Please check vehicle availability for me.",
      "",
      `Pick-up location: ${location}`,
      `Pick-up date: ${pickup}`,
      `Return date: ${returnDate}`,
      `Vehicle category: ${category}`,
    ].join("\n");

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  const directMessage = encodeURIComponent(
    "Hello KT Luxury Cars, I would like help choosing a rental car in Marrakech.",
  );

  return (
    <form
      onSubmit={submit}
      className="overflow-hidden rounded-[22px] border border-[#d8cdbb] bg-[#FFFCF7] shadow-[0_22px_60px_rgba(24,48,41,0.14)] sm:rounded-[26px]"
    >
      <div className="border-b border-[#e4dacb] px-5 py-5 sm:px-7 sm:py-6 lg:flex lg:items-center lg:justify-between lg:gap-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#9a762f] sm:text-base">
            Plan your journey
          </p>

          <p className="mt-1.5 text-sm leading-6 text-[#66727D] sm:text-[15px]">
            Select your details and receive availability
            directly.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#596875] lg:mt-0">
          <span className="flex items-center gap-2">
            <Check className="size-4 text-[#a47d2f]" />
            No online payment
          </span>

          <span className="flex items-center gap-2">
            <Check className="size-4 text-[#a47d2f]" />
            Personal confirmation
          </span>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:p-7 md:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <span className="mb-2.5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#8d6b2b]">
            <MapPin className="size-4" />
            Pick-up
          </span>

          <select
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
            className={fieldClassName}
          >
            <option>Marrakech Airport</option>
            <option>Marrakech city centre</option>
            <option>Marrakech train station</option>
            <option>Hotel or riad delivery</option>
            <option>Private villa delivery</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2.5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#8d6b2b]">
            <CalendarDays className="size-4" />
            Pick-up date
          </span>

          <input
            type="date"
            required
            min={today}
            value={pickup}
            onChange={(event) => {
              const selectedDate = event.target.value;

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
          <span className="mb-2.5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#8d6b2b]">
            <CalendarDays className="size-4" />
            Return date
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
          <span className="mb-2.5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#8d6b2b]">
            <CarFront className="size-4" />
            Vehicle
          </span>

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            className={fieldClassName}
          >
            <option>All categories</option>
            <option>City</option>
            <option>Premium</option>
            <option>Luxury</option>
            <option>SUV</option>
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

      <div className="flex flex-col gap-3 border-t border-[#e4dacb] bg-[#F7F2E9] p-5 sm:p-7 md:flex-row md:items-center md:justify-between">
        <p className="text-center text-xs leading-5 text-[#74808A] md:text-left">
          Airport, hotel, riad and private-villa delivery
          available.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={`https://wa.me/${phone}?text=${directMessage}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[12px] border border-[#b9964d] bg-white px-5 text-sm font-bold text-[#0B1726] transition hover:bg-[#f1e7d5]"
          >
            <MessageCircle className="size-5 text-[#128c5a]" />
            Speak directly
          </a>

          <button
            type="submit"
            className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-[12px] bg-[#c8a45d] px-6 text-sm font-extrabold text-[#0B1726] shadow-[0_12px_25px_rgba(164,125,47,0.2)] transition hover:bg-[#d9b86f] sm:min-w-56"
          >
            Check availability

            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </form>
  );
}
