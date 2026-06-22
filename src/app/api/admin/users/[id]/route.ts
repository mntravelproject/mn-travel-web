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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json() as { role?: string; email?: string; password?: string };

    const admin = createAdminClient();

    // Update role in user_profiles
    if (body.role !== undefined) {
      const { error } = await admin
        .from("user_profiles")
        .upsert({ id, role: body.role }, { onConflict: "id" });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Update email and/or password in Supabase Auth
    if (body.email !== undefined || body.password !== undefined) {
      const updates: { email?: string; password?: string } = {};
      if (body.email)    updates.email    = body.email;
      if (body.password) updates.password = body.password;

      const { error } = await admin.auth.admin.updateUserById(id, updates);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500 });
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

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500 });
  }
}
