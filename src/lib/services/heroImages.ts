import { createAdminClient } from "@/lib/supabase/admin";

export async function getHeroImages(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("imagens-inicio")
    .list("", { sortBy: { column: "name", order: "asc" } });

  if (error) {
    console.error("getHeroImages error:", error.message);
    return [];
  }
  if (!data || data.length === 0) return [];

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return data
    .filter((f) => f.name && !f.name.startsWith("."))
    .map((f) => `${base}/storage/v1/object/public/imagens-inicio/${encodeURIComponent(f.name)}`);
}
