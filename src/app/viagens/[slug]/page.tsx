export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTripBySlug } from "@/lib/services/trips";
import { createAdminClient } from "@/lib/supabase/admin";
import { TripDetailClient } from "./TripDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTripBySlug(slug).catch(() => null);
  if (!trip) return { title: "Viagem não encontrada — MN Travel" };

  return {
    title: `${trip.title} — MN Travel`,
    description: trip.short_description ?? undefined,
    openGraph: {
      title: trip.title,
      description: trip.short_description ?? undefined,
      images: trip.hero_image_url ? [{ url: trip.hero_image_url }] : [],
    },
  };
}

export default async function TripDetailPage({ params }: Props) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug).catch(() => null);

  if (!trip) notFound();

  let remainingSeats: number | null = null;
  if (trip.available_seats != null) {
    const admin = createAdminClient();
    const { data: bks } = await admin
      .from("booking_requests")
      .select("pax_count")
      .eq("package_id", trip.id)
      .eq("status", "confirmed");
    const taken = (bks ?? []).reduce((s: number, b: { pax_count: number }) => s + b.pax_count, 0);
    remainingSeats = Math.max(0, trip.available_seats - taken);
  }

  return <TripDetailClient trip={trip} remainingSeats={remainingSeats} />;
}