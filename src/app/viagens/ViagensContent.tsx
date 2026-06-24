"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { TripCard } from "@/components/trips/TripCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SlideUp, SlideIn, StaggerContainer, StaggerItem, FadeIn } from "@/components/animations";
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
  const [query, setQuery] = useState(searchParams.get("q") || "");
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
        (query === "" ||
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.country.toLowerCase().includes(query.toLowerCase())) &&
        t.price_from <= price
    );
    if (sort === "price-asc")  result = [...result].sort((a, b) => a.price_from - b.price_from);
    if (sort === "price-desc") result = [...result].sort((a, b) => b.price_from - a.price_from);
    if (sort === "duration")   result = [...result].sort((a, b) => a.duration_days - b.duration_days);
    return result;
  }, [query, activeCat, price, sort, trips]);

  const allCategories = [{ id: "all", name: "Todas" }, ...categories.map((c) => ({ id: c.slug, name: c.name }))];

  return (
    <div className="pt-[72px]">
      {/* Page header */}
      <section className="border-b border-[var(--line)] bg-[var(--cream)]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10 pt-10 pb-8 md:pt-16 md:pb-12">
          <SlideUp duration={0.6}>
            <SectionLabel>Catálogo · {trips.length} viagens</SectionLabel>
            {tipo ? (
              <>
                <h1 className="mt-5 font-display text-[32px] sm:text-[48px] md:text-[64px] lg:text-[80px] leading-[0.98] tracking-tight text-balance max-w-4xl">
                  {TIPO_LABELS[tipo].title}
                </h1>
                <p className="mt-7 max-w-xl text-[15px] text-[var(--muted)] leading-relaxed">
                  {TIPO_LABELS[tipo].subtitle}
                </p>
              </>
            ) : (
              <>
                <h1 className="mt-5 font-display text-[32px] sm:text-[48px] md:text-[64px] lg:text-[80px] leading-[0.98] tracking-tight text-balance max-w-4xl">
                  Cada viagem,<br />uma <span className="italic font-light">narrativa</span>.
                </h1>
                <p className="mt-7 max-w-xl text-[15px] text-[var(--muted)] leading-relaxed">
                  Explore o portfólio completo. Todas as viagens são personalizáveis e podem ser
                  desenhadas com datas e composição à sua medida.
                </p>
              </>
            )}
          </SlideUp>

          <SlideUp delay={0.1} duration={0.6} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="flex-1 flex items-center gap-3 bg-white rounded-full border border-[var(--line-2)] px-5 py-3.5">
              <Search className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Procurar destino, experiência ou país"
                className="flex-1 bg-transparent text-[14px] text-[var(--ink)] placeholder:text-[var(--muted-2)] focus:outline-none"
              />
            </div>
            <motion.button
              whileHover={{ scale: reduced ? 1 : 1.03 }}
              whileTap={{ scale: reduced ? 1 : 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-[var(--cream)] px-7 py-3 text-[14px] font-medium tracking-tight transition hover:bg-[var(--ink-soft)]"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filtros avançados
            </motion.button>
          </SlideUp>
        </div>
      </section>

      {/* Sidebar + cards */}
      <section className="max-w-[1320px] mx-auto px-6 lg:px-10 py-8 md:py-14 grid lg:grid-cols-[240px_1fr] gap-6 lg:gap-10">
        {/* Sidebar */}
        <SlideIn direction="left" delay={0.05}>
          <aside className="lg:sticky lg:top-[116px] lg:self-start space-y-8">
            <div>
              <h3 className="text-[13px] font-medium tracking-tight mb-4">Categorias</h3>
              <div className="flex flex-wrap lg:flex-col gap-2 lg:gap-0">
                {allCategories.map((c) => (
                  <motion.button
                    key={c.id}
                    onClick={() => setActiveCat(c.id)}
                    whileTap={{ scale: reduced ? 1 : 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className={`lg:py-2.5 px-3 lg:px-3 -mx-3 py-2 rounded-full lg:rounded-md text-[13.5px] tracking-tight text-left transition ${
                      activeCat === c.id
                        ? "bg-[var(--ink)] text-[var(--cream)] lg:bg-transparent lg:text-[var(--ink)] lg:font-medium"
                        : "bg-[var(--cream-2)] text-[var(--muted)] lg:bg-transparent lg:hover:text-[var(--ink)]"
                    }`}
                  >
                    {activeCat === c.id && (
                      <span className="hidden lg:inline-block w-1 h-1 rounded-full mr-2 align-middle" style={{ background: "var(--gold)" }} />
                    )}
                    {c.name}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <h3 className="text-[13px] font-medium tracking-tight mb-4">Orçamento</h3>
              <div className="space-y-3">
                <input
                  type="range"
                  min="2000"
                  max={maxPrice}
                  step="500"
                  value={price}
                  onChange={(e) => setPrice(+e.target.value)}
                  className="w-full accent-[var(--ink)]"
                />
                <div className="flex justify-between text-[12px] text-[var(--muted)] tracking-tight">
                  <span>€2 000</span>
                  <span className="text-[var(--ink)] font-medium">
                    até {formatPrice(price)}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <h3 className="text-[13px] font-medium tracking-tight mb-4">Duração</h3>
              <div className="space-y-2">
                {["1–5 dias", "6–9 dias", "10–14 dias", "+15 dias"].map((d) => (
                  <label key={d} className="flex items-center gap-2 text-[13.5px] text-[var(--muted)] cursor-pointer hover:text-[var(--ink)]">
                    <input type="checkbox" className="accent-[var(--ink)] rounded-sm" /> {d}
                  </label>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <h3 className="text-[13px] font-medium tracking-tight mb-4">Especialidades</h3>
              <div className="flex flex-wrap gap-2">
                {["Lua de mel", "Família", "Solo", "Wellness", "Cultura"].map((s) => (
                  <button
                    key={s}
                    className="px-3 py-1.5 rounded-full border border-[var(--line-2)] text-[12px] tracking-tight hover:border-[var(--ink)] transition-colors"
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
          <FadeIn delay={0.1} className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--line)]">
            <div className="text-[13px] text-[var(--muted)] tracking-tight">
              <strong className="text-[var(--ink)] font-medium">{filtered.length}</strong> viagens encontradas
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[12px] text-[var(--muted)] tracking-tight">Ordenar por</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent border border-[var(--line-2)] rounded-full px-4 py-2 text-[13px] tracking-tight focus:outline-none focus:border-[var(--ink)] cursor-pointer"
              >
                <option value="featured">Em destaque</option>
                <option value="price-asc">Preço · menor primeiro</option>
                <option value="price-desc">Preço · maior primeiro</option>
                <option value="duration">Duração</option>
              </select>
            </div>
          </FadeIn>

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="py-24 text-center"
              >
                <div className="font-display text-[28px]">Nenhuma viagem corresponde.</div>
                <p className="mt-2 text-[var(--muted)]">Tente ajustar os filtros ou conte-nos o que procura.</p>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <StaggerContainer
                  className="grid sm:grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12"
                  staggerDelay={0.08}
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

          {filtered.length > 0 && (
            <FadeIn delay={0.2} className="mt-16 flex items-center justify-center gap-2">
              <motion.button
                whileHover={{ scale: reduced ? 1 : 1.08 }}
                whileTap={{ scale: reduced ? 1 : 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-10 h-10 rounded-full border border-[var(--line-2)] flex items-center justify-center hover:border-[var(--ink)]"
              >
                <ArrowLeft className="w-4 h-4" />
              </motion.button>
              {[1, 2, 3, "...", 8].map((p, i) => (
                <button
                  key={i}
                  className={`w-10 h-10 rounded-full text-[13px] tracking-tight transition-colors ${
                    p === 1 ? "bg-[var(--ink)] text-[var(--cream)]" : "hover:bg-[var(--cream-2)]"
                  }`}
                >
                  {p}
                </button>
              ))}
              <motion.button
                whileHover={{ scale: reduced ? 1 : 1.08 }}
                whileTap={{ scale: reduced ? 1 : 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-10 h-10 rounded-full border border-[var(--line-2)] flex items-center justify-center hover:border-[var(--ink)]"
              >
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </FadeIn>
          )}
        </div>
      </section>
    </div>
  );
}
