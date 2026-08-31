"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  Check,
  MapPin,
  MessageCircle,
} from "lucide-react";

function getToday() {
  const date = new Date();

  return new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  )
    .toISOString()
    .split("T")[0];
}

export function BookingBar() {
  const today = useMemo(() => getToday(), []);

  const [location, setLocation] = useState("Marrakech Airport");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [category, setCategory] = useState("All categories");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pickupDate || !returnDate) {
      setError("Please select your pick-up and return dates.");
      return;
    }

    if (returnDate < pickupDate) {
      setError("The return date must be after the pick-up date.");
      return;
    }

    setError("");

    const message = [
      "Hello KT Luxury Cars,",
      "",
      "I would like to check vehicle availability.",
      "",
      `Pick-up location: ${location}`,
      `Pick-up date: ${pickupDate}`,
      `Return date: ${returnDate}`,
      `Preferred category: ${category}`,
      "",
      "Please send me the available vehicles, exact prices and rental conditions.",
    ].join("\n");

    window.open(
      `https://wa.me/212619019549?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div className="overflow-hidden rounded-[22px] border border-[#c8a45d]/55 bg-[#062b23] shadow-[0_28px_80px_rgba(4,27,22,0.3)]">
      <div className="border-b border-white/10 px-6 py-5 sm:px-8 lg:flex lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.19em] text-[#d7b767]">
            Plan your journey
          </p>

          <p className="mt-1 text-sm text-white/65">
            Select your dates and receive availability directly.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/65 lg:mt-0">
          <span className="flex items-center gap-2">
            <Check className="size-4 text-[#d7b767]" />
            No payment required
          </span>

          <span className="flex items-center gap-2">
            <Check className="size-4 text-[#d7b767]" />
            Personal confirmation
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_270px]">
          <label className="border-b border-white/10 p-5 transition focus-within:bg-white/[0.05] lg:border-r xl:border-b-0">
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#d7b767]">
              <MapPin className="size-4" />
              Pick-up
            </span>

            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="mt-4 min-h-12 w-full cursor-pointer rounded-[9px] border border-white/10 bg-white/[0.07] px-4 text-sm font-semibold text-white outline-none focus:border-[#c8a45d]"
            >
              <option className="bg-[#062b23]">
                Marrakech Airport
              </option>
              <option className="bg-[#062b23]">
                Marrakech city centre
              </option>
              <option className="bg-[#062b23]">
                Marrakech train station
              </option>
              <option className="bg-[#062b23]">
                Hotel or riad delivery
              </option>
            </select>
          </label>

          <label className="border-b border-white/10 p-5 transition focus-within:bg-white/[0.05] lg:border-r xl:border-b-0">
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#d7b767]">
              <CalendarDays className="size-4" />
              Pick-up date
            </span>

            <input
              type="date"
              required
              min={today}
              value={pickupDate}
              onChange={(event) => {
                const value = event.target.value;

                setPickupDate(value);

                if (returnDate && returnDate < value) {
                  setReturnDate("");
                }
              }}
              className="mt-4 min-h-12 w-full rounded-[9px] border border-white/10 bg-white/[0.07] px-4 text-sm font-semibold text-white outline-none focus:border-[#c8a45d] [color-scheme:dark]"
            />
          </label>

          <label className="border-b border-white/10 p-5 transition focus-within:bg-white/[0.05] lg:border-r xl:border-b-0">
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#d7b767]">
              <CalendarDays className="size-4" />
              Return date
            </span>

            <input
              type="date"
              required
              min={pickupDate || today}
              value={returnDate}
              onChange={(event) =>
                setReturnDate(event.target.value)
              }
              className="mt-4 min-h-12 w-full rounded-[9px] border border-white/10 bg-white/[0.07] px-4 text-sm font-semibold text-white outline-none focus:border-[#c8a45d] [color-scheme:dark]"
            />
          </label>

          <label className="border-b border-white/10 p-5 transition focus-within:bg-white/[0.05] lg:border-r xl:border-b-0">
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#d7b767]">
              <CarFront className="size-4" />
              Vehicle
            </span>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-4 min-h-12 w-full cursor-pointer rounded-[9px] border border-white/10 bg-white/[0.07] px-4 text-sm font-semibold text-white outline-none focus:border-[#c8a45d]"
            >
              <option className="bg-[#062b23]">
                All categories
              </option>
              <option className="bg-[#062b23]">City</option>
              <option className="bg-[#062b23]">Premium</option>
              <option className="bg-[#062b23]">Luxury</option>
              <option className="bg-[#062b23]">SUV</option>
            </select>
          </label>

          <div className="flex p-5 lg:col-span-2 xl:col-span-1">
            <button
              type="submit"
              className="group flex min-h-16 w-full items-center justify-center gap-3 rounded-[10px] bg-[#c8a45d] px-7 text-sm font-bold text-[#06251e] transition hover:bg-[#d9b86f]"
            >
              Check availability

              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="border-t border-red-300/20 bg-red-950/30 px-6 py-4 text-sm font-semibold text-red-100"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col justify-between gap-3 border-t border-white/10 bg-[#041f19] px-6 py-4 text-xs text-white/55 sm:flex-row sm:items-center sm:px-8">
          <p>
            Airport, hotel, riad and private-villa delivery available.
          </p>

          <a
            href="https://wa.me/212619019549"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-bold text-[#d7b767] transition hover:text-white"
          >
            <MessageCircle className="size-4" />
            Prefer to speak directly?
          </a>
        </div>
      </form>
    </div>
  );
}