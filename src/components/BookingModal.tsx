"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, User, Mail, Phone, Calendar, Check, ChevronLeft, MapPin, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

interface TripOption {
  id: string;
  title: string;
  trip_type: string | null;
  hero_image_url: string | null;
  country: string;
  duration_days: number;
  price_from: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  defaultTripId?: string;
}

const ease = [0.16, 1, 0.3, 1] as const;

// ── Trip Picker ──────────────────────────────────────────────────────────────
function TripPicker({
  trips,
  selectedId,
  onSelect,
  onBack,
  onCustom,
}: {
  trips: TripOption[];
  selectedId: string;
  onSelect: (t: TripOption) => void;
  onBack: () => void;
  onCustom: () => void;
}) {
  const [tab, setTab] = useState<"individual" | "grupo">("individual");
  const filtered = trips.filter((t) => t.trip_type === tab);

  return (
    <motion.div
      key="picker"
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 32 }}
      transition={{ duration: 0.28, ease }}
      className="absolute inset-0 bg-[var(--cream)] rounded-3xl flex flex-col z-10"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-[var(--line)] shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-full hover:bg-[var(--cream-2)] transition text-[var(--muted)] hover:text-[var(--ink)]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-display text-[20px] tracking-tight flex-1">Escolher viagem</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 pb-3 shrink-0">
        {(["individual", "grupo"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium tracking-tight transition ${
              tab === t
                ? "bg-[var(--ink)] text-[var(--cream)]"
                : "bg-white border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {t === "individual" ? "Individual" : "Grupo"}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-[14px] text-[var(--muted)]">
            Nenhuma viagem disponível neste momento.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((t) => {
              const selected = t.id === selectedId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelect(t)}
                  className={`text-left rounded-xl overflow-hidden border transition-all ${
                    selected
                      ? "border-[var(--ink)] ring-1 ring-[var(--ink)]"
                      : "border-[var(--line)] hover:border-[var(--ink-soft)]"
                  }`}
                  style={{ background: "var(--cream-2)" }}
                >
                  {/* Image */}
                  <div className="overflow-hidden" style={{ aspectRatio: "16/10" }}>
                    {t.hero_image_url ? (
                      <img
                        src={t.hero_image_url}
                        alt={t.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--cream-2)] flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-[var(--muted)]" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-3">
                    <div className="text-[9px] font-bold tracking-[0.15em] uppercase text-[var(--gold)] mb-1">
                      {t.country}
                    </div>
                    <div className="font-display text-[14px] leading-snug text-[var(--ink)] mb-1 line-clamp-2">
                      {t.title}
                    </div>
                    <div className="text-[11px] text-[var(--muted)]">{t.duration_days} dias</div>
                    <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-[var(--ink)]">
                        {formatPrice(t.price_from)}
                      </span>
                      {selected && (
                        <span className="w-5 h-5 rounded-full bg-[var(--ink)] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-[var(--cream)]" strokeWidth={2.5} />
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Botão viagem personalizada */}
        <button
          type="button"
          onClick={onCustom}
          className="mt-4 w-full flex items-center gap-3 px-5 py-4 rounded-xl border border-dashed border-[var(--gold)] bg-[var(--gold)]/5 hover:bg-[var(--gold)]/10 transition text-left group"
        >
          <span className="w-9 h-9 rounded-full bg-[var(--gold)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--gold)]/20 transition">
            <Sparkles className="w-4 h-4 text-[var(--gold)]" strokeWidth={1.8} />
          </span>
          <div>
            <div className="text-[13px] font-semibold text-[var(--ink)] tracking-tight">
              Pedido de viagem personalizada
            </div>
            <div className="text-[11px] text-[var(--muted)] mt-0.5">
              Não encontrou o que procura? Desenhamos de raiz.
            </div>
          </div>
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Modal ───────────────────────────────────────────────────────────────
export function BookingModal({ open, onClose, defaultTripId }: Props) {
  const router = useRouter();
  const [trips,       setTrips]       = useState<TripOption[]>([]);
  const [showPicker,  setShowPicker]  = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    trip_id: defaultTripId ?? "",
    pax: 2, date: "", message: "",
  });
  const [companions, setCompanions] = useState<string[]>([""]);
  const reduced = useReducedMotion();

  const selectedTrip = trips.find((t) => t.id === form.trip_id) ?? null;

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

  // Fetch published trips
  useEffect(() => {
    createClient()
      .from("travel_packages")
      .select("id, title, trip_type, hero_image_url, country, duration_days, price_from")
      .eq("is_published", true)
      .order("title")
      .then(({ data }) => { if (data) setTrips(data as TripOption[]); });
  }, []);

  // Sync defaultTripId
  useEffect(() => {
    if (!defaultTripId) return;
    setForm((f) => ({ ...f, trip_id: defaultTripId }));
  }, [defaultTripId, trips]);

  // Reset after close
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setSuccess(false);
        setError("");
        setShowPicker(false);
        setCompanions([""]);
        setForm({ name: "", email: "", phone: "", trip_id: defaultTripId ?? "", pax: 2, date: "", message: "" });
      }, 350);
      return () => clearTimeout(t);
    }
  }, [open, defaultTripId]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showPicker) setShowPicker(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, showPicker]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) { setError("O nome e o e-mail são obrigatórios."); return; }
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

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
            onClick={() => { if (showPicker) setShowPicker(false); else onClose(); }}
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
              className="relative bg-[var(--cream)] rounded-3xl shadow-2xl w-full max-w-[560px] max-h-[92vh] overflow-hidden pointer-events-auto"
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
                <div className="relative overflow-y-auto max-h-[92vh]">
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
                          E-mail <span className="text-[var(--clay)]">*</span>
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

                    {/* Viagem de interesse */}
                    <div>
                      <label className="block text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">
                        Viagem de interesse
                      </label>
                      {selectedTrip ? (
                        <div className="flex items-center gap-3 bg-white border border-[var(--ink)] rounded-xl px-4 py-3">
                          {selectedTrip.hero_image_url && (
                            <img
                              src={selectedTrip.hero_image_url}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-bold tracking-[0.14em] uppercase text-[var(--gold)]">
                              {selectedTrip.country}
                            </div>
                            <div className="text-[13px] font-medium text-[var(--ink)] truncate">
                              {selectedTrip.title}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, trip_id: "" }))}
                            className="p-1.5 rounded-full hover:bg-[var(--cream-2)] transition text-[var(--muted)] hover:text-[var(--ink)] shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowPicker(true)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-[var(--line)] rounded-xl text-[14px] text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)] transition"
                        >
                          <span>Escolher viagem (opcional)</span>
                          <span className="text-[12px]">→</span>
                        </button>
                      )}
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

                    {/* Viagem personalizada */}
                    <div className="pt-2 pb-1 border-t border-[var(--line)]">
                      <button
                        type="button"
                        onClick={() => { onClose(); router.push("/contacto"); }}
                        className="w-full flex items-center gap-3 px-5 py-4 rounded-xl border border-dashed border-[var(--gold)] bg-[var(--gold)]/5 hover:bg-[var(--gold)]/10 transition text-left group"
                      >
                        <span className="w-9 h-9 rounded-full bg-[var(--gold)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--gold)]/20 transition">
                          <Sparkles className="w-4 h-4 text-[var(--gold)]" strokeWidth={1.8} />
                        </span>
                        <div>
                          <div className="text-[13px] font-semibold text-[var(--ink)] tracking-tight">
                            Pedido de viagem personalizada
                          </div>
                          <div className="text-[11px] text-[var(--muted)] mt-0.5">
                            Desenhamos de raiz para si, sem catálogo.
                          </div>
                        </div>
                      </button>
                    </div>
                  </form>

                  {/* ── Trip Picker overlay ── */}
                  <AnimatePresence>
                    {showPicker && (
                      <TripPicker
                        trips={trips}
                        selectedId={form.trip_id}
                        onSelect={(t) => {
                          setForm((f) => ({ ...f, trip_id: t.id }));
                          setShowPicker(false);
                        }}
                        onBack={() => setShowPicker(false)}
                        onCustom={() => {
                          onClose();
                          router.push("/contacto");
                        }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
