import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TripCard } from "@/components/trips/TripCard";
import type { TravelPackageCard } from "@/types/database";

interface Props {
  trips: TravelPackageCard[];
}

export function FeaturedTrips({ trips }: Props) {
  if (trips.length === 0) return null;

  const layout = trips.slice(0, 5).map((t, i) => ({
    trip: t,
    large: i === 0 || i === 4,
  }));

  return (
    <section className="bg-[var(--surface-dark)] pt-28 pb-32">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="grid lg:grid-cols-12 gap-10 items-end mb-16">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[var(--clay-soft)]/70 mb-6">
              <span className="h-px w-8 bg-[var(--clay)]/50" />
              Em destaque · primavera 2026
            </div>
            <h2 className="font-display text-[44px] md:text-[64px] leading-[1.02] tracking-tight text-balance text-white">
              Viagens que{" "}
              <span className="italic font-light text-[var(--clay-soft)]">marcam</span>{" "}
              uma vida.
            </h2>
          </div>
          <div className="lg:col-span-5 lg:text-right">
            <p className="text-[15px] text-white/50 max-w-md leading-relaxed lg:ml-auto">
              Cada itinerário é desenhado de raiz pela nossa equipa de curadores.
              Sem grupos, sem catálogos rígidos — só viagens pensadas para si.
            </p>
            <Link
              href="/viagens"
              className="mt-6 inline-flex items-center gap-2 text-[14px] tracking-tight text-[var(--clay-soft)] hover:text-white transition-colors"
            >
              Ver todas as viagens <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid lg:grid-cols-3 gap-5">
          {layout.map(({ trip, large }) => (
            <TripCard key={trip.id} trip={trip} large={large} />
          ))}
        </div>
      </div>
    </section>
  );
}