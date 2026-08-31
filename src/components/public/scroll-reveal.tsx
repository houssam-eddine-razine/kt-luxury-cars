"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type ScrollRevealProps = {
  children: ReactNode;
  direction?: "left" | "right" | "up";
  delay?: number;
  className?: string;
};

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);

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
        setVisible(true);
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

        animationFrameRef.current = requestAnimationFrame(() => {
          setVisible(true);
        });

        observer.unobserve(entry.target);
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -70px 0px",
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const hiddenTransforms = {
    left: "translate3d(-70px, 0, 0)",
    right: "translate3d(70px, 0, 0)",
    up: "translate3d(0, 65px, 0)",
  };

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible
      ? "translate3d(0, 0, 0)"
      : hiddenTransforms[direction],
    transitionProperty: "opacity, transform",
    transitionDuration: "1800ms",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    transitionDelay: `${delay}ms`,
    willChange: visible ? "auto" : "opacity, transform",
  };

  return (
    <div
      ref={elementRef}
      style={style}
      className={className}
    >
      {children}
    </div>
  );
}