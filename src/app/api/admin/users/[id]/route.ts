import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_ROLES = ["admin", "staff"] as const;

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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const caller = await requireAdmin();
    const { id } = await params;
    const body = await req.json() as { role?: string; email?: string; password?: string };

    // Validação de inputs
    if (body.role !== undefined && !ALLOWED_ROLES.includes(body.role as typeof ALLOWED_ROLES[number])) {
      return NextResponse.json({ error: "Role inválido." }, { status: 400 });
    }
    if (body.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }
    if (body.password !== undefined && body.password.length < 8) {
      return NextResponse.json({ error: "A password deve ter pelo menos 8 caracteres." }, { status: 400 });
    }
    // Impede que um admin rebaixe a sua própria role
    if (body.role && body.role !== "admin" && caller.id === id) {
      return NextResponse.json({ error: "Não podes alterar a tua própria role." }, { status: 400 });
    }

    const admin = createAdminClient();

    if (body.role !== undefined) {
      const { error } = await admin
        .from("user_profiles")
        .upsert({ id, role: body.role }, { onConflict: "id" });
      if (error) return NextResponse.json({ error: "Erro ao actualizar role." }, { status: 400 });
    }

    if (body.email !== undefined || body.password !== undefined) {
      const updates: { email?: string; password?: string } = {};
      if (body.email)    updates.email    = body.email.trim().toLowerCase();
      if (body.password) updates.password = body.password;

      const { error } = await admin.auth.admin.updateUserById(id, updates);
      if (error) return NextResponse.json({ error: "Erro ao actualizar credenciais." }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "Unauthorized" || msg === "Forbidden") return authError(msg);
    console.error("[admin/users PATCH]", e);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const caller = await requireAdmin();
    const { id } = await params;

    if (caller.id === id) {
      return NextResponse.json({ error: "Não podes apagar a tua própria conta." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(id);

    if (error) return NextResponse.json({ error: "Erro ao apagar utilizador." }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "Unauthorized" || msg === "Forbidden") return authError(msg);
    console.error("[admin/users DELETE]", e);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
