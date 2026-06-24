"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export function HeroSection() {
  const reduced = useReducedMotion();
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: "clamp(650px, 57vh, 780px)" }}
    >
      {/* Background — slow Ken Burns */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: reduced ? 1 : 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: reduced ? 0.01 : 2.2, ease: "easeOut" }}
      >
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2400&q=90"
          alt=""
          className="w-full h-full object-cover object-center absolute inset-0"
        />
      </motion.div>

      {/* Gradients */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(90deg, rgba(5,14,24,.78) 0%, rgba(5,14,24,.42) 43%, rgba(5,14,24,.08) 100%),
            linear-gradient(180deg, rgba(5,14,24,.26) 0%, rgba(5,14,24,.02) 40%)
          `,
        }}
      />

      {/* Content */}
      <div
        className="relative mt-[120px] md:mt-[140px] lg:mt-[160px] text-center"
        style={{
          zIndex: 2,
          width: "min(760px, 88vw)",
          marginLeft: "auto",
          marginRight: "auto",
          paddingBottom: 20,
        }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.6, delay: 0.2, ease }}
          className="text-[15px] font-bold tracking-[0.12em] uppercase mb-3"
          style={{ color: "var(--gold2)" }}
        >
          Viagens à sua medida
        </motion.div>

        {/* Title */}
        <motion.h1
          className="font-display text-white"
          style={{
            fontSize: "clamp(38px, 6vw, 82px)",
            lineHeight: 0.96,
            letterSpacing: "-.045em",
            margin: "0 0 14px",
          }}
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
                visible: {
                  opacity: 1,
                  y: 0,
                  clipPath: "inset(0 0 0% 0)",
                  transition: { duration: 0.8, ease },
                },
              }}
            >
              {line}
            </motion.span>
          ))}
        </motion.h1>

        {/* Gold line */}
        <motion.div
          className="gold-line mb-3 mx-auto"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: reduced ? 0.01 : 0.7, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Subtitle */}
        <motion.p
          className="text-[18px] leading-[1.5] mb-5 max-w-[500px] mx-auto"
          style={{ color: "rgba(255,255,255,.88)" }}
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.65, delay: 0.65, ease }}
        >
          Selecção exclusiva de viagens e experiências desenhadas ao detalhe para si.
        </motion.p>

        {/* Text-link */}
        <motion.a
          href="#colecoes"
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById("colecoes");
            if (!el) return;
            const headerHeight = document.querySelector("header")?.offsetHeight ?? 108;
            const top = el.getBoundingClientRect().top + window.scrollY - headerHeight;
            window.scrollTo({ top, behavior: "smooth" });
          }}
          initial={{ opacity: 0, y: reduced ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.55, delay: 0.8, ease }}
          className="inline-flex items-center gap-3 font-bold text-[16px] pb-3 border-b-2 transition-all hover:gap-5 cursor-pointer mx-auto"
          style={{ color: "var(--gold2)", borderColor: "var(--gold2)", textDecoration: "none" }}
        >
          Explorar colecções <ArrowRight className="w-4 h-4" />
        </motion.a>
      </div>
    </section>
  );
}
