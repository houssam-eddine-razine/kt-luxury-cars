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

type CounterProps = {
  value: number;
  suffix?: string;
};

function Counter({
  value,
  suffix = "",
}: CounterProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [displayedValue, setDisplayedValue] = useState(0);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      animationFrameRef.current = requestAnimationFrame(() => {
        setDisplayedValue(value);
      });

      return () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        const startTime = performance.now();
        const duration = 2400;

        function animate(currentTime: number) {
          const progress = Math.min(
            (currentTime - startTime) / duration,
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

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
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
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#d3af60]/15 text-[#e2c676] sm:size-11">
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
  return (
    <section
      aria-label="KT Luxury Cars statistics"
      className="bg-[#0B1726] px-4 py-12 text-white sm:px-8 sm:py-16 lg:px-12"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d3af60]">
            Trusted locally
          </p>

          <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
            A clearer way to rent in Marrakech.
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <StatisticCard
            icon={CarFront}
            number={vehicleCount}
            title="Cars available"
            description="Current online selection"
          />

          <StatisticCard
            icon={Users}
            number={100}
            suffix="+"
            title="Satisfied customers"
            description="Customers already served"
          />

          <StatisticCard
            icon={MapPin}
            fixedValue="Local"
            title="Marrakech service"
            description="Airport, hotel, riad or villa"
          />

          <StatisticCard
            icon={Headphones}
            fixedValue="Direct"
            title="Personal assistance"
            description="Speak directly with our team"
          />
        </div>
      </div>
    </section>
  );
}
