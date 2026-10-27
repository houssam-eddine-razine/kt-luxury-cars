/* eslint-disable @next/next/no-img-element */

import type { CSSProperties } from "react";
import { ArrowUpRight, CarFront, Pause, Play } from "lucide-react";
import { getLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";

const galleryCss = `
.kt-fleet-gallery{position:relative;overflow:hidden;background:#F7F2E9;padding:38px 0 30px;border-bottom:1px solid #E4DACB}
.kt-fleet-gallery__header{display:flex;align-items:center;justify-content:space-between;gap:20px;max-width:1400px;margin:0 auto 8px;padding:0 24px}
.kt-fleet-gallery__heading{margin:0;color:#8D6B2B;font-size:13px;font-weight:700;line-height:1.7;letter-spacing:.16em;text-transform:uppercase}
.kt-fleet-gallery__pause-input{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.kt-fleet-gallery__toggle{display:inline-flex;flex-shrink:0;align-items:center;gap:7px;min-height:40px;padding:8px 12px;border:1px solid #D8CDBB;border-radius:999px;color:#435364;font-size:14px;font-weight:600;cursor:pointer}
.kt-fleet-gallery__toggle span{display:inline-flex;align-items:center;gap:7px}
.kt-fleet-gallery__toggle .kt-fleet-gallery__play-copy{display:none}
.kt-fleet-gallery__pause-input:checked~.kt-fleet-gallery__header .kt-fleet-gallery__pause-copy{display:none}
.kt-fleet-gallery__pause-input:checked~.kt-fleet-gallery__header .kt-fleet-gallery__play-copy{display:inline-flex}
.kt-fleet-gallery__pause-input:focus-visible~.kt-fleet-gallery__header .kt-fleet-gallery__toggle{outline:2px solid #9A762F;outline-offset:4px}
.kt-fleet-gallery__viewport{overflow:hidden;padding:22px 0 26px;mask-image:linear-gradient(to right,transparent,#000 5%,#000 95%,transparent)}
.kt-fleet-gallery__track{display:flex;width:max-content;animation:kt-fleet-glide var(--kt-fleet-duration,40s) linear infinite}
.kt-fleet-gallery__group{display:flex;flex-shrink:0;align-items:center;justify-content:space-around;gap:24px;min-width:100vw;padding:0 12px}
.kt-fleet-gallery__card{display:block;flex:0 0 clamp(240px,24vw,340px);width:clamp(240px,24vw,340px);overflow:hidden;border:1px solid #D8CDBB;border-radius:18px;background:#FFFCF7;color:#0B1726;text-decoration:none;box-shadow:0 12px 28px rgba(11,23,38,.08);animation:kt-fleet-float 6s ease-in-out infinite;transition:border-color .25s,box-shadow .25s}
.kt-fleet-gallery__card:nth-child(even){animation-delay:-3s}
.kt-fleet-gallery__card:hover{border-color:#B18A40;box-shadow:0 18px 36px rgba(11,23,38,.14)}
.kt-fleet-gallery__card:focus-visible{outline:3px solid #9A762F;outline-offset:4px}
.kt-fleet-gallery__photo{aspect-ratio:16/10;overflow:hidden;background:#EEE7DB}
.kt-fleet-gallery__photo img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .5s}
.kt-fleet-gallery__card:hover img{transform:scale(1.035)}
.kt-fleet-gallery__fallback{display:grid;height:100%;place-items:center;color:#9A762F}
.kt-fleet-gallery__caption{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px}
.kt-fleet-gallery__name{min-width:0;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--font-cormorant),Georgia,serif;font-size:24px;font-weight:600;line-height:1.2}
.kt-fleet-gallery__arrow{display:grid;flex-shrink:0;width:32px;height:32px;place-items:center;border:1px solid #D8CDBB;border-radius:50%;color:#9A762F}
.kt-fleet-gallery--single .kt-fleet-gallery__track{animation:none}
.kt-fleet-gallery--single .kt-fleet-gallery__group{justify-content:center}
.kt-fleet-gallery__pause-input:checked~.kt-fleet-gallery__viewport,.kt-fleet-gallery__viewport:focus-within{overflow-x:auto;mask-image:none;overscroll-behavior-x:contain;scrollbar-width:thin}
.kt-fleet-gallery__pause-input:checked~.kt-fleet-gallery__viewport .kt-fleet-gallery__track,.kt-fleet-gallery__viewport:focus-within .kt-fleet-gallery__track{animation:none;transform:none}
.kt-fleet-gallery__pause-input:checked~.kt-fleet-gallery__viewport .kt-fleet-gallery__card,.kt-fleet-gallery__viewport:focus-within .kt-fleet-gallery__card{animation-play-state:paused}
.kt-fleet-gallery__pause-input:checked~.kt-fleet-gallery__viewport .kt-fleet-gallery__clone,.kt-fleet-gallery__viewport:focus-within .kt-fleet-gallery__clone{display:none}
@media(hover:hover){.kt-fleet-gallery:hover .kt-fleet-gallery__track,.kt-fleet-gallery:hover .kt-fleet-gallery__card{animation-play-state:paused}}
@media(min-width:640px){.kt-fleet-gallery{padding-top:48px;padding-bottom:38px}.kt-fleet-gallery__heading{font-size:14px;letter-spacing:.2em}}
@media(prefers-reduced-motion:reduce){.kt-fleet-gallery__track,.kt-fleet-gallery__card{animation:none!important;transform:none!important}.kt-fleet-gallery__viewport{overflow-x:auto;mask-image:none}.kt-fleet-gallery__clone,.kt-fleet-gallery__toggle,.kt-fleet-gallery__pause-input{display:none}.kt-fleet-gallery__photo img{transition:none;transform:none!important}}
@keyframes kt-fleet-glide{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes kt-fleet-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
`;

export async function FleetGallery() {
  const locale = await getLocale();
  const french = locale === "fr";

  const vehicles = await prisma.vehicle.findMany({
    where: {
      visible: true,
      status: { not: "INACTIVE" },
    },
    orderBy: [
      { featured: "desc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      slug: true,
      brand: true,
      model: true,
      trim: true,
      images: {
        select: {
          url: true,
          isCover: true,
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (vehicles.length === 0) return null;

  const animated = vehicles.length > 1;
  const groups = animated ? [0, 1] : [0];

  const duration = {
    "--kt-fleet-duration":
      Math.max(32, vehicles.length * 8) + "s",
  } as CSSProperties;

  return (
    <section
      aria-labelledby="kt-fleet-gallery-heading"
      className={
        "kt-fleet-gallery" +
        (animated ? "" : " kt-fleet-gallery--single")
      }
      style={duration}
    >
      <style>{galleryCss}</style>

      {animated && (
        <input
          id="kt-fleet-gallery-paused"
          type="checkbox"
          className="kt-fleet-gallery__pause-input"
          aria-label={
            french
              ? "Mettre le défilement en pause"
              : "Pause automatic scrolling"
          }
        />
      )}

      <div className="kt-fleet-gallery__header">
        <h2
          id="kt-fleet-gallery-heading"
          className="kt-fleet-gallery__heading"
        >
          {french
            ? "Les modèles qui vous attendent à Marrakech"
            : "Your next drive in Marrakech"}
        </h2>

        {animated && (
          <label
            htmlFor="kt-fleet-gallery-paused"
            className="kt-fleet-gallery__toggle"
          >
            <span className="kt-fleet-gallery__pause-copy">
              <Pause size={15} aria-hidden="true" />
              Pause
            </span>

            <span className="kt-fleet-gallery__play-copy">
              <Play size={15} aria-hidden="true" />
              {french ? "Reprendre" : "Play"}
            </span>
          </label>
        )}
      </div>

      <div className="kt-fleet-gallery__viewport">
        <div className="kt-fleet-gallery__track">
          {groups.map((copy) => (
            <div
              key={copy}
              className={
                "kt-fleet-gallery__group" +
                (copy === 1 ? " kt-fleet-gallery__clone" : "")
              }
              aria-hidden={copy === 1 || undefined}
            >
              {vehicles.map((vehicle) => {
                const cover =
                  vehicle.images.find((image) => image.isCover) ??
                  vehicle.images[0];

                const name = [
                  vehicle.brand,
                  vehicle.model,
                  vehicle.trim,
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <Link
                    key={vehicle.id}
                    href={
                      "/vehicles/" +
                      encodeURIComponent(vehicle.slug)
                    }
                    prefetch={false}
                    tabIndex={copy === 1 ? -1 : undefined}
                    aria-label={
                      (french ? "Découvrir " : "View ") + name
                    }
                    className="kt-fleet-gallery__card"
                  >
                    <div className="kt-fleet-gallery__photo">
                      {cover ? (
                        <img
                          src={cover.url}
                          alt=""
                          width={720}
                          height={450}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="kt-fleet-gallery__fallback">
                          <CarFront size={48} aria-hidden="true" />
                        </div>
                      )}
                    </div>

                    <div className="kt-fleet-gallery__caption">
                      <h3
                        title={name}
                        className="kt-fleet-gallery__name"
                      >
                        {name}
                      </h3>

                      <span className="kt-fleet-gallery__arrow">
                        <ArrowUpRight size={17} aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}