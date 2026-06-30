import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const RATE_LIMIT = 5;         // pedidos por email
const RATE_WINDOW_MIN = 60;   // janela em minutos

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      package_id?: string;
      package_date_id?: string;
      name?: string;
      email?: string;
      phone?: string;
      pax_count?: unknown;
      check_in_date?: string;
      check_out_date?: string;
      message?: string;
    };

    const { package_id, package_date_id, name, email, phone, pax_count, check_in_date, check_out_date, message } = body;

    // ── Validação ────────────────────────────────────────────────────────────

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }
    if (name.trim().length > 200) {
      return NextResponse.json({ error: "Nome demasiado longo." }, { status: 400 });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }
    const pax = Number(pax_count);
    if (!Number.isInteger(pax) || pax < 1 || pax > 50) {
      return NextResponse.json({ error: "Número de viajantes inválido (1-50)." }, { status: 400 });
    }
    if (message && message.length > 2000) {
      return NextResponse.json({ error: "Mensagem demasiado longa." }, { status: 400 });
    }

    const admin = createAdminClient();

    // ── Rate limiting por email (máx. 5 pedidos por hora) ────────────────────

    const since = new Date(Date.now() - RATE_WINDOW_MIN * 60 * 1000).toISOString();
    const { count } = await admin
      .from("booking_requests")
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

    const { error } = await admin.from("booking_requests").insert({
      package_id:      package_id      ?? null,
      package_date_id: package_date_id ?? null,
      name:            name.trim(),
      email:           email.trim().toLowerCase(),
      phone:           phone?.trim() || null,
      pax_count:       pax,
      check_in_date:   check_in_date  || null,
      check_out_date:  check_out_date || null,
      message:         message?.trim() || null,
      status:          "pending",
    });

    if (error) {
      console.error("[api/booking] insert:", error.message);
      return NextResponse.json({ error: "Erro ao processar pedido. Tente novamente." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/booking] unexpected:", e);
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
