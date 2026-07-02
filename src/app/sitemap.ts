import type { MetadataRoute } from "next";
import { getTripSlugs } from "@/lib/services/trips";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mntravel.pt";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getTripSlugs().catch(() => [] as string[]);

  const trips = slugs.map((slug) => ({
    url: `${BASE}/viagens/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: BASE,                changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/viagens`,   changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/sobre`,     changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contacto`,  changeFrequency: "monthly", priority: 0.5 },
    ...trips,
  ];
}
