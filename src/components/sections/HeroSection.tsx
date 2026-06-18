"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Minus, Plus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Pill } from "@/components/ui/Pill";

const quickSearches = ["Lua de mel", "Maldivas", "Patagónia", "Itália", "Safari"];

export function HeroSection() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [pax, setPax] = useState(2);
  const reduced = useReducedMotion();

  const handleSearch = () => {
    router.push(`/viagens${destination ? `?q=${encodeURIComponent(destination)}` : ""}`);
  };

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section className="relative h-[100vh] min-h-[720px] overflow-hidden grain">
      {/* Background image with subtle zoom-in */}
      <motion.img
        src="https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=2400&q=90"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: reduced ? 1 : 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: reduced ? 0.01 : 1.8, ease: "easeOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/55" />

      <div className="relative h-full max-w-[1320px] mx-auto px-6 lg:px-10 flex flex-col justify-end pb-28 lg:pb-36 text-white">
        <div className="max-w-3xl">
          {/* Pill */}
          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.6, ease }}
          >
            <Pill className="!bg-white/15 !border-white/30 !text-white">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" />
              Curadoria de viagens premium · desde 2008
            </Pill>
          </motion.div>

          {/* Title — stagger lines */}
          <motion.h1
            className="mt-6 font-display text-[64px] sm:text-[88px] lg:text-[120px] leading-[0.95] tracking-tight text-balance"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: reduced ? 0 : 0.1, delayChildren: 0.15 },
              },
            }}
          >
            {["Onde a viagem", "se torna arte."].map((line, i) => (
              <motion.span
                key={i}
                className="block"
                variants={{
                  hidden: { opacity: 0, y: reduced ? 0 : 32 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
                }}
              >
                {i === 1 ? (
                  <>
                    <span className="italic font-light">se torna</span> arte.
                  </>
                ) : (
                  line
                )}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-7 max-w-xl text-[17px] text-white/85 leading-relaxed text-pretty"
            initial={{ opacity: 0, y: reduced ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.65, delay: reduced ? 0 : 0.45, ease }}
          >
            Desenhamos viagens à medida para quem entende que viajar bem é,
            antes de mais, viajar de outra forma.
          </motion.p>
        </div>

        {/* Search bar — slides up */}
        <motion.div
          className="mt-12 lg:mt-16"
          initial={{ opacity: 0, y: reduced ? 0 : 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.7, delay: reduced ? 0 : 0.55, ease }}
        >
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
              <motion.button
                whileHover={{ scale: reduced ? 1 : 1.03 }}
                whileTap={{ scale: reduced ? 1 : 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                onClick={handleSearch}
                className="rounded-[22px] bg-[var(--clay)] hover:bg-[var(--clay-dark)] text-white px-7 m-1 flex items-center justify-center gap-2 text-[14px] font-medium tracking-tight transition-colors"
              >
                <Search className="w-4 h-4" /> Procurar
              </motion.button>
            </div>
          </div>

          {/* Quick searches — stagger */}
          <motion.div
            className="mt-5 flex items-center gap-5 flex-wrap text-[12px] text-white/70 tracking-tight"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: reduced ? 0 : 0.06, delayChildren: reduced ? 0 : 0.7 },
              },
            }}
          >
            {quickSearches.map((t) => (
              <motion.button
                key={t}
                variants={{
                  hidden: { opacity: 0, y: reduced ? 0 : 8 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
                onClick={() => router.push(`/viagens?q=${encodeURIComponent(t)}`)}
                className="link-underline hover:text-white transition-colors"
              >
                {t}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
