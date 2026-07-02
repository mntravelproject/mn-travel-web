import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function getIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : "unknown").trim();
}

async function checkRateLimit(ip: string): Promise<boolean> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - WINDOW_MS).toISOString();

  const { count } = await admin
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", ip)
    .gte("attempted_at", since);

  return (count ?? 0) < MAX_ATTEMPTS;
}

async function recordAttempt(ip: string) {
  const admin = createAdminClient();
  await admin.from("login_attempts").insert({ ip_address: ip });
}

export async function POST(req: Request) {
  const ip = getIp(req);

  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiadas tentativas. Aguarde 15 minutos e tente novamente." },
      { status: 429 }
    );
  }

  const { email, password } = (await req.json()) as { email?: string; password?: string };

  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ error: "Password obrigatória." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => {
          const cookieHeader = req.headers.get("cookie") ?? "";
          return cookieHeader.split("; ").filter(Boolean).map((c) => {
            const [name, ...rest] = c.split("=");
            return { name, value: rest.join("=") };
          });
        },
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    await recordAttempt(ip);
    return NextResponse.json(
      { error: "Credenciais inválidas. Verifique o email e a password." },
      { status: 401 }
    );
  }

  return response;
}
