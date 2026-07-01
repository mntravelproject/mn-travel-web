import { createPublicClient } from "@/lib/supabase/public";

export async function getHeroImages(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.storage
    .from("imagens-inicio")
    .list("", { sortBy: { column: "name", order: "asc" } });

  if (error || !data || data.length === 0) return [];

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return data
    .filter((f) => f.name && !f.name.startsWith("."))
    .map((f) => `${base}/storage/v1/object/public/imagens-inicio/${encodeURIComponent(f.name)}`);
}
