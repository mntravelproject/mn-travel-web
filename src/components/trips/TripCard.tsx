"use client";

import Link from "next/link";
import { Clock, MapPin, Star, Users, Heart } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { TravelPackageCard } from "@/types/database";
import { formatPrice } from "@/lib/utils";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";

interface TripCardProps {
  trip: TravelPackageCard;
  large?: boolean;
  className?: string;
}

export function TripCard({ trip, large = false, className }: TripCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      whileHover={reduced ? {} : { y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={cn(large && "col-span-2", className)}
    >
      <Link href={`/viagens/${trip.slug}`} className="group cursor-pointer block">
        {/* Image */}
        <div
          className={cn(
            "relative overflow-hidden rounded-[20px] bg-[var(--cream-2)]",
            large ? "aspect-[16/10]" : "aspect-[4/5]"
          )}
        >
          {trip.hero_image_url && (
            <motion.img
              src={trip.hero_image_url}
              alt={trip.title}
              className="w-full h-full object-cover"
              loading="lazy"
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={reduced ? {} : { scale: 1.04 }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            {trip.tag ? (
              <Pill className="!bg-white/85 !border-transparent text-[var(--ink)]">
                {trip.tag}
              </Pill>
            ) : (
              <span />
            )}
            <motion.button
              whileHover={reduced ? {} : { scale: 1.12 }}
              whileTap={reduced ? {} : { scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={(e) => e.preventDefault()}
              className="w-9 h-9 rounded-full bg-white/85 backdrop-blur flex items-center justify-center hover:bg-white"
            >
              <Heart className="w-4 h-4 text-[var(--ink)]" />
            </motion.button>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
            <div className="flex items-center gap-1.5 text-[12px] tracking-tight">
              <MapPin className="w-3.5 h-3.5" /> {trip.country}
            </div>
            {trip.rating && (
              <div className="flex items-center gap-1 text-[12px] tracking-tight">
                <Star className="w-3.5 h-3.5 fill-white" /> {trip.rating}
              </div>
            )}
          </div>
        </div>

        {/* Text */}
        <div className="pt-5 pr-2">
          <h3
            className={cn(
              "font-display tracking-tight text-balance text-[var(--ink)] group-hover:opacity-75 transition-opacity duration-300",
              large ? "text-[28px] leading-[1.1]" : "text-[20px] leading-[1.15]"
            )}
          >
            {trip.title}
          </h3>
          <div className="mt-3 flex items-center justify-between text-[13px] text-[var(--muted)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {trip.duration_days} dias
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Privado
              </span>
            </div>
            <div className="text-[var(--ink)] font-medium tracking-tight">
              desde {formatPrice(trip.price_from)}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
