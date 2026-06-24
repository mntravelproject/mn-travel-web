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

function authError(msg: string) {
  return NextResponse.json(
    { error: msg },
    { status: msg === "Unauthorized" ? 401 : 403 }
  );
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();

    const { id } = await params;
    const admin = createAdminClient();

    const { data, error: fetchErr } = await admin.auth.admin.getUserById(id);
    if (fetchErr || !data.user.email) {
      return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });
    }

    const { error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: data.user.email,
    });

    if (error) return NextResponse.json({ error: "Erro ao gerar link de recuperação." }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "Unauthorized" || msg === "Forbidden") return authError(msg);
    console.error("[admin/users/reset-password POST]", e);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
