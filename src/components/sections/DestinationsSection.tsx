import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Destination } from "@/types/database";

interface Props {
  destinations: Destination[];
}

export function DestinationsSection({ destinations }: Props) {
  if (destinations.length === 0) return null;

  return (
    <section className="bg-[var(--cream)] pt-28 pb-32">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between mb-14">
          <div>
            <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[var(--muted)] mb-5">
              <span className="h-px w-8 bg-[var(--clay)]/40" />
              Destinos populares
            </div>
            <h2 className="font-display text-[42px] md:text-[54px] leading-[1.02] tracking-tight text-balance text-[var(--ink)]">
              Onde os nossos
              <br />
              viajantes <span className="italic font-light">regressam.</span>
            </h2>
          </div>
          <Link
            href="/viagens"
            className="hidden sm:inline-flex items-center gap-2 text-[13px] tracking-tight text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            Ver tudo <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-4">
          {destinations.map((d, i) => (
            <Link
              key={d.id}
              href={`/viagens?q=${encodeURIComponent(d.name)}`}
              className={`group cursor-pointer card-lift ${i === 0 ? "col-span-2 lg:col-span-2 row-span-2" : ""}`}
            >
              <div
                className={`relative overflow-hidden rounded-[20px] img-zoom bg-[var(--surface-card)] ${
                  i === 0 ? "aspect-[4/5] lg:aspect-auto lg:h-full" : "aspect-[4/5]"
                }`}
              >
                <img
                  src={d.image_url}
                  alt={d.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className={`font-display tracking-tight leading-tight ${i === 0 ? "text-[28px]" : "text-[20px]"}`}>
                    {d.name}
                  </div>
                  <div className="mt-1 text-[11px] text-white/60 tracking-tight">{d.trip_count} viagens</div>
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}