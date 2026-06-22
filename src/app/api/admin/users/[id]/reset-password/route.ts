import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Forbidden");
  return user;
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();

    const { id } = await params;
    const admin = createAdminClient();

    // Fetch the user's email from Auth
    const { data, error: fetchErr } = await admin.auth.admin.getUserById(id);
    if (fetchErr || !data.user.email) {
      return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });
    }

    // Generate a password recovery link (Supabase sends the email automatically)
    const { error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: data.user.email,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500 });
  }
}
