import { createPublicClient } from "@/lib/supabase/public";
import type { TravelPackageCard, TravelPackageWithRelations, PackageDate } from "@/types/database";

const PACKAGE_CARD_SELECT = `
  *,
  category:categories!travel_packages_category_id_fkey(id, name, slug),
  destination:destinations(id, name, slug)
` as const;

const PACKAGE_FULL_SELECT = `
  *,
  category:categories!travel_packages_category_id_fkey(id, name, slug),
  destination:destinations(id, name, slug),
  images:package_images(id, image_url, alt_text, sort_order),
  itinerary:package_itinerary(id, day_label, title, description, sort_order),
  dates:package_dates(id, departure_date, return_date, available_seats, notes, sort_order)
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
  return (data ?? []) as TravelPackageCard[];
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

  let result = (data ?? []) as TravelPackageCard[];

  if (filters?.categorySlug && filters.categorySlug !== "all") {
    result = result.filter((t) => t.category?.slug === filters.categorySlug);
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
  trip.dates = (trip.dates ?? []).sort((a, b) => a.sort_order - b.sort_order || a.departure_date.localeCompare(b.departure_date));

  return JSON.parse(JSON.stringify(trip)) as TravelPackageWithRelations;
}

export async function getDateSeats(
  packageId: string,
  dates: PackageDate[]
): Promise<Record<string, number | null>> {
  if (dates.length === 0) return {};

  const supabase = createPublicClient();

  const departureDates = dates.map((d) => d.departure_date);
  const datesByDeparture: Record<string, string> = {};
  for (const d of dates) datesByDeparture[d.departure_date] = d.id;
  const dateIds = dates.map((d) => d.id);

  // 1. Todas as reservas do package (ativas) — tanto por package_date_id como por check_in_date
  const { data: bookings } = await (supabase as any)
    .from("booking_requests")
    .select("package_date_id, check_in_date, pax_count, status")
    .eq("package_id", packageId)
    .neq("status", "cancelled");

  // 2. Passageiros em trip_groups com o mesmo package_id e start_date
  const { data: groups } = await (supabase as any)
    .from("trip_groups")
    .select("id, start_date")
    .eq("package_id", packageId)
    .in("start_date", departureDates);

  const passengerCounts: Record<string, number> = {};
  if (groups && (groups as any[]).length > 0) {
    const groupIds = (groups as any[]).map((g: any) => g.id);
    const { data: passengers } = await (supabase as any)
      .from("trip_passengers")
      .select("trip_id")
      .in("trip_id", groupIds);

    for (const p of (passengers ?? []) as any[]) {
      const group = (groups as any[]).find((g: any) => g.id === p.trip_id);
      if (group) {
        const dateId = datesByDeparture[group.start_date];
        if (dateId) passengerCounts[dateId] = (passengerCounts[dateId] ?? 0) + 1;
      }
    }
  }

  // 3. Calcular lugares restantes por data
  const result: Record<string, number | null> = {};
  for (const date of dates) {
    if (date.available_seats == null) { result[date.id] = null; continue; }
    const booked = ((bookings ?? []) as any[])
      .filter((b: any) => {
        if (b.status === "cancelled") return false;
        // Corresponder por package_date_id (novo) ou por check_in_date (legado)
        if (b.package_date_id != null) return dateIds.includes(b.package_date_id) && b.package_date_id === date.id;
        return b.check_in_date === date.departure_date;
      })
      .reduce((sum: number, b: any) => sum + (b.pax_count ?? 0), 0);
    const passengers = passengerCounts[date.id] ?? 0;
    result[date.id] = Math.max(0, date.available_seats - booked - passengers);
  }
  return result;
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
