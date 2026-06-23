"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import type { TravelPackageCard, Category } from "@/types/database";

interface Props {
  trips: TravelPackageCard[];
  categories: Category[];
}

const CAT_SYMBOLS = ["✧", "✈", "♣", "✦", "☵", "★"];

const BENEFITS = [
  { icon: "✈", label: "Acompanhamento personalizado" },
  { icon: "✦", label: "Hotéis e parceiros de excelência" },
  { icon: "◈", label: "Segurança e confiança" },
  { icon: "★", label: "Assistência 24/7" },
  { icon: "✧", label: "Experiências autênticas" },
];

function OverlayTripCard({ trip }: { trip: TravelPackageCard }) {
  return (
    <Link
      href={`/viagens/${trip.slug}`}
      className="group relative block overflow-hidden min-h-[320px] sm:min-h-[380px] lg:min-h-[460px]"
      style={{
        borderRadius: 10,
        boxShadow: "0 24px 45px rgba(43,35,25,.12)",
        background: "#111",
      }}
    >
      {/* Photo */}
      {trip.hero_image_url && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]"
          style={{ backgroundImage: `url(${trip.hero_image_url})` }}
        />
      )}
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,.05) 15%, rgba(0,0,0,.72) 100%)",
          zIndex: 1,
        }}
      />
      {/* Info */}
      <div
        className="absolute text-white"
        style={{ zIndex: 2, left: 22, right: 22, bottom: 24 }}
      >
        <div
          style={{
            color: "#f1c674",
            fontSize: 13,
            letterSpacing: ".08em",
            fontWeight: 800,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          {trip.country}
        </div>
        <h3
          className="font-display text-[26px] sm:text-[30px] lg:text-[34px]"
          style={{ lineHeight: 1.05, fontWeight: 400, margin: "0 0 10px" }}
        >
          {trip.title}
        </h3>
        <p style={{ margin: "0 0 16px", fontSize: 14, lineHeight: 1.5 }}>
          {trip.duration_days} dias · {trip.country}
        </p>
        <span
          className="inline-flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ color: "var(--gold2)", fontWeight: 800 }}
        >
          Descobrir <ArrowRight style={{ width: 16, height: 16 }} />
        </span>
      </div>
    </Link>
  );
}

export function CollectionsSection({ trips, categories }: Props) {
  const [activeCat, setActiveCat] = useState<string>("all");
  const reduced = useReducedMotion();

  const visibleCats = categories.slice(0, 6);

  const filteredTrips =
    activeCat === "all"
      ? trips.slice(0, 4)
      : trips.filter((t) => t.category?.slug === activeCat).slice(0, 4);

  return (
    <section
      id="colecoes"
      className="px-4 pt-10 pb-7 sm:px-8 md:px-10 lg:px-[48px] lg:pt-[54px] lg:pb-7"
      style={{
        background: "radial-gradient(circle at top, var(--cream-2) 0, var(--cream) 64%)",
      }}
    >
      {/* Section title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: reduced ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="font-display text-[28px] sm:text-[34px] md:text-[40px] lg:text-[46px]"
          style={{ fontWeight: 400, margin: 0, letterSpacing: "-.025em" }}
        >
          Em destaque
        </h2>
        <div
          style={{ width: 54, height: 2, background: "var(--gold)", margin: "18px auto 28px" }}
        />
      </motion.div>

      {/* Category row */}
      {visibleCats.length > 0 && (
        <motion.div
          className="overflow-x-auto"
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div
            style={{
              maxWidth: 1320,
              margin: "0 auto 28px",
              display: "grid",
              gridTemplateColumns: `repeat(${visibleCats.length}, minmax(100px, 1fr))`,
              borderRadius: 14,
              overflow: "hidden",
              minWidth: visibleCats.length * 100,
            }}
          >
            {visibleCats.map((cat, i) => {
              const isActive = activeCat === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCat(isActive ? "all" : cat.slug)}
                  style={{
                    margin: 0,
                    padding: "4px 14px 10px",
                    background: "transparent",
                    outline: "none",
                    border: "none",
                    borderLeft: i === 0 ? "none" : "1px solid rgba(119,92,50,.20)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    minHeight: 96,
                    gap: 8,
                    fontWeight: 500,
                    fontSize: 13,
                    color: "var(--ink)",
                    cursor: "pointer",
                    transition: "background .2s",
                    width: "100%",
                    boxSizing: "border-box",
                  } as React.CSSProperties}
                >
                  <span
                    style={{ color: "var(--gold)", fontSize: 32, lineHeight: 1, fontWeight: 300 }}
                  >
                    {CAT_SYMBOLS[i % CAT_SYMBOLS.length]}
                  </span>
                  <span
                    style={{
                      borderBottom: isActive ? "2px solid var(--gold)" : "2px solid transparent",
                      paddingBottom: 3,
                      transition: "border-color .2s",
                    }}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Trip grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCat}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          style={{ maxWidth: 1380, margin: "0 auto" }}
        >
          {filteredTrips.map((trip) => (
            <OverlayTripCard key={trip.id} trip={trip} />
          ))}
          {filteredTrips.length === 0 && (
            <div
              className="col-span-full text-center py-16 text-[var(--muted)]"
              style={{ fontSize: 16 }}
            >
              Nenhuma viagem disponível nesta categoria.
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bespoke */}
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex items-center min-h-[220px] sm:min-h-[280px] md:min-h-[320px] p-6 sm:p-10 md:p-14 lg:p-[62px]"
        style={{
          maxWidth: 1380,
          margin: "22px auto 28px",
          borderRadius: 12,
          overflow: "hidden",
          position: "relative",
          color: "white",
          background: `
            linear-gradient(90deg, rgba(15,10,4,.76) 0%, rgba(15,10,4,.18) 56%, rgba(15,10,4,.04) 100%),
            url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2200&q=90') center/cover no-repeat
          `,
        }}
      >
        <div>
          <h2
            className="font-display text-[26px] sm:text-[34px] md:text-[42px] lg:text-[48px]"
            style={{ fontWeight: 400, lineHeight: 1.05, margin: "0 0 14px" }}
          >
            Itinerários<br />à sua medida
          </h2>
          <p
            className="text-[14px] sm:text-[16px] md:text-[18px]"
            style={{
              maxWidth: 330,
              lineHeight: 1.55,
              margin: "0 0 22px",
              color: "rgba(255,255,255,.88)",
            }}
          >
            Cada viagem é única. Fale connosco e deixe-nos criar a sua.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 transition-all hover:gap-4 text-[14px] sm:text-[16px]"
            style={{ color: "var(--gold2)", fontWeight: 800, textDecoration: "none" }}
          >
            Falar com um especialista <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </motion.div>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        style={{
          maxWidth: 1380,
          margin: "0 auto 40px",
          background: "rgba(255,250,242,.55)",
          borderRadius: 12,
        }}
      >
        {BENEFITS.map((b, i) => (
          <div
            key={i}
            className={`flex gap-3 items-center p-4 sm:p-5 lg:py-[30px] lg:px-[26px] border-b last:border-b-0 ${i !== 0 ? "lg:border-l lg:border-b-0" : ""} border-[rgba(119,92,50,.18)]`}
          >
            <span
              style={{ fontSize: 34, color: "var(--gold)", lineHeight: 1, flexShrink: 0 }}
            >
              {b.icon}
            </span>
            <span className="text-[13px] sm:text-[14px] font-medium leading-snug">{b.label}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
