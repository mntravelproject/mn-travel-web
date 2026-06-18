import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
