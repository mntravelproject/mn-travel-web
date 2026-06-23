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
      className="group relative block overflow-hidden"
      style={{
        minHeight: 460,
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
        style={{ zIndex: 2, left: 28, right: 28, bottom: 30 }}
      >
        <div
          style={{
            color: "#f1c674",
            fontSize: 15,
            letterSpacing: ".08em",
            fontWeight: 800,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          {trip.country}
        </div>
        <h3
          className="font-display"
          style={{ fontSize: 34, lineHeight: 1.05, fontWeight: 400, margin: "0 0 12px" }}
        >
          {trip.title}
        </h3>
        <p style={{ margin: "0 0 22px", fontSize: 15, lineHeight: 1.5 }}>
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
      style={{
        padding: "54px 48px 28px",
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
          className="font-display"
          style={{ fontSize: 46, fontWeight: 400, margin: 0, letterSpacing: "-.025em" }}
        >
          Em destaque
        </h2>
        <div
          style={{ width: 54, height: 2, background: "var(--gold)", margin: "22px auto 36px" }}
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
              margin: "0 auto 38px",
              display: "grid",
              gridTemplateColumns: `repeat(${visibleCats.length}, minmax(110px, 1fr))`,
              borderRadius: 18,
              overflow: "hidden",
              minWidth: visibleCats.length * 110,
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
                    padding: "4px 20px 12px",
                    background: "transparent",
                    outline: "none",
                    borderTop: "none",
                    borderRight: "none",
                    borderBottom: "none",
                    borderLeft: i === 0 ? "none" : "1px solid rgba(119,92,50,.20)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    minHeight: 112,
                    gap: 10,
                    fontWeight: 500,
                    fontSize: 15,
                    color: "var(--ink)",
                    cursor: "pointer",
                    transition: "background .2s",
                    width: "100%",
                    boxSizing: "border-box",
                  } as React.CSSProperties}
                >
                  <span
                    style={{ color: "var(--gold)", fontSize: 38, lineHeight: 1, fontWeight: 300 }}
                  >
                    {CAT_SYMBOLS[i % CAT_SYMBOLS.length]}
                  </span>
                  <span
                    style={{
                      borderBottom: isActive ? "2px solid var(--gold)" : "2px solid transparent",
                      paddingBottom: 4,
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{ maxWidth: 1380, margin: "0 auto", gap: 16 }}
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
        style={{
          maxWidth: 1380,
          margin: "26px auto 38px",
          minHeight: 320,
          borderRadius: 12,
          overflow: "hidden",
          position: "relative",
          color: "white",
          background: `
            linear-gradient(90deg, rgba(15,10,4,.76) 0%, rgba(15,10,4,.18) 56%, rgba(15,10,4,.04) 100%),
            url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2200&q=90') center/cover no-repeat
          `,
          display: "flex",
          alignItems: "center",
          padding: 62,
        }}
      >
        <div>
          <h2
            className="font-display"
            style={{ fontWeight: 400, fontSize: 48, lineHeight: 1, margin: "0 0 20px" }}
          >
            Itinerários<br />à sua medida
          </h2>
          <p
            style={{
              maxWidth: 330,
              lineHeight: 1.55,
              fontSize: 18,
              margin: "0 0 28px",
              color: "rgba(255,255,255,.88)",
            }}
          >
            Cada viagem é única. Fale connosco e deixe-nos criar a sua.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 transition-all hover:gap-4"
            style={{ color: "var(--gold2)", fontWeight: 800, fontSize: 16, textDecoration: "none" }}
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
          margin: "0 auto 50px",
          background: "rgba(255,250,242,.55)",
          borderRadius: 12,
        }}
      >
        {BENEFITS.map((b, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 18,
              alignItems: "center",
              padding: "30px 26px",
              borderLeft: i === 0 ? "none" : "1px solid rgba(119,92,50,.20)",
              fontWeight: 500,
              lineHeight: 1.35,
            }}
          >
            <span
              style={{ fontSize: 40, color: "var(--gold)", lineHeight: 1, flexShrink: 0 }}
            >
              {b.icon}
            </span>
            <span>{b.label}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
