"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Minus, Plus } from "lucide-react";
import { Pill } from "@/components/ui/Pill";

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
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/55" />

      <div className="relative h-full max-w-[1320px] mx-auto px-6 lg:px-10 flex flex-col justify-end pb-28 lg:pb-36 text-white anim-in">
        <div className="max-w-3xl">
          <Pill className="!bg-white/15 !border-white/30 !text-white">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" />
            Curadoria de viagens premium · desde 2008
          </Pill>
          <h1 className="mt-6 font-display text-[64px] sm:text-[88px] lg:text-[120px] leading-[0.95] tracking-tight text-balance">
            Onde a viagem
            <br />
            <span className="italic font-light">se torna</span> arte.
          </h1>
          <p className="mt-7 max-w-xl text-[17px] text-white/85 leading-relaxed text-pretty">
            Desenhamos viagens à medida para quem entende que viajar bem é,
            antes de mais, viajar de outra forma.
          </p>
        </div>

        <div className="mt-12 lg:mt-16">
          {/* Search bar */}
          <div className="bg-[var(--cream)] rounded-[28px] p-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-[1.3fr_1fr_0.8fr_auto] gap-1 items-stretch">
              {/* Destination */}
              <div className="px-5 py-3 rounded-[22px] hover:bg-[var(--cream-2)] cursor-pointer transition">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Destino</div>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Para onde sonha ir?"
                  className="w-full mt-1 bg-transparent text-[14px] text-[var(--ink)] placeholder:text-[var(--muted-2)] focus:outline-none"
                />
              </div>
              {/* When */}
              <div className="px-5 py-3 rounded-[22px] hover:bg-[var(--cream-2)] cursor-pointer transition border-l border-[var(--line)]">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Quando</div>
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Datas flexíveis"
                  className="w-full mt-1 bg-transparent text-[14px] text-[var(--ink)] placeholder:text-[var(--muted-2)] focus:outline-none"
                />
              </div>
              {/* Travelers */}
              <div className="px-5 py-3 rounded-[22px] hover:bg-[var(--cream-2)] cursor-pointer transition border-l border-[var(--line)]">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Viajantes</div>
                <div className="flex items-center mt-1 gap-2 text-[14px] text-[var(--ink)]">
                  <button
                    onClick={() => setPax(Math.max(1, pax - 1))}
                    className="w-5 h-5 rounded-full bg-[var(--cream-2)] flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  {pax} adultos
                  <button
                    onClick={() => setPax(pax + 1)}
                    className="w-5 h-5 rounded-full bg-[var(--cream-2)] flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {/* Search button */}
              <button
                onClick={handleSearch}
                className="rounded-[22px] bg-[var(--clay)] hover:bg-[var(--clay-dark)] text-white px-7 m-1 flex items-center justify-center gap-2 text-[14px] font-medium tracking-tight transition"
              >
                <Search className="w-4 h-4" /> Procurar
              </button>
            </div>
          </div>

          {/* Quick searches */}
          <div className="mt-5 flex items-center gap-5 flex-wrap text-[12px] text-white/70 tracking-tight">
            {quickSearches.map((t) => (
              <button
                key={t}
                onClick={() => router.push(`/viagens?q=${encodeURIComponent(t)}`)}
                className="link-underline"
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