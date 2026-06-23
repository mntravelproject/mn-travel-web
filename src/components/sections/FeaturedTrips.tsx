"use client";

import Link from "next/link";
import { ArrowRight, Clock, Heart, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SlideUp, StaggerContainer, StaggerItem } from "@/components/animations";
import { formatPrice } from "@/lib/utils";
import type { TravelPackageCard } from "@/types/database";

interface Props {
  trips: TravelPackageCard[];
}

function OverlayCard({ trip, priority = false }: { trip: TravelPackageCard; priority?: boolean }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      whileHover={reduced ? {} : { y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="h-full"
    >
      <Link href={`/viagens/${trip.slug}`} className="group block h-full relative overflow-hidden rounded-[14px] bg-[var(--dark)] shadow-[0_24px_45px_rgba(43,35,25,.14)] overlay-card" style={{ minHeight: 460 }}>

        {/* Image */}
        {trip.hero_image_url && (
          <motion.img
            src={trip.hero_image_url}
            alt={trip.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
            loading={priority ? "eager" : "lazy"}
          />
        )}

        {/* Wish icon */}
        <motion.button
          whileHover={reduced ? {} : { scale: 1.12 }}
          whileTap={reduced ? {} : { scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          onClick={(e) => e.preventDefault()}
          className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur flex items-center justify-center hover:bg-black/50 transition-colors"
        >
          <Heart className="w-4 h-4 text-white/85" />
        </motion.button>

        {/* Info overlay */}
        <div className="absolute z-[2] left-0 right-0 bottom-0 p-7">
          {/* Country pill */}
          <div className="text-[13px] font-bold tracking-[0.1em] uppercase mb-2.5" style={{ color: "var(--gold2)" }}>
            {trip.country}
          </div>
          {/* Title */}
          <h3 className="font-display text-white text-[26px] leading-[1.08] tracking-tight mb-3">
            {trip.title}
          </h3>
          {/* Meta row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/60 text-[12px]">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {trip.duration_days} dias</span>
              {trip.country && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {trip.country}</span>}
            </div>
            <span className="text-[13px] font-semibold" style={{ color: "var(--gold2)" }}>
              {formatPrice(trip.price_from)}
            </span>
          </div>
          {/* Discover link */}
          <div
            className="mt-5 flex items-center gap-1.5 text-[13px] font-bold tracking-tight transition-all duration-300 group-hover:gap-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all"
            style={{ color: "var(--gold2)" }}
          >
            Descobrir <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function FeaturedTrips({ trips }: Props) {
  if (trips.length === 0) return null;

  const featured = trips.slice(0, 4);
  const reduced = false;

  return (
    <section className="max-w-[1380px] mx-auto px-8 lg:px-14 pt-36">
      {/* Header */}
      <SlideUp className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <SectionLabel>Em destaque · Primavera 2026</SectionLabel>
          <h2 className="mt-5 font-display text-[48px] md:text-[68px] leading-[1.0] tracking-tight text-balance">
            As nossas{" "}
            <span className="italic font-normal">colecções</span>
          </h2>
          {/* Gold line */}
          <div className="mt-5 w-12 h-[2px]" style={{ background: "var(--gold2)" }} />
        </div>
        <div className="text-right shrink-0">
          <p className="text-[15px] text-[var(--muted)] max-w-xs leading-relaxed mb-4">
            Cada itinerário nasce de uma conversa e termina onde a memória começa.
          </p>
          <Link
            href="/viagens"
            className="inline-flex items-center gap-2 text-[14px] font-medium tracking-tight transition-all hover:gap-4"
            style={{ color: "var(--gold)" }}
          >
            Ver todas as viagens <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </SlideUp>

      {/* Cards grid */}
      <StaggerContainer
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
        staggerDelay={0.08}
        initialDelay={0.1}
      >
        {featured.map((trip, i) => (
          <StaggerItem key={trip.id}>
            <OverlayCard trip={trip} priority={i === 0} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
