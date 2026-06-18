import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Stateless client for public server-side data fetching (no cookies / no auth).
// Use this in service functions called from Server Components on public pages.
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
