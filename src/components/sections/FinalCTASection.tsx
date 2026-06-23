"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export function FinalCTASection() {
  const reduced = useReducedMotion();

  return (
    <section
      style={{
        minHeight: 430,
        color: "white",
        background: `
          linear-gradient(90deg, rgba(0,0,0,.86) 0%, rgba(0,0,0,.67) 38%, rgba(0,0,0,.10) 100%),
          url('https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=2400&q=90') center/cover no-repeat
        `,
        padding: "90px 8vw",
        display: "flex",
        alignItems: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="font-display"
          style={{ fontWeight: 400, fontSize: 42, lineHeight: 1.05, margin: "0 0 22px" }}
        >
          Não encontrou<br />o que procura?
        </h2>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.55,
            maxWidth: 460,
            margin: "0 0 34px",
            color: "rgba(255,255,255,.9)",
          }}
        >
          Criamos viagens totalmente personalizadas para tornar os seus sonhos realidade.
        </p>
        <Link
          href="/contacto"
          className="inline-flex items-center gap-3 transition-all hover:gap-5"
          style={{
            padding: "17px 28px",
            border: "1.5px solid var(--gold2)",
            color: "var(--gold2)",
            borderRadius: 999,
            fontWeight: 800,
            textDecoration: "none",
            fontSize: 16,
          }}
        >
          Falar com um especialista <ArrowRight style={{ width: 18, height: 18 }} />
        </Link>
      </motion.div>
    </section>
  );
}
