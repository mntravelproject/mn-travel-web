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

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const [{ data: authData }, { data: profiles }] = await Promise.all([
      admin.auth.admin.listUsers({ perPage: 1000 }),
      admin.from("user_profiles").select("id, role"),
    ]);

    const roleMap = new Map((profiles ?? []).map((p) => [p.id, p.role]));

    const users = (authData?.users ?? []).map((u) => ({
      id:            u.id,
      email:         u.email ?? "",
      role:          roleMap.get(u.id) ?? "staff",
      created_at:    u.created_at,
      last_sign_in:  u.last_sign_in_at ?? null,
      confirmed:     !!u.email_confirmed_at,
    }));

    return NextResponse.json(users);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { email, password, role } = await req.json() as { email: string; password: string; role: string };

    if (!email || !password) {
      return NextResponse.json({ error: "Email e password obrigatórios." }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await admin.from("user_profiles").insert({ id: data.user.id, role: role ?? "staff" });

    return NextResponse.json({
      id:           data.user.id,
      email:        data.user.email ?? "",
      role:         role ?? "staff",
      created_at:   data.user.created_at,
      last_sign_in: null,
      confirmed:    true,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500 });
  }
}
