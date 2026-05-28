"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ArrowLeft, ArrowRight } from "lucide-react";
import { TripCard } from "@/components/trips/TripCard";
import { formatPrice } from "@/lib/utils";
import type { TravelPackageCard, Category } from "@/types/database";

interface Props {
  trips: TravelPackageCard[];
  categories: Category[];
}

export function ViagensContent({ trips, categories }: Props) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeCat, setActiveCat] = useState(searchParams.get("cat") || "all");
  const [price, setPrice] = useState(15000);
  const [sort, setSort] = useState("featured");

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

  return (
    <div className="pt-[72px] bg-[var(--surface-dark)] min-h-screen">
      {/* Page header */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--clay)]/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10 pt-20 pb-14">
          <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[var(--clay-soft)]/60 mb-6">
            <span className="h-px w-8 bg-[var(--clay)]/50" />
            Catálogo · {trips.length} viagens
          </div>
          <h1 className="font-display text-[52px] md:text-[76px] leading-[0.97] tracking-tight text-balance max-w-4xl text-white">
            Cada viagem,<br />uma <span className="italic font-light text-[var(--clay-soft)]">narrativa</span>.
          </h1>
          <p className="mt-7 max-w-xl text-[15px] text-white/50 leading-relaxed">
            Explore o portfólio completo. Todas as viagens são personalizáveis e podem ser
            desenhadas com datas e composição à sua medida.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="flex-1 flex items-center gap-3 glass-dark rounded-full border border-white/[0.1] px-5 py-3.5">
              <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Procurar destino, experiência ou país"
                className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--clay)] text-white px-7 py-3 text-[14px] font-medium tracking-tight transition-colors hover:bg-[var(--clay-dark)]">
              <SlidersHorizontal className="w-4 h-4" /> Filtros
            </button>
          </div>
        </div>
      </section>

      {/* Sidebar + cards */}
      <section className="max-w-[1320px] mx-auto px-6 lg:px-10 py-14 grid lg:grid-cols-[240px_1fr] gap-10">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-[88px] lg:self-start space-y-8">
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-[var(--clay-soft)]/60 mb-5">Categorias</h3>
            <div className="flex flex-wrap lg:flex-col gap-2 lg:gap-0">
              {[{ id: "all", name: "Todas" }, ...categories.map((c) => ({ id: c.slug, name: c.name }))].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className={`lg:py-2.5 px-3 lg:px-3 -mx-3 py-2 rounded-full lg:rounded-lg text-[13px] tracking-tight text-left transition-all ${
                    activeCat === c.id
                      ? "bg-[var(--clay)] text-white lg:bg-[var(--clay)]/15 lg:text-[var(--clay-soft)] lg:font-medium"
                      : "text-white/40 hover:text-white/80"
                  }`}
                >
                  {activeCat === c.id && (
                    <span className="hidden lg:inline-block w-1.5 h-1.5 rounded-full bg-[var(--clay)] mr-2 align-middle" />
                  )}
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-[var(--clay-soft)]/60 mb-5">Orçamento</h3>
            <div className="space-y-3">
              <input
                type="range"
                min="2000"
                max={maxPrice}
                step="500"
                value={price}
                onChange={(e) => setPrice(+e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between text-[12px] text-white/30 tracking-tight">
                <span>€2 000</span>
                <span className="text-[var(--clay-soft)] font-medium">
                  até {formatPrice(price)}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-[var(--clay-soft)]/60 mb-5">Duração</h3>
            <div className="space-y-2.5">
              {["1–5 dias", "6–9 dias", "10–14 dias", "+15 dias"].map((d) => (
                <label key={d} className="flex items-center gap-2.5 text-[13px] text-white/40 cursor-pointer hover:text-white/70 transition-colors">
                  <input type="checkbox" className="rounded-sm" /> {d}
                </label>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-[var(--clay-soft)]/60 mb-5">Especialidades</h3>
            <div className="flex flex-wrap gap-2">
              {["Lua de mel", "Família", "Solo", "Wellness", "Cultura"].map((s) => (
                <button
                  key={s}
                  className="px-3 py-1.5 rounded-full border border-white/[0.1] text-[12px] text-white/50 tracking-tight hover:border-[var(--clay)] hover:text-white/80 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Cards */}
        <div>
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/[0.06]">
            <div className="text-[13px] text-white/40 tracking-tight">
              <strong className="text-white font-medium">{filtered.length}</strong> viagens encontradas
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[12px] text-white/30 tracking-tight">Ordenar</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-[var(--surface-card)] border border-white/[0.1] text-white/70 rounded-full px-4 py-2 text-[13px] tracking-tight focus:outline-none focus:border-[var(--clay)] cursor-pointer"
              >
                <option value="featured">Em destaque</option>
                <option value="price-asc">Preço · menor primeiro</option>
                <option value="price-desc">Preço · maior primeiro</option>
                <option value="duration">Duração</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <div className="font-display text-[28px] text-white">Nenhuma viagem corresponde.</div>
              <p className="mt-2 text-white/40">Tente ajustar os filtros ou conte-nos o que procura.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {filtered.map((t) => (
                <TripCard key={t.id} trip={t} />
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              <button className="w-10 h-10 rounded-full border border-white/[0.1] text-white/50 flex items-center justify-center hover:border-[var(--clay)] hover:text-white transition-all">
                <ArrowLeft className="w-4 h-4" />
              </button>
              {[1, 2, 3, "...", 8].map((p, i) => (
                <button
                  key={i}
                  className={`w-10 h-10 rounded-full text-[13px] tracking-tight transition-all ${
                    p === 1
                      ? "bg-[var(--clay)] text-white"
                      : "text-white/40 hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button className="w-10 h-10 rounded-full border border-white/[0.1] text-white/50 flex items-center justify-center hover:border-[var(--clay)] hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
