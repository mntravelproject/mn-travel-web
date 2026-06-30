"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { TripCard } from "@/components/trips/TripCard";
import { SlideIn, StaggerContainer, StaggerItem, FadeIn } from "@/components/animations";
import { formatPrice } from "@/lib/utils";
import type { TravelPackageCard, Category } from "@/types/database";

interface Props {
  trips: TravelPackageCard[];
  categories: Category[];
  tipo?: "individual" | "grupo" | null;
}

const TIPO_LABELS: Record<string, { title: string; subtitle: string }> = {
  individual: { title: "Viagens Individuais", subtitle: "Experiências personalizadas para si, a par ou em família." },
  grupo:      { title: "Viagens de Grupo",    subtitle: "Partilhe momentos únicos com outros viajantes." },
};

export function ViagensContent({ trips, categories, tipo }: Props) {
  const searchParams = useSearchParams();
  const [activeCat, setActiveCat] = useState(searchParams.get("cat") || "all");
  const [price, setPrice] = useState(15000);
  const [sort, setSort] = useState("featured");
  const reduced = useReducedMotion();

  const maxPrice = useMemo(
    () => Math.max(15000, ...trips.map((t) => t.price_from)),
    [trips]
  );

  const filtered = useMemo(() => {
    let result = trips.filter(
      (t) =>
        (activeCat === "all" || t.category?.slug === activeCat) &&
        t.price_from <= price
    );
    if (sort === "price-asc")  result = [...result].sort((a, b) => a.price_from - b.price_from);
    if (sort === "price-desc") result = [...result].sort((a, b) => b.price_from - a.price_from);
    if (sort === "duration")   result = [...result].sort((a, b) => a.duration_days - b.duration_days);
    return result;
  }, [activeCat, price, sort, trips]);

  const allCategories = [{ id: "all", name: "Todas", slug: "all" }, ...categories.map((c) => ({ id: c.slug, name: c.name, slug: c.slug }))];

  return (
    <div>
      {/* Dark hero header */}
      <div
        style={{
          minHeight: "45vh",
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
          background: "var(--dark)",
          padding: "clamp(110px,15vw,150px) 6vw 56px",
        }}
      >
        {/* Background image */}
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundSize: "cover", backgroundPosition: "center",
            backgroundImage: "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2400&q=90')",
            opacity: 0.18,
          }}
        />
        {/* Overlay */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(14,25,38,.95) 0%, rgba(14,25,38,.8) 100%)",
          }}
        />
        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, color: "#fff", maxWidth: 680 }}>
          <div
            style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: "0.22em",
              textTransform: "uppercase", color: "var(--gold2)", marginBottom: 12,
            }}
          >
            Portfólio completo
          </div>
          {tipo ? (
            <>
              <h1
                className="font-display"
                style={{
                  fontSize: "clamp(44px, 5.5vw, 78px)", fontWeight: 400,
                  lineHeight: 0.93, letterSpacing: "-.04em", margin: "0 0 16px",
                }}
              >
                {TIPO_LABELS[tipo].title}
              </h1>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,.65)", lineHeight: 1.72, maxWidth: 520, marginTop: 16, fontWeight: 300 }}>
                {TIPO_LABELS[tipo].subtitle}
              </p>
            </>
          ) : (
            <>
              <h1
                className="font-display"
                style={{
                  fontSize: "clamp(44px, 5.5vw, 78px)", fontWeight: 400,
                  lineHeight: 0.93, letterSpacing: "-.04em", margin: "0 0 0",
                }}
              >
                Cada viagem,<br /><em>uma narrativa.</em>
              </h1>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,.65)", lineHeight: 1.72, maxWidth: 520, marginTop: 16, fontWeight: 300 }}>
                Explore o portfólio completo. Todas as viagens são personalizáveis e podem ser desenhadas com datas e composição à sua medida.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Sidebar + cards */}
      <section className="max-w-[1440px] mx-auto px-[6vw] pt-[52px] pb-[88px] grid grid-cols-1 lg:grid-cols-[262px_1fr] gap-[52px] items-start">
        {/* Sidebar */}
        <SlideIn direction="left" delay={0.05}>
          <aside
            className="lg:sticky lg:top-24"
            style={{
              maxHeight: "calc(100vh - 112px)", overflowY: "auto",
              scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent",
            }}
          >
            {/* Filtros header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink)" }}>
                Filtros
              </span>
              <button
                onClick={() => { setActiveCat("all"); setPrice(maxPrice); setSort("featured"); }}
                style={{
                  fontSize: 11.5, color: "var(--gold)", fontWeight: 600,
                  cursor: "pointer", letterSpacing: "0.04em", background: "none",
                  border: "none", padding: 0, fontFamily: "inherit",
                }}
              >
                Limpar tudo
              </button>
            </div>

            {/* Categorias */}
            <div style={{ padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
                Categoria
              </div>
              {allCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.slug)}
                  style={{
                    width: "100%", textAlign: "left", padding: "7px 0",
                    fontSize: 13.5, fontWeight: activeCat === c.slug ? 600 : 400,
                    color: activeCat === c.slug ? "var(--ink)" : "var(--muted)",
                    background: "none", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "color .18s", fontFamily: "inherit",
                  }}
                >
                  {c.name}
                  {activeCat === c.slug && (
                    <span style={{ color: "var(--gold)", fontSize: 8 }}>◆</span>
                  )}
                </button>
              ))}
            </div>

            {/* Orçamento */}
            <div style={{ padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
                Orçamento máximo
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>
                até {formatPrice(price)}
              </div>
              <input
                type="range"
                min="2000"
                max={maxPrice}
                step="500"
                value={price}
                onChange={(e) => setPrice(+e.target.value)}
                className="w-full accent-[var(--gold)]"
                style={{ accentColor: "var(--gold)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--muted)", marginTop: 8, fontWeight: 500 }}>
                <span>2 000 €</span><span>{formatPrice(maxPrice)}</span>
              </div>
            </div>

            {/* Duração */}
            <div style={{ padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
                Duração
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {["1–5 dias", "6–9 dias", "10–14 dias", "+15 dias"].map((d) => (
                  <button
                    key={d}
                    style={{
                      padding: "6px 13px", borderRadius: 999,
                      border: "1.5px solid var(--border)", fontSize: 12, fontWeight: 500,
                      color: "var(--muted)", background: "transparent",
                      cursor: "pointer", transition: "all .18s", fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"; (e.currentTarget as HTMLElement).style.color = "var(--ink)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Especialidades */}
            <div style={{ padding: "16px 0" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
                Especialidades
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {["Lua de mel", "Família", "Solo", "Wellness", "Cultura"].map((s) => (
                  <button
                    key={s}
                    style={{
                      padding: "6px 13px", borderRadius: 999,
                      border: "1.5px solid var(--border)", fontSize: 12, fontWeight: 500,
                      color: "var(--muted)", background: "transparent",
                      cursor: "pointer", transition: "all .18s", fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"; (e.currentTarget as HTMLElement).style.color = "var(--ink)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </SlideIn>

        {/* Cards */}
        <div>
          <FadeIn delay={0.1}>
            <div
              style={{
                display: "flex", alignItems: "baseline", justifyContent: "space-between",
                marginBottom: 28, gap: 16, flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{filtered.length}</strong> viagens encontradas
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{
                  fontFamily: "inherit", fontSize: 13, color: "var(--ink)",
                  border: "1.5px solid var(--border)", background: "var(--cream-2)",
                  padding: "8px 30px 8px 12px", borderRadius: 8,
                  cursor: "pointer", outline: "none", fontWeight: 500,
                  appearance: "none",
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238c7a65'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
                }}
              >
                <option value="featured">Em destaque</option>
                <option value="price-asc">Preço · menor primeiro</option>
                <option value="price-desc">Preço · maior primeiro</option>
                <option value="duration">Duração</option>
              </select>
            </div>
          </FadeIn>

          <AnimatePresence mode="sync">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="py-16 text-center"
              >
                <div className="font-display text-[28px]">Nenhuma viagem corresponde.</div>
                <p className="mt-2" style={{ color: "var(--muted)" }}>
                  Tente ajustar os filtros ou{" "}
                  <button
                    onClick={() => { setActiveCat("all"); setPrice(maxPrice); }}
                    style={{ color: "var(--gold)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
                  >
                    limpar filtros
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`grid-${activeCat}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <StaggerContainer
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[22px]"
                  staggerDelay={0.06}
                  initialDelay={0.05}
                  once={false}
                >
                  {filtered.map((t) => (
                    <StaggerItem key={t.id}>
                      <TripCard trip={t} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
