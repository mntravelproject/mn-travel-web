"use client";

import Link from "next/link";
import { Waves, Building2, Mountain, Compass, TreePine, Sparkles, ArrowRight, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SlideUp } from "@/components/animations";
import type { Category } from "@/types/database";

interface Props {
  categories: Category[];
}

const ICON_BY_SLUG: Record<string, LucideIcon> = {
  mediterranean: Waves,
  cultural:      Building2,
  adventure:     Mountain,
  beach:         Compass,
  safari:        TreePine,
  wellness:      Sparkles,
  cruzeiros:     Waves,
  circuitos:     Building2,
  praias:        Compass,
  eventos:       Sparkles,
};

const FALLBACK_ICONS: LucideIcon[] = [Waves, Building2, Mountain, Compass, TreePine, Sparkles];

export function CategoriesSection({ categories }: Props) {
  if (categories.length === 0) return null;

  const reduced = false;

  return (
    <section className="mt-36 max-w-[1380px] mx-auto px-8 lg:px-14">
      <SlideUp className="mb-14">
        <SectionLabel>Por estilo de viagem</SectionLabel>
        <h2 className="mt-5 font-display text-[48px] md:text-[62px] leading-[1.0] tracking-tight text-balance">
          Encontre o seu <span className="italic font-normal">ritmo.</span>
        </h2>
      </SlideUp>

      {/* Horizontal border-separated row */}
      <div className="border-t border-[var(--line)]">
        {categories.map((c, i) => {
          const Icon = ICON_BY_SLUG[c.slug] ?? FALLBACK_ICONS[i % FALLBACK_ICONS.length];
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: reduced ? 0 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/viagens?cat=${encodeURIComponent(c.slug)}`}
                className="group flex items-center justify-between py-6 border-b border-[var(--line)] hover:pl-2 transition-all duration-500"
              >
                <div className="flex items-center gap-6">
                  {/* Gold icon */}
                  <span className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: "var(--gold-soft)" }}>
                    <Icon className="w-5 h-5" style={{ color: "var(--gold)" }} strokeWidth={1.5} />
                  </span>
                  <span className="font-display text-[24px] md:text-[30px] tracking-tight text-[var(--ink)] group-hover:text-[var(--gold)] transition-colors duration-300">
                    {c.name}
                  </span>
                </div>

                <div className="flex items-center gap-8">
                  <span className="hidden sm:block text-[13px] text-[var(--muted)] tracking-tight">
                    {c.trip_count} viagens
                  </span>
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center group-hover:border-[var(--gold)] group-hover:bg-[var(--gold)] transition-all duration-300"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-white transition-colors" />
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
