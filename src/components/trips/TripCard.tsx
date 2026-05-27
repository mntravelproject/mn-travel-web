"use client";

import Link from "next/link";
import { Clock, MapPin, Star, Users, Heart } from "lucide-react";
import { Trip } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";

interface TripCardProps {
  trip: Trip;
  large?: boolean;
  className?: string;
}

export function TripCard({ trip, large = false, className }: TripCardProps) {
  return (
    <Link
      href={`/viagens/${trip.slug}`}
      className={cn("group cursor-pointer block", large && "col-span-2", className)}
    >
      {/* Image */}
      <div
        className={cn(
          "relative overflow-hidden rounded-[20px] img-zoom bg-[var(--cream-2)]",
          large ? "aspect-[16/10]" : "aspect-[4/5]"
        )}
      >
        <img
          src={trip.hero}
          alt={trip.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <Pill className="!bg-white/85 !border-transparent text-[var(--ink)]">
            {trip.tag}
          </Pill>
          <button
            onClick={(e) => e.preventDefault()}
            className="w-9 h-9 rounded-full bg-white/85 backdrop-blur flex items-center justify-center hover:bg-white"
          >
            <Heart className="w-4 h-4 text-[var(--ink)]" />
          </button>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
          <div className="flex items-center gap-1.5 text-[12px] tracking-tight">
            <MapPin className="w-3.5 h-3.5" /> {trip.country}
          </div>
          <div className="flex items-center gap-1 text-[12px] tracking-tight">
            <Star className="w-3.5 h-3.5 fill-white" /> {trip.rating}
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="pt-5 pr-2">
        <h3
          className={cn(
            "font-display tracking-tight text-balance text-[var(--ink)] group-hover:opacity-80 transition-opacity",
            large ? "text-[28px] leading-[1.1]" : "text-[20px] leading-[1.15]"
          )}
        >
          {trip.title}
        </h3>
        <div className="mt-3 flex items-center justify-between text-[13px] text-[var(--muted)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {trip.duration} dias
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Privado
            </span>
          </div>
          <div className="text-[var(--ink)] font-medium tracking-tight">
            desde {formatPrice(trip.price)}
          </div>
        </div>
      </div>
    </Link>
  );
}