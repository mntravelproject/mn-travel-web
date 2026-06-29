"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, User, Mail, Phone, Calendar, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TripOption {
  id: string;
  title: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  defaultTripId?: string;
}

const ease = [0.16, 1, 0.3, 1] as const;

export function BookingModal({ open, onClose, defaultTripId }: Props) {
  const [trips,      setTrips]      = useState<TripOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    trip_id: defaultTripId ?? "",
    pax: 2, date: "", message: "",
  });
  const [companions, setCompanions] = useState<string[]>([""]);
  const reduced = useReducedMotion();

  // Sync companions array length with pax - 1
  useEffect(() => {
    setCompanions((prev) => {
      const needed = form.pax - 1;
      if (needed <= 0) return [];
      if (prev.length === needed) return prev;
      if (prev.length < needed) return [...prev, ...Array(needed - prev.length).fill("")];
      return prev.slice(0, needed);
    });
  }, [form.pax]);

  // Fetch published trips for dropdown
  useEffect(() => {
    createClient()
      .from("travel_packages")
      .select("id, title")
      .eq("is_published", true)
      .order("title")
      .then(({ data }) => { if (data) setTrips(data as TripOption[]); });
  }, []);

  // Sync defaultTripId into form when it changes
  useEffect(() => {
    setForm((f) => ({ ...f, trip_id: defaultTripId ?? "" }));
  }, [defaultTripId]);

  // Reset form after modal closes
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setSuccess(false);
        setError("");
        setCompanions([""]);
        setForm({ name: "", email: "", phone: "", trip_id: defaultTripId ?? "", pax: 2, date: "", message: "" });
      }, 350);
      return () => clearTimeout(t);
    }
  }, [open, defaultTripId]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) { setError("Nome e email são obrigatórios."); return; }
    setSubmitting(true);
    setError("");

    const filledCompanions = companions.map((c) => c.trim()).filter(Boolean);
    const messageParts: string[] = [];
    if (form.message?.trim()) messageParts.push(form.message.trim());
    if (filledCompanions.length > 0) {
      messageParts.push(`Acompanhantes:\n${filledCompanions.map((c, i) => `${i + 1}. ${c}`).join("\n")}`);
    }
    const fullMessage = messageParts.length > 0 ? messageParts.join("\n\n") : null;

    const res = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:          form.name,
        email:         form.email,
        phone:         form.phone   || null,
        package_id:    form.trip_id || null,
        pax_count:     form.pax,
        check_in_date: form.date    || null,
        message:       fullMessage,
      }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(json.error || "Erro ao enviar. Por favor tente novamente."); }
    else         { setSuccess(true); }
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal card */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: reduced ? 0 : 28, scale: reduced ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 12, scale: reduced ? 1 : 0.98 }}
            transition={{ duration: reduced ? 0.01 : 0.42, ease }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative bg-[var(--cream)] rounded-3xl shadow-2xl w-full max-w-[520px] max-h-[92vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Success state ── */}
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease }}
                  className="p-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5, ease }}
                    className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-7"
                  >
                    <Check className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
                  </motion.div>
                  <h2 className="font-display text-[30px] tracking-tight">Pedido enviado!</h2>
                  <p className="mt-3 text-[14px] text-[var(--muted)] leading-relaxed max-w-xs mx-auto">
                    Entraremos em contacto em breve para agendar a sua viagem.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-8 inline-flex rounded-full bg-[var(--ink)] text-[var(--cream)] px-8 py-3 text-[14px] tracking-tight hover:bg-[var(--ink-soft)] transition"
                  >
                    Fechar
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* ── Header ── */}
                  <div className="flex items-start justify-between px-8 pt-8 pb-2">
                    <div>
                      <p className="text-[10.5px] uppercase tracking-[0.2em] text-[var(--muted)] mb-2">MN Travel · Pedido de reserva</p>
                      <h2 className="font-display text-[32px] leading-[1.1] tracking-tight">
                        Iniciar<br />
                        <span className="italic font-light">a sua viagem.</span>
                      </h2>
                    </div>
                    <button
                      onClick={onClose}
                      aria-label="Fechar"
                      className="mt-1 p-2 -mr-1 rounded-full hover:bg-[var(--cream-2)] transition text-[var(--muted)] hover:text-[var(--ink)]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* ── Form ── */}
                  <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
                    {/* Nome */}
                    <div>
                      <label className="block text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">
                        Nome completo <span className="text-[var(--clay)]">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
                        <input
                          type="text" required value={form.name} onChange={set("name")}
                          placeholder="O seu nome"
                          className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--line)] rounded-xl text-[14px] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] transition"
                        />
                      </div>
                    </div>

                    {/* Email + Telefone */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">
                          Email <span className="text-[var(--clay)]">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
                          <input
                            type="email" required value={form.email} onChange={set("email")}
                            placeholder="email@exemplo.pt"
                            className="w-full pl-10 pr-3 py-3 bg-white border border-[var(--line)] rounded-xl text-[14px] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] transition"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">Telefone</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
                          <input
                            type="tel" value={form.phone} onChange={set("phone")}
                            placeholder="+351 9xx xxx xxx"
                            className="w-full pl-10 pr-3 py-3 bg-white border border-[var(--line)] rounded-xl text-[14px] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] transition"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Viagem */}
                    <div>
                      <label className="block text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">Viagem de interesse</label>
                      <div className="relative">
                        <select
                          value={form.trip_id} onChange={set("trip_id")}
                          className="w-full px-4 py-3 bg-white border border-[var(--line)] rounded-xl text-[14px] focus:outline-none focus:border-[var(--ink)] transition appearance-none pr-8"
                        >
                          <option value="">Seleccionar viagem (opcional)</option>
                          {trips.map((t) => (
                            <option key={t.id} value={t.id}>{t.title}</option>
                          ))}
                        </select>
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]">↓</span>
                      </div>
                    </div>

                    {/* Pax + Data */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">Número de pessoas</label>
                        <div className="flex items-center gap-2 bg-white border border-[var(--line)] rounded-xl px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, pax: Math.max(1, f.pax - 1) }))}
                            className="w-7 h-7 rounded-full bg-[var(--cream-2)] flex items-center justify-center hover:bg-[var(--line)] transition text-[var(--ink)] text-[16px] leading-none"
                          >−</button>
                          <span className="flex-1 text-center text-[15px] font-medium tabular-nums">{form.pax}</span>
                          <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, pax: Math.min(20, f.pax + 1) }))}
                            className="w-7 h-7 rounded-full bg-[var(--cream-2)] flex items-center justify-center hover:bg-[var(--line)] transition text-[var(--ink)] text-[16px] leading-none"
                          >+</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">Data pretendida</label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
                          <input
                            type="date" value={form.date} onChange={set("date")}
                            min={new Date().toISOString().slice(0, 10)}
                            className="w-full pl-10 pr-3 py-3 bg-white border border-[var(--line)] rounded-xl text-[14px] focus:outline-none focus:border-[var(--ink)] transition"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Acompanhantes */}
                    {companions.length > 0 && (
                      <div className="space-y-2">
                        <label className="block text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)]">
                          Acompanhante{companions.length > 1 ? "s" : ""}
                        </label>
                        {companions.map((name, i) => (
                          <input
                            key={i}
                            type="text"
                            value={name}
                            onChange={(e) => {
                              const next = [...companions];
                              next[i] = e.target.value;
                              setCompanions(next);
                            }}
                            placeholder={`Nome do acompanhante ${i + 1}`}
                            className="w-full px-4 py-3 bg-white border border-[var(--line)] rounded-xl text-[14px] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] transition"
                          />
                        ))}
                      </div>
                    )}

                    {/* Mensagem */}
                    <div>
                      <label className="block text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">Mensagem</label>
                      <textarea
                        rows={3} value={form.message} onChange={set("message")}
                        placeholder="Conte-nos um pouco sobre o que procura nesta viagem..."
                        className="w-full px-4 py-3 bg-white border border-[var(--line)] rounded-xl text-[14px] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] transition resize-none"
                      />
                    </div>

                    {error && <p className="text-[13px] text-red-600">{error}</p>}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-full bg-[var(--ink)] text-[var(--cream)] py-4 text-[14px] tracking-tight hover:bg-[var(--ink-soft)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "A enviar…" : "Enviar pedido de reserva →"}
                    </button>

                    <p className="text-[11px] text-center text-[var(--muted)] leading-relaxed">
                      Os seus dados são tratados de forma confidencial e nunca partilhados com terceiros.
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
