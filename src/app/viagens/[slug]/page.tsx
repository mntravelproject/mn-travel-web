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

    // Conta em paralelo: reservas confirmadas do site + passageiros adicionados no admin
    const [{ data: bks }, { data: groups }] = await Promise.all([
      admin
        .from("booking_requests")
        .select("pax_count")
        .eq("package_id", trip.id)
        .eq("status", "confirmed"),
      admin
        .from("trip_groups")
        .select("id")
        .eq("package_id", trip.id),
    ]);

    const bookingsTaken = (bks ?? []).reduce(
      (s: number, b: { pax_count: number }) => s + b.pax_count, 0
    );

    const groupIds = (groups ?? []).map((g: { id: string }) => g.id);
    let passengersTaken = 0;
    if (groupIds.length > 0) {
      const { count } = await admin
        .from("trip_passengers")
        .select("id", { count: "exact", head: true })
        .in("trip_id", groupIds);
      passengersTaken = count ?? 0;
    }

    remainingSeats = Math.max(0, trip.available_seats - bookingsTaken - passengersTaken);
  }

  return <TripDetailClient trip={trip} remainingSeats={remainingSeats} />;
}