"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { TravelPackageCard } from "@/types/database";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TripCardProps {
  trip: TravelPackageCard;
  className?: string;
}

export function TripCard({ trip, className }: TripCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      whileHover={reduced ? {} : { y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={cn("flex flex-col h-full", className)}
      style={{
        borderRadius: 12,
        overflow: "hidden",
        background: "var(--cream-2)",
        border: "1px solid var(--border)",
        boxShadow: "0 3px 14px rgba(0,0,0,.06)",
        cursor: "pointer",
      }}
    >
      <Link href={`/viagens/${trip.slug}`} className="group flex flex-col h-full">
        {/* Image */}
        <div className="overflow-hidden shrink-0" style={{ aspectRatio: "16/10" }}>
          {trip.hero_image_url && (
            <img
              src={trip.hero_image_url}
              alt={trip.title}
              className="w-full h-full object-cover transition-transform duration-[650ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]"
              loading="lazy"
            />
          )}
        </div>
        {/* Body */}
        <div className="flex flex-col flex-1" style={{ padding: "18px 20px 20px" }}>
          <div
            style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
              color: "var(--gold)", textTransform: "uppercase",
              marginBottom: 9, display: "block",
            }}
          >
            {trip.country}
          </div>
          <h3
            className="font-display line-clamp-2"
            style={{ fontSize: 20, fontWeight: 400, color: "var(--ink)", lineHeight: 1.25, marginBottom: 7 }}
          >
            {trip.title}
          </h3>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            {trip.duration_days} dias · {trip.trip_type === "grupo" ? "Grupo" : "Privado"}
          </div>
          {/* Footer */}
          <div
            className="mt-auto"
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              paddingTop: 13, marginTop: 14, borderTop: "1px solid var(--border)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10, color: "var(--muted)", textTransform: "uppercase",
                  letterSpacing: "0.1em", marginBottom: 2,
                }}
              >
                desde
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)" }}>
                {formatPrice(trip.price_from)}
              </div>
            </div>
            <div
              className="group-hover:bg-[var(--gold)] group-hover:border-[var(--gold)] group-hover:text-white transition-all duration-200"
              style={{
                width: 32, height: 32, borderRadius: "50%",
                border: "1.5px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--gold)", fontSize: 14, flexShrink: 0,
              }}
            >
              →
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
