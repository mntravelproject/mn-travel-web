import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const RATE_LIMIT = 3;
const RATE_WINDOW_MIN = 60;

const ALLOWED_TYPES = ["orcamento", "informacao", "ajuda", "outro"] as const;

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      name?: string;
      email?: string;
      phone?: string;
      type?: string;
      subject?: string;
      message?: string;
    };

    const { name, email, phone, type, subject, message } = body;

    // ── Validação ────────────────────────────────────────────────────────────

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }
    if (!message?.trim()) {
      return NextResponse.json({ error: "Mensagem é obrigatória." }, { status: 400 });
    }
    if (message.trim().length > 2000) {
      return NextResponse.json({ error: "Mensagem demasiado longa." }, { status: 400 });
    }
    const safeType = ALLOWED_TYPES.includes(type as typeof ALLOWED_TYPES[number])
      ? type
      : "informacao";

    const admin = createAdminClient();

    // ── Rate limiting por email ───────────────────────────────────────────────

    const since = new Date(Date.now() - RATE_WINDOW_MIN * 60 * 1000).toISOString();
    const { count } = await admin
      .from("contact_requests")
      .select("id", { count: "exact", head: true })
      .ilike("email", email.trim())
      .gte("created_at", since);

    if ((count ?? 0) >= RATE_LIMIT) {
      return NextResponse.json(
        { error: "Demasiados pedidos. Tente novamente mais tarde." },
        { status: 429 }
      );
    }

    // ── Inserir pedido ────────────────────────────────────────────────────────

    const { error } = await admin.from("contact_requests").insert({
      name:    name.trim(),
      email:   email.trim().toLowerCase(),
      phone:   phone?.trim()   || null,
      type:    safeType,
      subject: subject?.trim() || null,
      message: message.trim(),
      status:  "novo",
    });

    if (error) {
      console.error("[api/contact] insert:", error.message);
      return NextResponse.json({ error: "Erro ao enviar. Tente novamente." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/contact] unexpected:", e);
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
