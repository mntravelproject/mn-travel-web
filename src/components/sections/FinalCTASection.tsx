"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export function FinalCTASection() {
  const reduced = useReducedMotion();

  return (
    <section
      className="flex items-center min-h-[280px] md:min-h-[430px] py-14 px-6 sm:py-16 sm:px-10 md:py-[90px] md:px-[8vw]"
      style={{
        color: "white",
        background: `
          linear-gradient(105deg, rgba(10,18,28,.98) 0%, rgba(10,18,28,.67) 42%, rgba(10,18,28,.10) 100%),
          url('https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=2400&q=90') center/cover no-repeat
        `,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="font-display text-[26px] sm:text-[32px] md:text-[42px]"
          style={{ fontWeight: 400, lineHeight: 1.05, margin: "0 0 18px" }}
        >
          Não encontrou<br />o que procura?
        </h2>
        <p
          className="text-[15px] sm:text-[18px]"
          style={{
            lineHeight: 1.55,
            maxWidth: 460,
            margin: "0 0 28px",
            color: "rgba(255,255,255,.9)",
          }}
        >
          Criamos viagens totalmente personalizadas para concretizar os seus sonhos de viagem.
        </p>
        <Link
          href="/contacto"
          className="inline-flex items-center gap-3 transition-all hover:gap-5 text-[14px] sm:text-[16px]"
          style={{
            padding: "14px 22px",
            border: "1.5px solid var(--gold2)",
            color: "var(--gold2)",
            borderRadius: 999,
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          Atendimento personalizado <ArrowRight style={{ width: 18, height: 18 }} />
        </Link>
      </motion.div>
    </section>
  );
}
