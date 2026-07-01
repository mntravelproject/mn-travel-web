import { createAdminClient } from "@/lib/supabase/admin";

export async function getHeroImages(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("imagens-inicio")
    .list("", { sortBy: { column: "name", order: "asc" } });

  if (error) {
    console.error("getHeroImages list error:", error.message);
    return [];
  }
  if (!data || data.length === 0) {
    console.warn("getHeroImages: bucket vazio ou sem ficheiros");
    return [];
  }

  const files = data.filter((f) => f.name && !f.name.startsWith("."));

  return files.map((f) => {
    const { data: urlData } = supabase.storage
      .from("imagens-inicio")
      .getPublicUrl(f.name);
    return urlData.publicUrl;
  });
}
