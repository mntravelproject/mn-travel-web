import { createPublicClient } from "@/lib/supabase/public";
import type { Testimonial } from "@/types/database";

export async function getFeaturedTestimonials(limit = 4): Promise<Testimonial[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`getFeaturedTestimonials: ${error.message}`);
  return data ?? [];
}

export async function getTestimonialsByPackage(packageId: string): Promise<Testimonial[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("package_id", packageId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getTestimonialsByPackage: ${error.message}`);
  return data ?? [];
}
