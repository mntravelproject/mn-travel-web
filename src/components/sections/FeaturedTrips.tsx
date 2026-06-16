import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TripCard } from "@/components/trips/TripCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
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
    <section className="max-w-[1320px] mx-auto px-6 lg:px-10 pt-32">
      <div className="grid lg:grid-cols-12 gap-10 items-end mb-16">
        <div className="lg:col-span-7">
          <SectionLabel>Em destaque · primavera 2026</SectionLabel>
          <h2 className="mt-5 font-display text-[44px] md:text-[64px] leading-[1.02] tracking-tight text-balance">
            Viagens que <span className="italic font-light">marcam</span> uma vida.
          </h2>
        </div>
        <div className="lg:col-span-5 lg:text-right">
          <p className="text-[15px] text-[var(--muted)] max-w-md leading-relaxed lg:ml-auto">
            Cada itinerário é desenhado de raiz pela nossa equipa de curadores.
            Sem grupos, sem catálogos rígidos — só viagens pensadas para si.
          </p>
          <Link
            href="/viagens"
            className="mt-6 inline-flex items-center gap-2 text-[14px] tracking-tight link-underline"
          >
            Ver todas as viagens <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="grid lg:grid-cols-3 gap-x-6 gap-y-16">
        {layout.map(({ trip, large }) => (
          <TripCard key={trip.id} trip={trip} large={large} />
        ))}
      </div>
    </section>
  );
}
