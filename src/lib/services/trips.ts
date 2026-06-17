import { createClient } from "@/lib/supabase/server";
import type { TravelPackageCard, TravelPackageWithRelations } from "@/types/database";

const PACKAGE_CARD_SELECT = `
  *,
  category:categories(id, name, slug),
  destination:destinations(id, name, slug)
` as const;

const PACKAGE_FULL_SELECT = `
  *,
  category:categories(id, name, slug),
  destination:destinations(id, name, slug),
  images:package_images(id, image_url, alt_text, sort_order),
  itinerary:package_itinerary(id, day_label, title, description, sort_order)
` as const;

export async function getFeaturedTrips(limit = 6): Promise<TravelPackageCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("travel_packages")
    .select(PACKAGE_CARD_SELECT)
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`getFeaturedTrips: ${error.message}`);
  return (data ?? []) as TravelPackageCard[];
}

export async function getAllTrips(filters?: {
  categorySlug?: string;
  maxPrice?: number;
  search?: string;
  sortBy?: "featured" | "price-asc" | "price-desc" | "duration";
}): Promise<TravelPackageCard[]> {
  const supabase = await createClient();
  let query = supabase
    .from("travel_packages")
    .select(PACKAGE_CARD_SELECT)
    .eq("is_published", true);

  if (filters?.maxPrice) {
    query = query.lte("price_from", filters.maxPrice);
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,country.ilike.%${filters.search}%`
    );
  }

  switch (filters?.sortBy) {
    case "price-asc":
      query = query.order("price_from", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price_from", { ascending: false });
      break;
    case "duration":
      query = query.order("duration_days", { ascending: true });
      break;
    default:
      query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw new Error(`getAllTrips: ${error.message}`);

  let result = (data ?? []) as TravelPackageCard[];

  // Filter by category slug after join (Supabase doesn't support filtering on joined columns directly)
  if (filters?.categorySlug && filters.categorySlug !== "all") {
    result = result.filter((t) => t.category?.slug === filters.categorySlug);
  }

  return result;
}

export async function getTripBySlug(slug: string): Promise<TravelPackageWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("travel_packages")
    .select(PACKAGE_FULL_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(`getTripBySlug: ${error.message}`);
  }

  const trip = data as TravelPackageWithRelations;
  trip.images = (trip.images ?? []).sort((a, b) => a.sort_order - b.sort_order);
  trip.itinerary = (trip.itinerary ?? []).sort((a, b) => a.sort_order - b.sort_order);

  // Ensure plain JSON before crossing the Server→Client boundary on Vercel
  return JSON.parse(JSON.stringify(trip)) as TravelPackageWithRelations;
}

export async function getTripSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("travel_packages")
    .select("slug")
    .eq("is_published", true);

  if (error) throw new Error(`getTripSlugs: ${error.message}`);
  return (data ?? []).map((r) => r.slug);
}