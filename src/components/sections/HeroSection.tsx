"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Minus, Plus, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const quickSearches = ["Lua de mel", "Maldivas", "Patagónia", "Itália", "Safari", "Filipinas"];

export function HeroSection() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [date,        setDate]        = useState("");
  const [pax,         setPax]         = useState(2);
  const reduced = useReducedMotion();
  const ease = [0.16, 1, 0.3, 1] as const;

  const handleSearch = () => {
    router.push(`/viagens${destination ? `?q=${encodeURIComponent(destination)}` : ""}`);
  };

  return (
    <section className="relative min-h-[780px] h-[100vh] overflow-hidden grain">
      {/* Background image — slow Ken Burns */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: reduced ? 1 : 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: reduced ? 0.01 : 2.2, ease: "easeOut" }}
      >
        <img
          src="https://images.unsplash.com/photo-1570213489059-0aac6626cade?auto=format&fit=crop&w=2400&q=90"
          alt=""
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      {/* Gradients — horizontal (dark left) + vertical (subtle top) */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(90deg, rgba(7,17,27,.82) 0%, rgba(7,17,27,.46) 44%, rgba(7,17,27,.10) 100%),
            linear-gradient(180deg, rgba(7,17,27,.30) 0%, rgba(7,17,27,.02) 40%)
          `,
        }}
      />

      {/* Content */}
      <div className="relative h-full max-w-[1380px] mx-auto px-8 lg:px-14 flex flex-col justify-center">
        <div style={{ width: "min(760px, 88vw)", marginTop: "80px" }}>

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.6, delay: 0.2, ease }}
            className="text-[17px] font-bold tracking-[0.12em] uppercase mb-7"
            style={{ color: "var(--gold2)" }}
          >
            Viagens à sua medida
          </motion.div>

          {/* Title */}
          <motion.h1
            className="font-display leading-[0.96] tracking-tight text-white text-balance"
            style={{ fontSize: "clamp(52px, 7vw, 96px)", marginBottom: "32px" }}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: reduced ? 0 : 0.1, delayChildren: 0.3 } },
            }}
          >
            {["Experiências", "que ficam", "para sempre."].map((line, i) => (
              <motion.span
                key={i}
                className="block"
                variants={{
                  hidden: { opacity: 0, y: reduced ? 0 : 40, clipPath: "inset(0 0 100% 0)" },
                  visible: { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", transition: { duration: 0.8, ease } },
                }}
              >
                {line}
              </motion.span>
            ))}
          </motion.h1>

          {/* Gold line */}
          <motion.div
            className="gold-line mb-8"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: reduced ? 0.01 : 0.7, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Subtitle */}
          <motion.p
            className="text-[21px] leading-[1.55] text-white/88 mb-10 max-w-[530px]"
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.65, delay: 0.65, ease }}
          >
            Selecção exclusiva de viagens e experiências desenhadas ao detalhe para si.
          </motion.p>

          {/* Text-link */}
          <motion.a
            href="/viagens"
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.55, delay: 0.8, ease }}
            className="inline-flex items-center gap-4 font-bold text-[18px] tracking-tight pb-3 border-b-2 mb-12 transition-all hover:gap-6"
            style={{ color: "var(--gold2)", borderColor: "var(--gold2)" }}
          >
            Explorar colecções <ArrowRight className="w-5 h-5" />
          </motion.a>
        </div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.7, delay: 0.9, ease }}
          className="mt-auto pb-14 lg:pb-20"
        >
          <div className="bg-[var(--cream)] rounded-[28px] p-2 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.55)]" style={{ maxWidth: 820 }}>
            <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_0.9fr_auto] gap-1 items-stretch">
              {/* Destination */}
              <div className="px-5 py-3.5 rounded-[22px] hover:bg-[var(--cream-2)] cursor-pointer transition">
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
              <div className="px-5 py-3.5 rounded-[22px] hover:bg-[var(--cream-2)] cursor-pointer transition border-l border-[var(--line)]">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Quando</div>
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Datas flexíveis"
                  className="w-full mt-1 bg-transparent text-[14px] text-[var(--ink)] placeholder:text-[var(--muted-2)] focus:outline-none"
                />
              </div>
              {/* Travelers */}
              <div className="px-5 py-3.5 rounded-[22px] hover:bg-[var(--cream-2)] cursor-pointer transition border-l border-[var(--line)]">
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
                className="rounded-[22px] m-1 px-7 flex items-center justify-center gap-2 text-[14px] font-semibold tracking-tight text-white transition-colors"
                style={{ background: "var(--gold)" }}
              >
                <Search className="w-4 h-4" /> Procurar
              </motion.button>
            </div>
          </div>

          {/* Quick searches */}
          <motion.div
            className="mt-5 flex items-center gap-5 flex-wrap text-[13px] text-white/65 tracking-tight"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: reduced ? 0 : 0.06, delayChildren: reduced ? 0 : 1.0 } },
            }}
          >
            <span className="text-white/40 text-[12px] uppercase tracking-[0.15em]">Popular:</span>
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
