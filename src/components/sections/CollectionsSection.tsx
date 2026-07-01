"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import type { TravelPackageCard, Category } from "@/types/database";
import { formatPrice } from "@/lib/utils";

interface Props {
  trips: TravelPackageCard[];
  categories: Category[];
}

const BENEFITS = [
  { icon: "✈", label: "Acompanhamento",   sub: "Organizador dedicado do início ao fim" },
  { icon: "◎", label: "Parceiros Exclusivos", sub: "Hotéis e experiências de excelência" },
  { icon: "◇", label: "Segurança Total",   sub: "Tranquilidade em cada destino" },
  { icon: "✦", label: "Assistência 24/7",  sub: "Sempre disponível onde estiver" },
  { icon: "✧", label: "Experiências Únicas", sub: "O que não encontra em catálogos" },
];

function TCard({ trip }: { trip: TravelPackageCard }) {
  return (
    <Link
      href={`/viagens/${trip.slug}`}
      className="group block relative overflow-hidden cursor-pointer"
      style={{
        borderRadius: 12,
        aspectRatio: "3/4",
        background: "#111",
        boxShadow: "0 12px 44px rgba(0,0,0,.14)",
      }}
    >
      {/* Image */}
      {trip.hero_image_url && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[750ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.07]"
          style={{ backgroundImage: `url(${trip.hero_image_url})` }}
        />
      )}
      {/* Overlay gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,18,28,.04) 8%, rgba(10,18,28,.5) 48%, rgba(10,18,28,.88) 100%)",
        }}
      />
      {/* Category badge */}
      {trip.category?.name && (
        <div
          className="absolute z-[2]"
          style={{
            top: 16, left: 16,
            background: "rgba(10,18,28,.6)",
            backdropFilter: "blur(8px)",
            color: "var(--gold2)",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase",
            padding: "5px 11px", borderRadius: 999,
            border: "1px solid rgba(212,168,87,.22)",
          }}
        >
          {trip.category.name}
        </div>
      )}
      {/* Info overlay */}
      <div className="absolute z-[2]" style={{ bottom: 0, left: 0, right: 0, padding: "24px 20px" }}>
        <div
          style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--gold2)", marginBottom: 7,
          }}
        >
          {trip.country}
        </div>
        <h3
          className="font-display"
          style={{ fontSize: 24, fontWeight: 400, color: "#fff", lineHeight: 1.15, marginBottom: 7 }}
        >
          {trip.title}
        </h3>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.58)", marginBottom: 16 }}>
          {trip.duration_days} dias · {trip.trip_type === "grupo" ? "Grupo" : "Privado"}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: "#fff" }}>
            <span style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,.52)", marginRight: 3 }}>
              desde{" "}
            </span>
            {formatPrice(trip.price_from)}
          </div>
          <span
            className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
            style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em",
              color: "var(--gold2)", textTransform: "uppercase",
            }}
          >
            Descobrir →
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CollectionsSection({ trips, categories }: Props) {
  const [activeCat, setActiveCat] = useState<string>("all");
  const reduced = useReducedMotion();

  const allCats = [{ id: "all", slug: "all", name: "Todas" }, ...categories];

  const filteredTrips =
    activeCat === "all"
      ? trips.slice(0, 4)
      : trips.filter((t) => t.category?.slug === activeCat).slice(0, 4);

  return (
    <section
      data-scroll="colecoes"
      className="px-[6vw] pt-[88px] pb-0"
      style={{
        background: "radial-gradient(circle at top, var(--cream-2) 0, var(--cream) 64%)",
        maxWidth: 1440,
        margin: "0 auto",
        scrollMarginTop: 72,
      }}
    >
      {/* Section header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: reduced ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div
          style={{
            fontSize: 10.5, fontWeight: 700, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "var(--gold)", marginBottom: 12,
          }}
        >
          As nossas coleções
        </div>
        <h2
          className="font-display text-[clamp(36px,4vw,56px)]"
          style={{ fontWeight: 400, margin: 0, letterSpacing: "-.03em", lineHeight: 1.1 }}
        >
          Em destaque
        </h2>
        <div style={{ width: 44, height: 2, background: "var(--gold)", margin: "20px auto 40px" }} />
      </motion.div>

      {/* Category pills */}
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 44 }}
      >
        {allCats.map((cat) => {
          const isActive = cat.slug === activeCat;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setActiveCat(isActive && cat.slug !== "all" ? "all" : cat.slug)}
              style={{
                display: "inline-flex", alignItems: "center",
                padding: "9px 20px", borderRadius: 999,
                border: `1.5px solid ${isActive ? "var(--dark)" : "var(--border)"}`,
                fontSize: 12.5, fontWeight: 500, letterSpacing: "0.01em",
                color: isActive ? "#fff" : "var(--muted)",
                background: isActive ? "var(--dark)" : "transparent",
                cursor: "pointer", transition: "all .22s",
                fontFamily: "inherit",
              }}
            >
              {cat.name}
            </button>
          );
        })}
      </motion.div>

      {/* Trip grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCat}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]"
        >
          {filteredTrips.map((trip) => (
            <TCard key={trip.id} trip={trip} />
          ))}
          {filteredTrips.length === 0 && (
            <div
              className="col-span-full text-center py-16"
              style={{ color: "var(--muted)", fontSize: 16 }}
            >
              Nenhuma viagem disponível nesta categoria.
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Ver todas button */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ display: "flex", justifyContent: "center", marginTop: 52, marginBottom: 88 }}
      >
        <Link
          href="/viagens"
          className="inline-flex items-center gap-2.5 border border-[var(--gold2)] text-[var(--gold2)] rounded-full hover:bg-[var(--gold2)] hover:text-[var(--dark)] transition-all duration-200"
          style={{
            padding: "16px 30px", fontSize: 13, fontWeight: 600,
            letterSpacing: "0.05em", textTransform: "uppercase",
          }}
        >
          Ver todas as viagens →
        </Link>
      </motion.div>

      {/* Bespoke */}
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex items-center min-h-[340px]"
        style={{
          borderRadius: 16, overflow: "hidden", position: "relative",
          color: "white", marginBottom: 0,
          background: `
            linear-gradient(105deg, rgba(10,18,28,.96) 36%, rgba(10,18,28,.35) 100%),
            url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2200&q=90') center/cover no-repeat
          `,
          padding: "72px 80px",
        }}
      >
        <div style={{ maxWidth: 460 }}>
          <div
            style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: "0.22em",
              textTransform: "uppercase", color: "var(--gold2)", marginBottom: 12,
            }}
          >
            Organização exclusiva
          </div>
          <h2
            className="font-display text-[clamp(38px,4.5vw,64px)]"
            style={{ fontWeight: 400, lineHeight: 1.05, letterSpacing: "-.03em", margin: "0 0 0" }}
          >
            Itinerários<br />à sua medida
          </h2>
          <div style={{ width: 44, height: 2, background: "var(--gold)", margin: "20px 0 0" }} />
          <p
            style={{
              fontSize: 16.5, lineHeight: 1.75, color: "rgba(255,255,255,.62)",
              maxWidth: 560, margin: "16px 0 28px",
            }}
          >
            Cada viagem é única. Fale connosco e deixe-nos criar a sua experiência de raiz — porque nenhuma viagem premium se desenha por catálogo.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2.5 rounded-full text-white hover:-translate-y-[2px] transition-all duration-200"
            style={{
              padding: "16px 32px", background: "var(--gold)",
              fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gold2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gold)"; }}
          >
            Atendimento personalizado →
          </Link>
        </div>
      </motion.div>

      {/* Benefits strip */}
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        style={{
          margin: "72px -6vw 72px",
          background: "var(--cream)",
          border: "1px solid var(--border)",
          borderLeft: "none", borderRight: "none",
        }}
      >
        {BENEFITS.map((b, i) => (
          <div
            key={i}
            style={{
              padding: "52px 20px",
              display: "flex", gap: 13, alignItems: "flex-start",
              borderRight: i < BENEFITS.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <span style={{ fontSize: 17, color: "var(--gold)", flexShrink: 0, marginTop: 2 }}>
              {b.icon}
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{b.label}</div>
              <div style={{ fontSize: 12, lineHeight: 1.45, color: "var(--muted)" }}>{b.sub}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
