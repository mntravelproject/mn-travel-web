import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTripBySlug, getTripSlugs } from "@/lib/services/trips";
import { TripDetailClient } from "./TripDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getTripSlugs().catch(() => []);
  return slugs.map((slug) => ({ slug }));
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

  return <TripDetailClient trip={trip} />;
}