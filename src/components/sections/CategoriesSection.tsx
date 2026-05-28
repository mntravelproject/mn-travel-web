import Link from "next/link";
import { Waves, Building2, Mountain, Compass, TreePine, Sparkles, ArrowUpRight, type LucideIcon } from "lucide-react";
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
};

const FALLBACK_ICONS: LucideIcon[] = [Waves, Building2, Mountain, Compass, TreePine, Sparkles];

export function CategoriesSection({ categories }: Props) {
  if (categories.length === 0) return null;

  return (
    <section className="bg-[var(--surface-dark)] pt-28 pb-32">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
        <div className="mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[var(--clay-soft)]/60 mb-6">
            <span className="h-px w-8 bg-[var(--clay)]/50" />
            Por estilo de viagem
          </div>
          <h2 className="font-display text-[42px] md:text-[54px] leading-[1.02] tracking-tight text-balance text-white">
            Encontre o seu{" "}
            <span className="italic font-light text-[var(--clay-soft)]">ritmo.</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((c, i) => {
            const Icon = ICON_BY_SLUG[c.slug] ?? FALLBACK_ICONS[i % FALLBACK_ICONS.length];
            return (
              <Link
                key={c.id}
                href={`/viagens?cat=${encodeURIComponent(c.slug)}`}
                className="group text-left p-6 rounded-[20px] bg-[var(--surface-card)] hover:bg-[var(--clay)] border border-white/[0.06] hover:border-[var(--clay)] transition-all duration-400 card-lift"
              >
                <Icon
                  className="w-6 h-6 mb-10 text-[var(--clay-soft)] group-hover:text-white transition-all group-hover:scale-110"
                  strokeWidth={1.5}
                />
                <div className="font-display text-[18px] leading-tight tracking-tight text-white">
                  {c.name}
                </div>
                <div className="mt-2 text-[11px] text-white/40 group-hover:text-white/70 tracking-tight transition-colors">
                  {c.trip_count} viagens
                </div>
                <ArrowUpRight className="w-4 h-4 mt-4 text-white/20 group-hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}