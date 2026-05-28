"use client";

import Link from "next/link";
import { Clock, MapPin, Star, Heart, ArrowUpRight } from "lucide-react";
import type { TravelPackageCard } from "@/types/database";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TripCardProps {
  trip: TravelPackageCard;
  large?: boolean;
  className?: string;
}

export function TripCard({ trip, large = false, className }: TripCardProps) {
  return (
    <Link
      href={`/viagens/${trip.slug}`}
      className={cn(
        "group cursor-pointer block card-lift",
        large && "col-span-2",
        className
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[24px] img-zoom bg-[var(--surface-card)]",
          large ? "aspect-[16/9]" : "aspect-[3/4]"
        )}
      >
        {trip.hero_image_url && (
          <img
            src={trip.hero_image_url}
            alt={trip.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

        {/* Top row */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          {trip.tag ? (
            <span className="px-3 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase bg-[var(--clay)] text-white">
              {trip.tag}
            </span>
          ) : (
            <span />
          )}
          <button
            onClick={(e) => e.preventDefault()}
            className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <Heart className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
          {/* Rating + country row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-white/80 text-[12px] tracking-tight">
              <MapPin className="w-3.5 h-3.5" /> {trip.country}
            </div>
            {trip.rating && (
              <div className="flex items-center gap-1 text-[12px] tracking-tight text-white/80">
                <Star className="w-3.5 h-3.5 fill-[var(--clay-soft)] text-[var(--clay-soft)]" />
                {trip.rating}
              </div>
            )}
          </div>

          {/* Title */}
          <h3
            className={cn(
              "font-display text-white tracking-tight text-balance leading-[1.1] group-hover:text-[var(--clay-soft)] transition-colors duration-300",
              large ? "text-[26px] lg:text-[30px]" : "text-[20px] lg:text-[22px]"
            )}
          >
            {trip.title}
          </h3>

          {/* Meta row */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[12px] text-white/65 tracking-tight">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {trip.duration_days} dias
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-[11px] tracking-tight">desde</span>
              <span className="text-white font-semibold text-[14px] tracking-tight">
                {formatPrice(trip.price_from)}
              </span>
              <span className="w-7 h-7 rounded-full bg-[var(--clay)] flex items-center justify-center group-hover:bg-[var(--clay-soft)] transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5 text-white group-hover:text-[var(--ink)]" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}