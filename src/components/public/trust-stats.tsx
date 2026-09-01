"use client";

import {
  CarFront,
  Headphones,
  MapPin,
  Users,
} from "lucide-react";
import {
  type ComponentType,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";

type CounterProps = {
  value: number;
  suffix?: string;
};

function Counter({
  value,
  suffix = "",
}: CounterProps) {
  const elementRef =
    useRef<HTMLSpanElement>(null);

  const animationFrameRef =
    useRef<number | null>(null);

  const [displayedValue, setDisplayedValue] =
    useState(0);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    if (prefersReducedMotion) {
      animationFrameRef.current =
        requestAnimationFrame(() => {
          setDisplayedValue(value);
        });

      return () => {
        if (
          animationFrameRef.current !== null
        ) {
          cancelAnimationFrame(
            animationFrameRef.current,
          );
        }
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        const startTime = performance.now();
        const duration = 2200;

        function animate(currentTime: number) {
          const progress = Math.min(
            (currentTime - startTime) /
              duration,
            1,
          );

          const easedProgress =
            1 - Math.pow(1 - progress, 3);

          setDisplayedValue(
            Math.round(value * easedProgress),
          );

          if (progress < 1) {
            animationFrameRef.current =
              requestAnimationFrame(animate);
          }
        }

        animationFrameRef.current =
          requestAnimationFrame(animate);

        observer.disconnect();
      },
      {
        threshold: 0.3,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();

      if (
        animationFrameRef.current !== null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current,
        );
      }
    };
  }, [value]);

  return (
    <span ref={elementRef}>
      {displayedValue}
      {suffix}
    </span>
  );
}

type StatisticCardProps = {
  icon: ComponentType<{
    className?: string;
  }>;
  number?: number;
  suffix?: string;
  fixedValue?: string;
  title: string;
  description: string;
};

function StatisticCard({
  icon: Icon,
  number,
  suffix,
  fixedValue,
  title,
  description,
}: StatisticCardProps) {
  return (
    <article className="min-h-[156px] rounded-[20px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm sm:min-h-[175px] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#D3AF60]/15 text-[#E2C676] sm:size-11">
          <Icon className="size-5" />
        </span>

        <strong className="text-right font-heading text-3xl font-semibold leading-none text-white sm:text-5xl">
          {fixedValue ??
            (typeof number === "number" && (
              <Counter
                value={number}
                suffix={suffix}
              />
            ))}
        </strong>
      </div>

      <h3 className="mt-5 text-sm font-bold text-white">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-white/55">
        {description}
      </p>
    </article>
  );
}

type TrustStatsProps = {
  vehicleCount: number;
};

export function TrustStats({
  vehicleCount,
}: TrustStatsProps) {
  const translations =
    useTranslations("Stats");

  return (
    <section
      aria-label={translations("title")}
      className="bg-[#0B1726] px-4 py-12 text-white sm:px-8 sm:py-16 lg:px-12"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#D3AF60] sm:text-base sm:tracking-[0.2em]">
            {translations("eyebrow")}
          </p>

          <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
            {translations("title")}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <StatisticCard
            icon={CarFront}
            number={vehicleCount}
            title={translations(
              "carsAvailable",
            )}
            description={translations(
              "carsDescription",
            )}
          />

          <StatisticCard
            icon={Users}
            number={100}
            suffix="+"
            title={translations("customers")}
            description={translations(
              "customersDescription",
            )}
          />

          <StatisticCard
            icon={MapPin}
            fixedValue={translations(
              "localValue",
            )}
            title={translations(
              "marrakechService",
            )}
            description={translations(
              "marrakechDescription",
            )}
          />

          <StatisticCard
            icon={Headphones}
            fixedValue={translations(
              "directValue",
            )}
            title={translations(
              "personalAssistance",
            )}
            description={translations(
              "assistanceDescription",
            )}
          />
        </div>
      </div>
    </section>
  );
}