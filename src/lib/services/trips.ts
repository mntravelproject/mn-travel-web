import { createPublicClient } from "@/lib/supabase/public";
import type { TravelPackageCard, TravelPackageWithRelations } from "@/types/database";

const PACKAGE_CARD_SELECT = `
  *,
  category:categories(id, name, slug),
  pkg_categories:travel_package_categories(category:categories(id, name, slug)),
  destination:destinations(id, name, slug)
` as const;

function flattenCategories(raw: any[]): Pick<import("@/types/database").Category, "id" | "name" | "slug">[] {
  return (raw ?? []).map((pc: any) => pc.category).filter(Boolean);
}

const PACKAGE_FULL_SELECT = `
  *,
  category:categories(id, name, slug),
  destination:destinations(id, name, slug),
  images:package_images(id, image_url, alt_text, sort_order),
  itinerary:package_itinerary(id, day_label, title, description, sort_order)
` as const;

export async function getFeaturedTrips(limit = 6): Promise<TravelPackageCard[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("travel_packages")
    .select(PACKAGE_CARD_SELECT)
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`getFeaturedTrips: ${error.message}`);
  return (data ?? []).map((t: any) => ({ ...t, categories: flattenCategories(t.pkg_categories) })) as TravelPackageCard[];
}

export async function getAllTrips(filters?: {
  categorySlug?: string;
  maxPrice?: number;
  search?: string;
  sortBy?: "featured" | "price-asc" | "price-desc" | "duration";
  tipo?: "individual" | "grupo";
}): Promise<TravelPackageCard[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("travel_packages")
    .select(PACKAGE_CARD_SELECT)
    .eq("is_published", true);

  if (filters?.tipo === "individual") {
    query = (query as any).or("trip_type.eq.individual,trip_type.eq.ambos,trip_type.is.null");
  } else if (filters?.tipo === "grupo") {
    query = (query as any).or("trip_type.eq.grupo,trip_type.eq.ambos");
  }

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

  let result = (data ?? []).map((t: any) => ({
    ...t,
    categories: flattenCategories(t.pkg_categories),
  })) as TravelPackageCard[];

  if (filters?.categorySlug && filters.categorySlug !== "all") {
    result = result.filter((t) =>
      t.categories.some((c) => c.slug === filters.categorySlug)
    );
  }

  return result;
}

export async function getTripBySlug(slug: string): Promise<TravelPackageWithRelations | null> {
  const supabase = createPublicClient();
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

  return JSON.parse(JSON.stringify(trip)) as TravelPackageWithRelations;
}

export async function getTripSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("travel_packages")
    .select("slug")
    .eq("is_published", true);

  if (error) throw new Error(`getTripSlugs: ${error.message}`);
  return (data ?? []).map((r) => r.slug);
}
