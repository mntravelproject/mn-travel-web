export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTripBySlug } from "@/lib/services/trips";
import { createPublicClient } from "@/lib/supabase/public";
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (createPublicClient() as any)
      .rpc("get_remaining_seats", { package_uuid: trip.id });
    remainingSeats = typeof data === "number" ? data : null;
  }

  return <TripDetailClient trip={trip} remainingSeats={remainingSeats} />;
}