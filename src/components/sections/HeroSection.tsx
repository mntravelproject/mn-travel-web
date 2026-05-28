"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Minus, Plus } from "lucide-react";

const quickSearches = ["Lua de mel", "Maldivas", "Patagónia", "Itália", "Safari"];

export function HeroSection() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [pax, setPax] = useState(2);

  const handleSearch = () => {
    router.push(`/viagens${destination ? `?q=${encodeURIComponent(destination)}` : ""}`);
  };

  return (
    <section className="relative h-[100vh] min-h-[720px] overflow-hidden grain">
      <img
        src="https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=2400&q=90"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--surface-dark)]/60 via-black/25 to-[var(--surface-dark)]/75" />

      <div className="relative h-full max-w-[1320px] mx-auto px-6 lg:px-10 flex flex-col justify-end pb-24 lg:pb-32 text-white anim-in">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass mb-8 text-[12px] tracking-[0.14em] uppercase text-white/80">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--clay-soft)]" />
            Curadoria de viagens premium · desde 2008
          </div>

          <h1 className="font-display text-[60px] sm:text-[84px] lg:text-[116px] leading-[0.93] tracking-tight text-balance">
            Onde a viagem
            <br />
            <span className="italic font-light text-[var(--clay-soft)]">se torna</span> arte.
          </h1>
          <p className="mt-7 max-w-xl text-[16px] text-white/70 leading-relaxed text-pretty">
            Desenhamos viagens à medida para quem entende que viajar bem é,
            antes de mais, viajar de outra forma.
          </p>
        </div>

        <div className="mt-12 lg:mt-14">
          {/* Search bar */}
          <div className="glass-dark rounded-[20px] p-2 max-w-3xl border border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-[1.3fr_1fr_0.8fr_auto] gap-px items-stretch bg-white/[0.06] rounded-[14px] overflow-hidden">
              {/* Destination */}
              <div className="px-5 py-4 hover:bg-white/[0.06] cursor-pointer transition-colors bg-transparent">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--clay-soft)]/80 mb-1.5">Destino</div>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Para onde sonha ir?"
                  className="w-full bg-transparent text-[14px] text-white placeholder:text-white/40 focus:outline-none"
                />
              </div>
              {/* When */}
              <div className="px-5 py-4 hover:bg-white/[0.06] cursor-pointer transition-colors border-l border-white/[0.08]">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--clay-soft)]/80 mb-1.5">Quando</div>
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Datas flexíveis"
                  className="w-full bg-transparent text-[14px] text-white placeholder:text-white/40 focus:outline-none"
                />
              </div>
              {/* Travelers */}
              <div className="px-5 py-4 hover:bg-white/[0.06] cursor-pointer transition-colors border-l border-white/[0.08]">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--clay-soft)]/80 mb-1.5">Viajantes</div>
                <div className="flex items-center gap-2.5 text-[14px] text-white">
                  <button
                    onClick={() => setPax(Math.max(1, pax - 1))}
                    className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  {pax} adultos
                  <button
                    onClick={() => setPax(pax + 1)}
                    className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {/* Search button */}
              <button
                onClick={handleSearch}
                className="rounded-[12px] bg-[var(--clay)] hover:bg-[var(--clay-dark)] text-white px-6 m-1.5 flex items-center justify-center gap-2 text-[14px] font-medium tracking-tight transition-colors"
              >
                <Search className="w-4 h-4" /> Procurar
              </button>
            </div>
          </div>

          {/* Quick searches */}
          <div className="mt-5 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-white/40 tracking-tight mr-1">Popular:</span>
            {quickSearches.map((t) => (
              <button
                key={t}
                onClick={() => router.push(`/viagens?q=${encodeURIComponent(t)}`)}
                className="px-3.5 py-1.5 rounded-full glass text-[12px] text-white/70 hover:text-white hover:bg-white/15 transition-all tracking-tight"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}