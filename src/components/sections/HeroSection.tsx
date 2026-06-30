"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export function HeroSection() {
  const reduced = useReducedMotion();
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Background — vídeo hero */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2400&q=90"
          className="w-full h-full object-cover object-center absolute inset-0"
        >
          <source src="https://ddsupkrcfipidktfnfru.supabase.co/storage/v1/object/public/video-inicio/video-6a3d3f49c37e40f8ad584edf.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Gradients */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(105deg, rgba(10,18,28,.93) 0%, rgba(10,18,28,.56) 46%, rgba(10,18,28,.12) 100%),
            linear-gradient(180deg, rgba(10,18,28,.26) 0%, rgba(10,18,28,.02) 40%)
          `,
        }}
      />

      {/* Content */}
      <div
        className="relative z-[2] w-full max-w-[1380px] mx-auto px-5 md:px-8 lg:px-14 pt-[140px] pb-[120px]"
      >
        <div style={{ maxWidth: "min(820px, 82vw)" }}>
          {/* Eyebrow with decorative line */}
          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.6, delay: 0.2, ease }}
            className="flex items-center gap-3.5 mb-7"
            style={{ color: "var(--gold2)" }}
          >
            <span className="block w-8 h-px flex-shrink-0" style={{ background: "var(--gold2)" }} />
            <span className="text-[11px] font-bold tracking-[0.22em] uppercase">
              Curadoria de viagens premium
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="font-display text-white"
            style={{
              fontSize: "clamp(56px, 7.5vw, 104px)",
              lineHeight: 0.93,
              letterSpacing: "-.04em",
              margin: "0 0 28px",
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
            className="gold-line mb-[30px]"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: reduced ? 0.01 : 0.7, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Subtitle */}
          <motion.p
            className="text-[17.5px] leading-[1.72] mb-[44px] max-w-[480px] font-light"
            style={{ color: "rgba(255,255,255,.7)" }}
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.65, delay: 0.65, ease }}
          >
            Selecção exclusiva de viagens desenhadas ao detalhe, para quem entende que viajar bem é, antes de mais, viajar de outra forma.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex items-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.55, delay: 0.8, ease }}
          >
            <a
              href="#colecoes"
              className="inline-flex items-center gap-2.5 rounded-full text-white text-[13px] font-semibold tracking-[.05em] uppercase transition-all duration-200 hover:-translate-y-[2px]"
              style={{
                padding: "16px 32px",
                background: "var(--gold)",
                textDecoration: "none",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--gold2)")}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--gold)")}
            >
              Explorar viagens <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 text-[12.5px] font-semibold tracking-[.05em] uppercase pb-[2px] border-b transition-all"
              style={{
                color: "rgba(255,255,255,.76)",
                borderColor: "rgba(255,255,255,.3)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,.65)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.76)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,.3)";
              }}
            >
              Falar com curador →
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[2]"
        style={{ color: "rgba(255,255,255,.38)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0.01 : 0.8, delay: 1.2, ease }}
      >
        <span className="text-[10px] font-semibold tracking-[.18em] uppercase">Explorar</span>
        <div
          className="w-px h-11"
          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,.38), transparent)" }}
        />
      </motion.div>
    </section>
  );
}
