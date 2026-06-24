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
      id:           u.id,
      email:        u.email ?? "",
      role:         roleMap.get(u.id) ?? "staff",
      created_at:   u.created_at,
      last_sign_in: u.last_sign_in_at ?? null,
      confirmed:    !!u.email_confirmed_at,
    }));

    return NextResponse.json(users);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "Unauthorized" || msg === "Forbidden") return authError(msg);
    console.error("[admin/users GET]", e);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { email, password, role } = await req.json() as {
      email?: string; password?: string; role?: string;
    };

    // Validação de inputs
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "A password deve ter pelo menos 8 caracteres." }, { status: 400 });
    }
    const safeRole = ALLOWED_ROLES.includes(role as typeof ALLOWED_ROLES[number]) ? role : "staff";

    const admin = createAdminClient();

    const { data, error } = await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
    });

    if (error) return NextResponse.json({ error: "Não foi possível criar o utilizador." }, { status: 400 });

    await admin.from("user_profiles").insert({ id: data.user.id, role: safeRole });

    return NextResponse.json({
      id:           data.user.id,
      email:        data.user.email ?? "",
      role:         safeRole,
      created_at:   data.user.created_at,
      last_sign_in: null,
      confirmed:    true,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "Unauthorized" || msg === "Forbidden") return authError(msg);
    console.error("[admin/users POST]", e);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
