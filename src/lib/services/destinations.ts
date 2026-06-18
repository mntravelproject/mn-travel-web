import { createPublicClient } from "@/lib/supabase/public";
import type { Destination } from "@/types/database";

export async function getFeaturedDestinations(limit = 6): Promise<Destination[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("is_featured", true)
    .order("trip_count", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`getFeaturedDestinations: ${error.message}`);
  return data ?? [];
}

export async function getAllDestinations(): Promise<Destination[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(`getAllDestinations: ${error.message}`);
  return data ?? [];
}

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`getDestinationBySlug: ${error.message}`);
  }
  return data;
}
