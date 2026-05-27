"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Credenciais inválidas. Verifique o email e a password.");
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="font-display text-[36px] tracking-tight">MN Travel</div>
          <div className="mt-1 text-[13px] text-[var(--muted)] tracking-tight">Painel de administração</div>
        </div>

        <div className="bg-white rounded-[24px] border border-[var(--line)] p-8 shadow-sm">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--cream-2)] mb-6">
            <Lock className="w-4 h-4 text-[var(--ink)]" />
          </div>

          <h1 className="font-display text-[24px] tracking-tight mb-1">Entrar</h1>
          <p className="text-[13px] text-[var(--muted)] mb-8 tracking-tight">Acesso restrito a administradores.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] uppercase tracking-[0.16em] text-[var(--muted)] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@mntravel.pt"
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--cream)] px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--ink)] transition"
              />
            </div>

            <div>
              <label className="block text-[12px] uppercase tracking-[0.16em] text-[var(--muted)] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--cream)] px-4 py-3 pr-12 text-[14px] focus:outline-none focus:border-[var(--ink)] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)] transition"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-full bg-[var(--ink)] text-[var(--cream)] py-3.5 text-[14px] font-medium tracking-tight transition hover:bg-[var(--ink-soft)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "A entrar…" : "Entrar"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[12px] text-[var(--muted)] tracking-tight">
          Acesso exclusivo a membros da equipa MN Travel.
        </p>
      </div>
    </div>
  );
}