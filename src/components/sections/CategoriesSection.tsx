import Link from "next/link";
import { Waves, Building2, Mountain, Compass, TreePine, Sparkles, type LucideIcon } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
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

  return (
    <section className="max-w-[1320px] mx-auto px-6 lg:px-10 mt-32">
      <div className="mb-14 max-w-3xl">
        <SectionLabel>Por estilo de viagem</SectionLabel>
        <h2 className="mt-5 font-display text-[44px] md:text-[56px] leading-[1.02] tracking-tight text-balance">
          Encontre o seu <span className="italic font-light">ritmo.</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((c, i) => {
          const Icon = ICON_BY_SLUG[c.slug] ?? FALLBACK_ICONS[i % FALLBACK_ICONS.length];
          return (
            <Link
              key={c.id}
              href={`/viagens?cat=${encodeURIComponent(c.slug)}`}
              className="group text-left p-6 rounded-2xl bg-[var(--cream-2)] hover:bg-[var(--ink)] hover:text-[var(--cream)] transition-all duration-500 border border-transparent hover:border-[var(--ink)]"
            >
              <Icon
                className="w-6 h-6 mb-12 transition-transform group-hover:scale-110"
                strokeWidth={1.5}
              />
              <div className="font-display text-[20px] leading-tight tracking-tight">
                {c.name}
              </div>
              <div className="mt-2 text-[12px] opacity-60 tracking-tight">
                {c.trip_count} viagens
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
