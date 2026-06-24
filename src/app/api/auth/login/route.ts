import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Rate limiting em memória: max 5 tentativas por IP por 15 minutos
const MAX_ATTEMPTS = 5;
const WINDOW_MS    = 15 * 60 * 1000;

const attempts = new Map<string, { count: number; resetAt: number }>();

function getIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : "unknown").trim();
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || entry.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true; // permitido
  }
  if (entry.count >= MAX_ATTEMPTS) return false; // bloqueado
  entry.count += 1;
  return true;
}

export async function POST(req: Request) {
  const ip = getIp(req);

  if (!checkRateLimit(ip)) {
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

  // A response é criada antes do signIn para que o setAll do SSR possa
  // adicionar os cookies de sessão directamente no NextResponse
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
    // Não revelamos se o email existe ou não — mesma mensagem para tudo
    return NextResponse.json(
      { error: "Credenciais inválidas. Verifique o email e a password." },
      { status: 401 }
    );
  }

  // Sessão foi estabelecida; cookies foram adicionados ao response pelo setAll
  return response;
}
