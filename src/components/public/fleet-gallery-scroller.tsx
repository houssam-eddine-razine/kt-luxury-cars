"use client";

import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type Props = {
  children: ReactNode;
  animated: boolean;
  french: boolean;
};

export function FleetGalleryScroller({
  children,
  animated,
  french,
}: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;

    const group = viewport?.querySelector<HTMLElement>(
      '[data-fleet-group="main"]',
    );

    if (!viewport || !group || !animated) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let width = 0;
    let position = 0;
    let previousTime = 0;
    let frame = 0;
    let resumeAt = 0;
    let lastWrite = -Infinity;
    let moving = false;
    let visible = true;
    let keyboardFocus = false;
    let suppressClickUntil = 0;

    let pointer: {
      id: number;
      x: number;
      y: number;
      left: number;
      type: string;
      moved: boolean;
    } | null = null;

    const modulo = (value: number, size: number) =>
      ((value % size) + size) % size;

    function measure() {
      if (!viewport || !group) return;

      const nextWidth = group.getBoundingClientRect().width;

      if (!nextWidth) return;

      const previousWidth = width || nextWidth;

      const progress =
        modulo(viewport.scrollLeft, previousWidth) /
        previousWidth;

      width = nextWidth;

      position = reducedMotion.matches
        ? 0
        : keyboardFocus
          ? viewport.scrollLeft
          : width + progress * width;

      lastWrite = performance.now();
      viewport.scrollLeft = position;
      moving = false;
    }

    function animate(time: number) {
      if (!viewport) return;

      const elapsed = previousTime
        ? Math.min(time - previousTime, 50)
        : 0;

      previousTime = time;
      frame = requestAnimationFrame(animate);

      if (
        !width ||
        paused ||
        reducedMotion.matches ||
        !visible ||
        document.hidden ||
        pointer ||
        keyboardFocus ||
        time < resumeAt
      ) {
        moving = false;
        return;
      }

      if (!moving) {
        position = viewport.scrollLeft;
      }

      position =
        width + modulo(position + elapsed * 0.032, width);

      lastWrite = performance.now();
      viewport.scrollLeft = position;
      moving = true;
    }

    function pauseForInteraction() {
      resumeAt = performance.now() + 1200;
      lastWrite = -Infinity;
      moving = false;
    }

    function pointerDown(event: PointerEvent) {
      if (
        !event.isPrimary ||
        (event.pointerType === "mouse" && event.button !== 0)
      ) {
        return;
      }

      if (!viewport) return;

      pointer = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        left: viewport.scrollLeft,
        type: event.pointerType,
        moved: false,
      };

      keyboardFocus = false;
      suppressClickUntil = 0;
      pauseForInteraction();
    }

    function pointerMove(event: PointerEvent) {
      if (
        !viewport ||
        !pointer ||
        pointer.id !== event.pointerId
      ) {
        return;
      }

      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;

      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        pointer.moved = true;
      }

      // Phones keep native swipe scrolling and momentum.
      // Mouse users can click and drag the gallery.
      if (pointer.type === "mouse" && Math.abs(dx) > 8) {
        viewport.dataset.dragging = "true";
        viewport.scrollLeft = pointer.left - dx;
        event.preventDefault();
      }
    }

    function releasePointer() {
      if (pointer?.moved) {
        suppressClickUntil = performance.now() + 500;
      }

      pointer = null;

      if (viewport) {
        delete viewport.dataset.dragging;
      }

      pauseForInteraction();
    }

    function pointerUp(event: PointerEvent) {
      if (pointer?.id === event.pointerId) {
        releasePointer();
      }
    }

    function scroll() {
      if (performance.now() - lastWrite > 100) {
        resumeAt = performance.now() + 1200;
        moving = false;
      }
    }

    function click(event: MouseEvent) {
      if (
        event.detail > 0 &&
        performance.now() < suppressClickUntil
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    function focusIn(event: FocusEvent) {
      keyboardFocus = Boolean(
        (event.target as HTMLElement)?.matches(":focus-visible"),
      );

      moving = false;
    }

    function focusOut(event: FocusEvent) {
      if (
        !viewport?.contains(event.relatedTarget as Node | null)
      ) {
        keyboardFocus = false;
        pauseForInteraction();
      }
    }

    function preventDrag(event: DragEvent) {
      event.preventDefault();
    }

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(group);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        previousTime = 0;
      },
    );

    intersectionObserver.observe(viewport);

    viewport.addEventListener("pointerdown", pointerDown);

    window.addEventListener("pointermove", pointerMove, {
      passive: false,
    });

    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("pointercancel", pointerUp);
    window.addEventListener("blur", releasePointer);

    viewport.addEventListener("scroll", scroll, {
      passive: true,
    });

    viewport.addEventListener("wheel", pauseForInteraction, {
      passive: true,
    });

    viewport.addEventListener("click", click, true);
    viewport.addEventListener("focusin", focusIn);
    viewport.addEventListener("focusout", focusOut);
    viewport.addEventListener("dragstart", preventDrag);

    reducedMotion.addEventListener("change", measure);

    measure();
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);

      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      viewport.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointercancel", pointerUp);
      window.removeEventListener("blur", releasePointer);

      viewport.removeEventListener("scroll", scroll);
      viewport.removeEventListener("wheel", pauseForInteraction);
      viewport.removeEventListener("click", click, true);
      viewport.removeEventListener("focusin", focusIn);
      viewport.removeEventListener("focusout", focusOut);
      viewport.removeEventListener("dragstart", preventDrag);

      reducedMotion.removeEventListener("change", measure);

      delete viewport.dataset.dragging;
    };
  }, [animated, paused, children]);

  return (
    <>
      {animated && (
        <button
          type="button"
          className="kt-fleet-gallery__accessible-control"
          onClick={() => setPaused((value) => !value)}
        >
          {french
            ? paused
              ? "Reprendre le défilement"
              : "Mettre le défilement en pause"
            : paused
              ? "Resume scrolling"
              : "Pause scrolling"}
        </button>
      )}

      <div
        ref={viewportRef}
        role="region"
        aria-label={
          french
            ? "Notre flotte de véhicules"
            : "Our vehicle fleet"
        }
        tabIndex={animated ? 0 : undefined}
        data-paused={paused || undefined}
        className="kt-fleet-gallery__viewport"
      >
        {children}
      </div>
    </>
  );
}