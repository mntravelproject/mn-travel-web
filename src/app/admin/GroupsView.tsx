"use client";

import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { createClient } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "motion/react";
import {
  Plus, ArrowLeft, Download, Search, Edit3, Trash2,
  X, AlertTriangle, ChevronRight, ChevronDown,
  Banknote, Smartphone, CreditCard, Check, Receipt,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type TripGroup = {
  id: string; title: string; destination: string;
  start_date: string; end_date: string;
  price_per_person: number; notes: string | null;
  package_id: string | null; created_at: string; updated_at: string;
};
type Passenger = {
  id: string; trip_id: string; client_id: string | null;
  full_name: string; id_card_number: string | null; id_card_expiry: string | null;
  nif: string | null; date_of_birth: string | null; nationality: string | null;
  phone: string | null; email: string | null; notes: string | null;
  sort_order: number; created_at: string;
  room_type: string; room_id: string | null; is_main_occupant: boolean;
};
type Payment = {
  id: string; passenger_id: string; amount: number;
  payment_date: string; method: string; notes: string | null; created_at: string;
};
type Expense = {
  id: string; trip_id: string; description: string; amount: number;
  expense_date: string; category: string; notes: string | null; created_at: string;
};
type ClientOption = { id: string; name: string; email: string; phone: string | null };
type PaxFormDocs = {
  id_card_number: string; id_card_expiry: string; nif: string;
  date_of_birth: string; nationality: string; notes: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const METHODS: Record<string, string> = {
  mbway: "MB Way", transfer: "Transferência", cash: "Dinheiro", card: "Cartão", other: "Outro",
};
const ROOM_TYPES: Record<string, { label: string; capacity: number }> = {
  individual: { label: "Individual",  capacity: 1 },
  duplo:      { label: "Duplo",       capacity: 2 },
  triplo:     { label: "Triplo",      capacity: 3 },
  quadruplo:  { label: "Quádruplo",   capacity: 4 },
};
const EXPENSE_CATEGORIES: Record<string, string> = {
  voo: "Voo", hotel: "Hotel", transporte: "Transporte",
  alimentacao: "Alimentação", seguro: "Seguro", guia: "Guia", outro: "Outro",
};
const EMPTY_DOCS: PaxFormDocs = {
  id_card_number: "", id_card_expiry: "", nif: "", date_of_birth: "", nationality: "Portuguesa", notes: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}
function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-PT");
}
function payStatus(paid: number, total: number) {
  if (paid <= 0)     return { label: "Por pagar", cls: "bg-red-100 text-red-700" };
  if (paid >= total) return { label: "Pago",      cls: "bg-emerald-100 text-emerald-700" };
  return              { label: "Parcial",         cls: "bg-amber-100 text-amber-700" };
}
function ccExpired(expiry: string | null, tripEnd: string) {
  return !!expiry && expiry < tripEnd;
}

// ─── Shared CSS ───────────────────────────────────────────────────────────────
const iCls = "w-full px-3 py-2.5 bg-white border border-[var(--line)] rounded-xl text-[13px] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] transition";
const lCls = "block text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1";

// ─── Modal (module-level to prevent re-render bug) ────────────────────────────
function Modal({ open, onClose, title, children, wide }: {
  open: boolean; onClose: () => void; title: string;
  children: React.ReactNode; wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", h); };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div key="md" initial={{ opacity: 0, scale: 0.97, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`relative z-10 w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"} bg-[var(--cream)] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]`}>
            <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-[var(--line)] shrink-0">
              <h2 className="font-display text-[20px] tracking-tight">{title}</h2>
              <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--cream-2)] transition text-[var(--muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Trip Form ────────────────────────────────────────────────────────────────
const EMPTY_TRIP = { title: "", destination: "", start_date: "", end_date: "", price_per_person: "", notes: "", package_id: "" };
type PackageOption = { id: string; title: string; country: string; departure_date: string | null; return_date: string | null; price_from: number };

function TripForm({ initial, onSave, onCancel }: {
  initial?: typeof EMPTY_TRIP;
  onSave: (d: typeof EMPTY_TRIP) => Promise<void>;
  onCancel: () => void;
}) {
  const [form,     setForm]     = useState(initial ?? EMPTY_TRIP);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState("");

  useEffect(() => {
    createClient()
      .from("travel_packages")
      .select("id, title, country, departure_date, return_date, price_from")
      .order("departure_date", { ascending: true })
      .then(({ data }) => { if (data) setPackages(data as PackageOption[]); });
  }, []);

  function selectPackage(id: string) {
    if (!id) { setForm((f) => ({ ...f, package_id: "" })); return; }
    const pkg = packages.find((p) => p.id === id);
    if (!pkg) return;
    setForm((f) => ({
      ...f, package_id: id, title: pkg.title, destination: pkg.country,
      start_date: pkg.departure_date ?? f.start_date,
      end_date:   pkg.return_date    ?? f.end_date,
      price_per_person: String(pkg.price_from),
    }));
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.destination || !form.start_date || !form.end_date || !form.price_per_person) {
      setErr("Preenche todos os campos obrigatórios."); return;
    }
    setSaving(true); setErr("");
    try { await onSave(form); } catch (ex) { setErr((ex as Error).message); setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="px-7 py-6 space-y-4">
      <div>
        <label className={lCls}>Viagem do catálogo</label>
        <select value={form.package_id} onChange={(e) => selectPackage(e.target.value)} className={iCls}>
          <option value="">— Seleccionar viagem existente —</option>
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}{p.departure_date ? ` · ${new Date(p.departure_date + "T00:00:00").toLocaleDateString("pt-PT")}` : ""}
            </option>
          ))}
        </select>
        {form.package_id && (
          <p className="text-[11px] text-[var(--muted)] mt-1.5">Campos preenchidos automaticamente — podes editar abaixo.</p>
        )}
      </div>
      <div className="border-t border-[var(--line)]" />
      <div>
        <label className={lCls}>Nome do grupo *</label>
        <input value={form.title} onChange={f("title")} placeholder="ex: Marrocos 2026" className={iCls} />
      </div>
      <div>
        <label className={lCls}>Destino *</label>
        <input value={form.destination} onChange={f("destination")} placeholder="ex: Marrakech, Marrocos" className={iCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lCls}>Data de início *</label>
          <input type="date" value={form.start_date} onChange={f("start_date")} className={iCls} />
        </div>
        <div>
          <label className={lCls}>Data de fim *</label>
          <input type="date" value={form.end_date} onChange={f("end_date")} className={iCls} />
        </div>
      </div>
      <div>
        <label className={lCls}>Preço por pessoa (€) *</label>
        <input type="number" min="0" step="0.01" value={form.price_per_person}
          onChange={f("price_per_person")} placeholder="1500.00" className={iCls} />
      </div>
      <div>
        <label className={lCls}>Notas</label>
        <textarea rows={2} value={form.notes} onChange={f("notes")}
          placeholder="Observações…" className={`${iCls} resize-none`} />
      </div>
      {err && <p className="text-[13px] text-red-600">{err}</p>}
      <div className="flex gap-3 pb-1">
        <button type="button" onClick={onCancel}
          className="flex-1 rounded-full border border-[var(--line)] py-3 text-[14px] hover:bg-[var(--cream-2)] transition">Cancelar</button>
        <button type="submit" disabled={saving}
          className="flex-1 rounded-full bg-[var(--ink)] text-[var(--cream)] py-3 text-[14px] hover:bg-[var(--ink-soft)] transition disabled:opacity-50">
          {saving ? "A guardar…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

// ─── Passenger Modal ──────────────────────────────────────────────────────────
type MainPassengerInput = {
  clientId: string; clientName: string;
  clientPhone: string | null; clientEmail: string | null;
  docs: PaxFormDocs;
};

function PassengerModal({ open, onClose, onAdd, onEdit, editPax, takenClientIds }: {
  open: boolean; onClose: () => void;
  onAdd: (main: MainPassengerInput, roomType: string, companions: ClientOption[]) => Promise<void>;
  onEdit: (id: string, docs: PaxFormDocs) => Promise<void>;
  editPax: Passenger | null;
  takenClientIds: Set<string>;
}) {
  const isEdit = !!editPax;
  const [clients,    setClients]    = useState<ClientOption[]>([]);
  const [search,     setSearch]     = useState("");
  const [selected,   setSelected]   = useState<ClientOption | null>(null);
  const [docs,       setDocs]       = useState<PaxFormDocs>(EMPTY_DOCS);
  const [roomType,   setRoomType]   = useState("individual");
  const [companions, setCompanions] = useState<(ClientOption | null)[]>([]);
  const [saving,     setSaving]     = useState(false);
  const [err,        setErr]        = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  function handleRoomTypeChange(type: string) {
    setRoomType(type);
    const slots = ROOM_TYPES[type].capacity - 1;
    setCompanions(Array(slots).fill(null));
  }

  useEffect(() => {
    if (!open) return;
    setErr(""); setSaving(false);
    if (isEdit && editPax) {
      setDocs({
        id_card_number: editPax.id_card_number ?? "",
        id_card_expiry: editPax.id_card_expiry ?? "",
        nif:            editPax.nif ?? "",
        date_of_birth:  editPax.date_of_birth ?? "",
        nationality:    editPax.nationality ?? "Portuguesa",
        notes:          editPax.notes ?? "",
      });
    } else {
      setDocs(EMPTY_DOCS); setSelected(null); setSearch("");
      setRoomType("individual"); setCompanions([]);
      setTimeout(() => searchRef.current?.focus(), 130);
    }
    createClient().from("clients").select("id, name, email, phone").order("name")
      .then(({ data }) => { if (data) setClients(data as ClientOption[]); });
  }, [open, isEdit, editPax]);

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.email ?? "").toLowerCase().includes(q);
  }).slice(0, 8);

  const setD = (k: keyof PaxFormDocs) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDocs((d) => ({ ...d, [k]: e.target.value }));

  async function submit() {
    if (!isEdit && !selected) { setErr("Selecciona um cliente da lista."); return; }
    setSaving(true); setErr("");
    try {
      if (isEdit) {
        await onEdit(editPax!.id, docs);
      } else {
        await onAdd(
          { clientId: selected!.id, clientName: selected!.name, clientPhone: selected!.phone, clientEmail: selected!.email, docs },
          roomType,
          companions.filter((c): c is ClientOption => c !== null),
        );
      }
    } catch (ex) { setErr((ex as Error).message); setSaving(false); }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Editar — ${editPax!.full_name}` : "Adicionar passageiro"}
    >
      <div className="px-7 py-6 space-y-5">

        {/* Add mode: client picker */}
        {!isEdit && (
          <div>
            <label className={lCls}>Cliente *</label>
            {selected ? (
              <div className="flex items-center justify-between bg-[var(--cream-2)] rounded-xl px-4 py-3 border border-[var(--line)]">
                <div>
                  <p className="text-[14px] font-medium">{selected.name}</p>
                  <p className="text-[11px] text-[var(--muted)]">
                    {selected.email}{selected.phone ? ` · ${selected.phone}` : ""}
                  </p>
                </div>
                <button onClick={() => { setSelected(null); setSearch(""); setTimeout(() => searchRef.current?.focus(), 60); }}
                  className="p-1.5 rounded-lg hover:bg-white transition text-[var(--muted)]">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 bg-white border border-[var(--line)] rounded-xl px-3 py-2.5 focus-within:border-[var(--ink)] transition">
                  <Search className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
                  <input ref={searchRef} value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Pesquisar por nome ou email…"
                    className="text-[13px] bg-transparent focus:outline-none w-full" />
                </div>
                <div className="mt-1 bg-white border border-[var(--line)] rounded-xl overflow-hidden shadow-md">
                  {clients.length === 0 ? (
                    <p className="px-4 py-3 text-[12px] text-[var(--muted)]">A carregar clientes…</p>
                  ) : filtered.length === 0 ? (
                    <p className="px-4 py-3 text-[12px] text-[var(--muted)]">Nenhum cliente encontrado.</p>
                  ) : (
                    filtered.map((c) => {
                      const taken = takenClientIds.has(c.id);
                      return (
                        <button key={c.id} disabled={taken} onClick={() => setSelected(c)}
                          className={`w-full text-left px-4 py-3 flex items-center justify-between border-b border-[var(--line)] last:border-0 transition ${taken ? "opacity-40 cursor-not-allowed" : "hover:bg-[var(--cream-2)]"}`}>
                          <div>
                            <p className="text-[13px] font-medium">{c.name}</p>
                            <p className="text-[11px] text-[var(--muted)]">{c.email ?? "—"}{c.phone ? ` · ${c.phone}` : ""}</p>
                          </div>
                          {taken && <span className="text-[10px] text-[var(--muted)] shrink-0 ml-3 flex items-center gap-1"><Check className="w-3 h-3" />Já adicionado</span>}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit mode: read-only client header */}
        {isEdit && editPax && (
          <div className="bg-[var(--cream-2)] rounded-xl px-4 py-3 border border-[var(--line)]">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-1">Cliente</p>
            <p className="text-[14px] font-medium">{editPax.full_name}</p>
            {editPax.email && <p className="text-[11px] text-[var(--muted)]">{editPax.email}</p>}
          </div>
        )}

        {/* Room type (add mode only) */}
        {!isEdit && (
          <div>
            <label className={lCls}>Tipo de alojamento</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(ROOM_TYPES).map(([k, v]) => (
                <button key={k} type="button" onClick={() => handleRoomTypeChange(k)}
                  className={`py-2 px-2 rounded-xl border text-[12px] text-center transition ${
                    roomType === k
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--cream)]"
                      : "border-[var(--line)] hover:border-[var(--ink-soft)]"
                  }`}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Companions (add mode, non-individual) */}
        {!isEdit && roomType !== "individual" && (
          <div className="space-y-2">
            <label className={lCls}>Acompanhantes do quarto</label>
            {Array.from({ length: ROOM_TYPES[roomType].capacity - 1 }).map((_, i) => (
              <div key={i}>
                <label className={lCls}>Acompanhante {i + 1}</label>
                <select
                  value={companions[i]?.id ?? ""}
                  onChange={(e) => {
                    const client = clients.find((c) => c.id === e.target.value) ?? null;
                    setCompanions((prev) => { const n = [...prev]; n[i] = client; return n; });
                  }}
                  className={iCls}
                >
                  <option value="">— Seleccionar cliente —</option>
                  {clients
                    .filter((c) =>
                      !takenClientIds.has(c.id) &&
                      c.id !== selected?.id &&
                      !companions.some((cp, j) => j !== i && cp?.id === c.id)
                    )
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}{c.email ? ` · ${c.email}` : ""}
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-[var(--line)]" />

        {/* Travel docs */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-3">Documentos de viagem</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>CC nº</label>
              <input value={docs.id_card_number} onChange={setD("id_card_number")}
                placeholder="ex: 12345678 0 ZX4" className={iCls} />
            </div>
            <div>
              <label className={lCls}>Validade CC</label>
              <input type="date" value={docs.id_card_expiry} onChange={setD("id_card_expiry")} className={iCls} />
            </div>
            <div>
              <label className={lCls}>NIF</label>
              <input value={docs.nif} onChange={setD("nif")} placeholder="ex: 123456789" className={iCls} />
            </div>
            <div>
              <label className={lCls}>Data de nascimento</label>
              <input type="date" value={docs.date_of_birth} onChange={setD("date_of_birth")} className={iCls} />
            </div>
          </div>
          <div className="mt-3">
            <label className={lCls}>Nacionalidade</label>
            <input value={docs.nationality} onChange={setD("nationality")} placeholder="Portuguesa" className={iCls} />
          </div>
          <div className="mt-3">
            <label className={lCls}>Notas</label>
            <textarea rows={2} value={docs.notes} onChange={setD("notes")}
              placeholder="Observações…" className={`${iCls} resize-none`} />
          </div>
        </div>

        {err && <p className="text-[13px] text-red-600">{err}</p>}
        <div className="flex gap-3 pb-1">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-full border border-[var(--line)] py-3 text-[14px] hover:bg-[var(--cream-2)] transition">Cancelar</button>
          <button onClick={submit} disabled={saving}
            className="flex-1 rounded-full bg-[var(--ink)] text-[var(--cream)] py-3 text-[14px] hover:bg-[var(--ink-soft)] transition disabled:opacity-50">
            {saving ? "A guardar…" : "Guardar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
function PaymentModal({ passenger, payments, pricePerPerson, onAdd, onDelete, onClose }: {
  passenger: Passenger; payments: Payment[]; pricePerPerson: number;
  onAdd: (d: { amount: number; payment_date: string; method: string; notes: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    amount: "", payment_date: new Date().toISOString().slice(0, 10), method: "transfer", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const totalPaid   = payments.reduce((s, p) => s + p.amount, 0);
  const outstanding = Math.max(0, pricePerPerson - totalPaid);
  const status      = payStatus(totalPaid, pricePerPerson);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { setErr("Valor inválido."); return; }
    setSaving(true); setErr("");
    try {
      await onAdd({ amount, payment_date: form.payment_date, method: form.method, notes: form.notes });
      setForm((f) => ({ ...f, amount: "", notes: "" }));
    } catch (ex) { setErr((ex as Error).message); }
    setSaving(false);
  }

  return (
    <div className="px-7 py-6 space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-[var(--line)] p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Total</p>
          <p className="text-[20px] font-display tracking-tight mt-1">{fmt(pricePerPerson)}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-emerald-600">Pago</p>
          <p className="text-[20px] font-display tracking-tight mt-1 text-emerald-700">{fmt(totalPaid)}</p>
        </div>
        <div className={`rounded-xl border p-4 ${outstanding > 0 ? "bg-red-50 border-red-100" : "bg-white border-[var(--line)]"}`}>
          <p className={`text-[10px] uppercase tracking-[0.14em] ${outstanding > 0 ? "text-red-500" : "text-[var(--muted)]"}`}>Em falta</p>
          <p className={`text-[20px] font-display tracking-tight mt-1 ${outstanding > 0 ? "text-red-600" : "text-[var(--muted)]"}`}>{fmt(outstanding)}</p>
        </div>
      </div>
      <span className={`inline-flex text-[11px] px-2.5 py-0.5 rounded-full font-medium ${status.cls}`}>{status.label}</span>

      {payments.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-3">Pagamentos registados</p>
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-white rounded-xl border border-[var(--line)] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    {p.method === "mbway" ? <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> :
                     p.method === "cash"  ? <Banknote   className="w-3.5 h-3.5 text-emerald-600" /> :
                                            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium">{fmt(p.amount)}</p>
                    <p className="text-[11px] text-[var(--muted)]">{METHODS[p.method] ?? p.method} · {fmtDate(p.payment_date)}</p>
                    {p.notes && <p className="text-[11px] text-[var(--muted)] italic">{p.notes}</p>}
                  </div>
                </div>
                <button onClick={() => onDelete(p.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-[var(--muted)] hover:text-red-600 transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Registar pagamento</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lCls}>Valor (€) *</label>
            <input type="number" min="0.01" step="0.01" value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0.00" className={iCls} />
          </div>
          <div>
            <label className={lCls}>Data *</label>
            <input type="date" value={form.payment_date}
              onChange={(e) => setForm((f) => ({ ...f, payment_date: e.target.value }))}
              className={iCls} />
          </div>
          <div>
            <label className={lCls}>Método *</label>
            <select value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))} className={iCls}>
              {Object.entries(METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className={lCls}>Nota</label>
            <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Opcional" className={iCls} />
          </div>
        </div>
        {err && <p className="text-[13px] text-red-600">{err}</p>}
        <div className="flex gap-3 pb-1">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-full border border-[var(--line)] py-3 text-[14px] hover:bg-[var(--cream-2)] transition">Fechar</button>
          <button type="submit" disabled={saving}
            className="flex-1 rounded-full bg-emerald-600 text-white py-3 text-[14px] hover:bg-emerald-700 transition disabled:opacity-50">
            {saving ? "A guardar…" : "Registar pagamento"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Expenses Modal ───────────────────────────────────────────────────────────
function ExpensesModal({ tripId, onTotalChange, onClose }: {
  tripId: string;
  onTotalChange: (total: number) => void;
  onClose: () => void;
}) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({
    description: "", amount: "", expense_date: new Date().toISOString().slice(0, 10),
    category: "outro", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");
  const notifyRef = useRef(onTotalChange);
  notifyRef.current = onTotalChange;

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createClient() as any)
      .from("trip_expenses").select("*").eq("trip_id", tripId)
      .order("expense_date", { ascending: false })
      .then(({ data }: { data: Expense[] | null }) => {
        const list = (data ?? []) as Expense[];
        setExpenses(list);
        notifyRef.current(list.reduce((s, e) => s + e.amount, 0));
      });
  }, [tripId]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.description || !amount || amount <= 0) { setErr("Descrição e valor são obrigatórios."); return; }
    setSaving(true); setErr("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: created, error } = await (createClient() as any).from("trip_expenses").insert({
      trip_id: tripId, description: form.description, amount,
      expense_date: form.expense_date, category: form.category, notes: form.notes || null,
    }).select("*").single();
    if (error) { setErr(error.message); setSaving(false); return; }
    const next = [created as Expense, ...expenses];
    setExpenses(next);
    notifyRef.current(next.reduce((s, e) => s + e.amount, 0));
    setForm((f) => ({ ...f, description: "", amount: "", notes: "" }));
    setSaving(false);
  }

  async function deleteExpense(id: string) {
    if (!confirm("Apagar este encargo?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (createClient() as any).from("trip_expenses").delete().eq("id", id);
    const next = expenses.filter((e) => e.id !== id);
    setExpenses(next);
    notifyRef.current(next.reduce((s, e) => s + e.amount, 0));
  }

  return (
    <div className="px-7 py-6 space-y-6">
      <div className="bg-red-50 rounded-xl border border-red-100 p-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-red-600">Total encargos</p>
          <p className="text-[22px] font-display tracking-tight mt-0.5 text-red-700">{fmt(total)}</p>
        </div>
        <Receipt className="w-6 h-6 text-red-400" />
      </div>

      {expenses.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-3">Encargos registados</p>
          <div className="space-y-2">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between bg-white rounded-xl border border-[var(--line)] px-4 py-3">
                <div>
                  <p className="text-[13px] font-medium">{e.description}</p>
                  <p className="text-[11px] text-[var(--muted)]">
                    {EXPENSE_CATEGORIES[e.category] ?? e.category} · {fmtDate(e.expense_date)}
                    {e.notes ? ` · ${e.notes}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="text-[14px] font-medium text-red-600">{fmt(e.amount)}</p>
                  <button onClick={() => deleteExpense(e.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-[var(--muted)] hover:text-red-600 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Registar encargo</p>
        <div>
          <label className={lCls}>Descrição *</label>
          <input value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="ex: Bilhetes de avião" className={iCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lCls}>Valor (€) *</label>
            <input type="number" min="0.01" step="0.01" value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0.00" className={iCls} />
          </div>
          <div>
            <label className={lCls}>Data</label>
            <input type="date" value={form.expense_date}
              onChange={(e) => setForm((f) => ({ ...f, expense_date: e.target.value }))}
              className={iCls} />
          </div>
          <div>
            <label className={lCls}>Categoria</label>
            <select value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className={iCls}>
              {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className={lCls}>Nota</label>
            <input value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Opcional" className={iCls} />
          </div>
        </div>
        {err && <p className="text-[13px] text-red-600">{err}</p>}
        <div className="flex gap-3 pb-1">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-full border border-[var(--line)] py-3 text-[14px] hover:bg-[var(--cream-2)] transition">Fechar</button>
          <button type="submit" disabled={saving}
            className="flex-1 rounded-full bg-red-600 text-white py-3 text-[14px] hover:bg-red-700 transition disabled:opacity-50">
            {saving ? "A guardar…" : "Registar encargo"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Trip List ────────────────────────────────────────────────────────────────
function TripListView({ onSelect }: { onSelect: (t: TripGroup) => void }) {
  const [trips,       setTrips]       = useState<TripGroup[]>([]);
  const [summaries,   setSummaries]   = useState<Record<string, { pax: number; paid: number }>>({});
  const [expenseSums, setExpenseSums] = useState<Record<string, number>>({});
  const [loading,     setLoading]     = useState(true);
  const [showNew,     setShowNew]     = useState(false);
  const [editTrip,    setEditTrip]    = useState<TripGroup | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data: tripsData } = await supabase
      .from("trip_groups").select("*").order("start_date", { ascending: false });

    const list = (tripsData ?? []) as TripGroup[];
    setTrips(list);

    if (list.length === 0) { setLoading(false); return; }
    const ids = list.map((t) => t.id);

    const { data: paxData } = await supabase
      .from("trip_passengers").select("id, trip_id").in("trip_id", ids);

    const allPaxIds  = (paxData ?? []).map((p) => (p as { id: string }).id);
    const paxTripMap = new Map((paxData ?? []).map((p) => [
      (p as { id: string; trip_id: string }).id,
      (p as { id: string; trip_id: string }).trip_id,
    ]));

    const sums: Record<string, { pax: number; paid: number }> = {};
    for (const t of list) sums[t.id] = { pax: 0, paid: 0 };
    for (const p of paxData ?? []) sums[(p as { trip_id: string }).trip_id].pax++;

    if (allPaxIds.length > 0) {
      const { data: payData } = await supabase
        .from("trip_payments").select("passenger_id, amount").in("passenger_id", allPaxIds);
      for (const pay of payData ?? []) {
        const r = pay as { passenger_id: string; amount: number };
        const tripId = paxTripMap.get(r.passenger_id);
        if (tripId) sums[tripId].paid += r.amount;
      }
    }

    setSummaries(sums);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: expData } = await (supabase as any)
      .from("trip_expenses").select("trip_id, amount").in("trip_id", ids);
    const eSums: Record<string, number> = {};
    for (const t of list) eSums[t.id] = 0;
    for (const e of expData ?? []) {
      const r = e as { trip_id: string; amount: number };
      eSums[r.trip_id] = (eSums[r.trip_id] ?? 0) + r.amount;
    }
    setExpenseSums(eSums);
    setLoading(false);
  }

  async function createTrip(data: typeof EMPTY_TRIP) {
    const supabase = createClient();
    const { data: created, error } = await supabase.from("trip_groups").insert({
      title: data.title, destination: data.destination,
      start_date: data.start_date, end_date: data.end_date,
      price_per_person: parseFloat(data.price_per_person),
      notes: data.notes || null, package_id: data.package_id || null,
    }).select("*").single();
    if (error) throw new Error(error.message);
    setTrips((prev) => [created as TripGroup, ...prev]);
    setSummaries((prev) => ({ ...prev, [(created as TripGroup).id]: { pax: 0, paid: 0 } }));
    setShowNew(false);
  }

  async function updateTrip(data: typeof EMPTY_TRIP) {
    if (!editTrip) return;
    const supabase = createClient();
    const updates = {
      title: data.title, destination: data.destination,
      start_date: data.start_date, end_date: data.end_date,
      price_per_person: parseFloat(data.price_per_person),
      notes: data.notes || null, package_id: data.package_id || null,
    };
    const { error } = await supabase.from("trip_groups").update(updates).eq("id", editTrip.id);
    if (error) throw new Error(error.message);
    setTrips((prev) => prev.map((t) => t.id === editTrip.id ? { ...t, ...updates } : t));
    setEditTrip(null);
  }

  async function deleteTrip(t: TripGroup) {
    if (!confirm(`Apagar a viagem "${t.title}"? Todos os passageiros e pagamentos serão apagados.`)) return;
    const supabase = createClient();
    await supabase.from("trip_groups").delete().eq("id", t.id);
    setTrips((prev) => prev.filter((x) => x.id !== t.id));
  }

  function dateRange(s: string, e: string) {
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
    return `${new Date(s + "T00:00:00").toLocaleDateString("pt-PT", opts)} – ${new Date(e + "T00:00:00").toLocaleDateString("pt-PT", opts)}`;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-[36px] tracking-tight">Viagens</h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">Gestão de grupos, passageiros e pagamentos.</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] text-[var(--cream)] px-5 py-2.5 text-[14px] tracking-tight hover:bg-[var(--ink-soft)] transition">
          <Plus className="w-4 h-4" /> Nova viagem
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[var(--muted)] text-[14px]">A carregar...</div>
      ) : trips.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--line)] p-16 text-center">
          <p className="font-display text-[22px] tracking-tight">Sem viagens</p>
          <p className="mt-2 text-[var(--muted)] text-[14px]">Cria a primeira viagem para gerir grupos, passageiros e pagamentos.</p>
          <button onClick={() => setShowNew(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--ink)] text-[var(--cream)] px-5 py-2.5 text-[14px] hover:bg-[var(--ink-soft)] transition">
            <Plus className="w-4 h-4" /> Nova viagem
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {trips.map((t) => {
            const s        = summaries[t.id] ?? { pax: 0, paid: 0 };
            const expected = s.pax * t.price_per_person;
            const missing  = Math.max(0, expected - s.paid);
            const pct      = expected > 0 ? Math.min(100, (s.paid / expected) * 100) : 0;
            const status   = payStatus(s.paid, expected);
            return (
              <div key={t.id} onClick={() => onSelect(t)}
                className="bg-white rounded-2xl border border-[var(--line)] p-6 hover:border-[var(--ink-soft)] cursor-pointer group transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="font-display text-[20px] tracking-tight">{t.title}</h2>
                      {s.pax > 0 && (
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${status.cls}`}>{status.label}</span>
                      )}
                    </div>
                    <p className="text-[13px] text-[var(--muted)] mt-0.5">
                      {t.destination} · {dateRange(t.start_date, t.end_date)} · {fmt(t.price_per_person)}/pax
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); setEditTrip(t); }}
                      className="p-2 rounded-lg hover:bg-[var(--cream-2)] transition opacity-0 group-hover:opacity-100">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteTrip(t); }}
                      className="p-2 rounded-lg hover:bg-red-50 text-[var(--clay-dark)] transition opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-[var(--muted)] ml-1" />
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Passageiros</p>
                    <p className="text-[24px] font-display tracking-tight mt-0.5">{s.pax}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-emerald-600">Recebido</p>
                    <p className="text-[24px] font-display tracking-tight mt-0.5 text-emerald-700">{fmt(s.paid)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-red-500">Encargos</p>
                    <p className="text-[24px] font-display tracking-tight mt-0.5 text-red-600">{fmt(expenseSums[t.id] ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Lucro estimado</p>
                    <p className={`text-[24px] font-display tracking-tight mt-0.5 ${s.paid - (expenseSums[t.id] ?? 0) >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                      {fmt(s.paid - (expenseSums[t.id] ?? 0))}
                    </p>
                  </div>
                </div>
                {expected > 0 && (
                  <div className="mt-4">
                    <div className="h-1.5 bg-[var(--cream-2)] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[11px] text-[var(--muted)] mt-1">{pct.toFixed(0)}% de {fmt(expected)}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nova viagem">
        <TripForm onSave={createTrip} onCancel={() => setShowNew(false)} />
      </Modal>
      <Modal open={!!editTrip} onClose={() => setEditTrip(null)} title="Editar viagem">
        {editTrip && (
          <TripForm
            initial={{
              title: editTrip.title, destination: editTrip.destination,
              start_date: editTrip.start_date, end_date: editTrip.end_date,
              price_per_person: String(editTrip.price_per_person), notes: editTrip.notes ?? "",
              package_id: editTrip.package_id ?? "",
            }}
            onSave={updateTrip} onCancel={() => setEditTrip(null)}
          />
        )}
      </Modal>
    </div>
  );
}

// ─── Trip Detail ──────────────────────────────────────────────────────────────
function TripDetailView({ trip, onBack }: { trip: TripGroup; onBack: () => void }) {
  const [passengers,    setPassengers]    = useState<Passenger[]>([]);
  const [payments,      setPayments]      = useState<Map<string, Payment[]>>(new Map());
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [editPax,       setEditPax]       = useState<Passenger | null>(null);
  const [payPax,        setPayPax]        = useState<Passenger | null>(null);
  const [showExpenses,   setShowExpenses]   = useState(false);
  const [totalExpenses,  setTotalExpenses]  = useState(0);
  const [expandedRooms,  setExpandedRooms]  = useState<Set<string>>(new Set());

  function toggleRoom(key: string) {
    setExpandedRooms(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: paxData } = await supabase
      .from("trip_passengers").select("*")
      .eq("trip_id", trip.id)
      .order("sort_order").order("created_at");

    const paxList = (paxData ?? []) as unknown as Passenger[];
    setPassengers(paxList);

    if (paxList.length > 0) {
      const { data: payData } = await supabase
        .from("trip_payments").select("*")
        .in("passenger_id", paxList.map((p) => p.id))
        .order("payment_date");
      const map = new Map<string, Payment[]>();
      for (const p of paxList) map.set(p.id, []);
      for (const pay of (payData ?? []) as Payment[]) map.get(pay.passenger_id)?.push(pay);
      setPayments(map);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: expData } = await (supabase as any)
      .from("trip_expenses").select("amount").eq("trip_id", trip.id);
    setTotalExpenses((expData ?? []).reduce((s: number, e: { amount: number }) => s + e.amount, 0));
    setLoading(false);
  }, [trip.id]);

  useEffect(() => { load(); }, [load]);

  const getPaid      = (id: string) => (payments.get(id) ?? []).reduce((s, p) => s + p.amount, 0);
  const roomSizeFor  = (pax: Passenger) =>
    pax.room_id ? passengers.filter((p) => p.room_id === pax.room_id).length : 1;

  const takenClientIds = new Set(
    passengers.map((p) => p.client_id).filter((id): id is string => !!id)
  );

  async function addPassenger(main: MainPassengerInput, roomType: string, companions: ClientOption[]) {
    const supabase = createClient();
    const roomId   = roomType !== "individual" ? crypto.randomUUID() : null;
    const baseSort = passengers.length;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paxTable = supabase.from("trip_passengers") as any;
    const { data: mainCreated, error: mainErr } = await paxTable.insert({
      trip_id: trip.id, client_id: main.clientId,
      full_name: main.clientName, phone: main.clientPhone, email: main.clientEmail,
      id_card_number: main.docs.id_card_number || null, id_card_expiry: main.docs.id_card_expiry || null,
      nif: main.docs.nif || null, date_of_birth: main.docs.date_of_birth || null,
      nationality: main.docs.nationality || "Portuguesa", notes: main.docs.notes || null,
      sort_order: baseSort, room_type: roomType, room_id: roomId, is_main_occupant: true,
    }).select("*").single();
    if (mainErr) throw new Error(mainErr.message);

    const newPax: Passenger[] = [mainCreated as Passenger];
    const newPayments = new Map<string, Payment[]>();
    newPayments.set((mainCreated as Passenger).id, []);

    for (let i = 0; i < companions.length; i++) {
      const c = companions[i];
      const { data: compCreated, error: compErr } = await paxTable.insert({
        trip_id: trip.id, client_id: c.id,
        full_name: c.name, phone: c.phone, email: c.email,
        nationality: "Portuguesa", sort_order: baseSort + 1 + i,
        room_type: roomType, room_id: roomId, is_main_occupant: false,
      }).select("*").single();
      if (compErr) throw new Error(compErr.message);
      newPax.push(compCreated as Passenger);
      newPayments.set((compCreated as Passenger).id, []);
    }

    setPassengers((prev) => [...prev, ...newPax]);
    setPayments((m) => { const n = new Map(m); for (const [k, v] of newPayments) n.set(k, v); return n; });
    setShowAddModal(false);
  }

  async function updatePassenger(id: string, docs: PaxFormDocs) {
    const supabase = createClient();
    const updates = {
      id_card_number: docs.id_card_number || null, id_card_expiry: docs.id_card_expiry || null,
      nif: docs.nif || null, date_of_birth: docs.date_of_birth || null,
      nationality: docs.nationality || "Portuguesa", notes: docs.notes || null,
    };
    const { error } = await supabase.from("trip_passengers").update(updates).eq("id", id);
    if (error) throw new Error(error.message);
    setPassengers((p) => p.map((x) => x.id === id ? { ...x, ...updates } : x));
    setEditPax(null);
  }

  async function deletePassenger(id: string) {
    if (!confirm("Apagar este passageiro e os seus pagamentos?")) return;
    const supabase = createClient();
    await supabase.from("trip_passengers").delete().eq("id", id);
    setPassengers((p) => p.filter((x) => x.id !== id));
    setPayments((m) => { const n = new Map(m); n.delete(id); return n; });
    if (payPax?.id === id) setPayPax(null);
  }

  async function addPayment(paxId: string, data: { amount: number; payment_date: string; method: string; notes: string }) {
    const supabase = createClient();
    const { data: created, error } = await supabase.from("trip_payments").insert({
      passenger_id: paxId, amount: data.amount,
      payment_date: data.payment_date, method: data.method, notes: data.notes || null,
    }).select("*").single();
    if (error) throw new Error(error.message);
    setPayments((m) => {
      const n = new Map(m);
      n.set(paxId, [...(n.get(paxId) ?? []), created as Payment]);
      return n;
    });
  }

  async function deletePayment(paxId: string, payId: string) {
    if (!confirm("Apagar este pagamento?")) return;
    const supabase = createClient();
    await supabase.from("trip_payments").delete().eq("id", payId);
    setPayments((m) => {
      const n = new Map(m);
      n.set(paxId, (n.get(paxId) ?? []).filter((p) => p.id !== payId));
      return n;
    });
  }

  function exportCSV() {
    const BOM     = "﻿";
    const headers = ["#","Nome","Alojamento","CC nº","Val. CC","CC Expirado?","NIF","Data Nasc.","Nacionalidade","Telemóvel","Email","Total pago","Em falta","Estado","Notas"];
    const rows = filtered.map((p, i) => {
      const paid   = getPaid(p.id);
      const out    = Math.max(0, trip.price_per_person - paid);
      const status = payStatus(paid, trip.price_per_person);
      const warn     = ccExpired(p.id_card_expiry, trip.end_date) ? "⚠ EXPIRADO" : "";
      const roomLabel = ROOM_TYPES[p.room_type]?.label ?? p.room_type;
      const role      = p.is_main_occupant ? "titular" : "acompanhante";
      return [
        i + 1, p.full_name, p.room_type === "individual" ? "Individual" : `${roomLabel} (${role})`,
        p.id_card_number ?? "", fmtDate(p.id_card_expiry), warn,
        p.nif ?? "", fmtDate(p.date_of_birth), p.nationality ?? "",
        p.phone ?? "", p.email ?? "",
        paid.toFixed(2).replace(".", ","), out.toFixed(2).replace(".", ","),
        status.label, (p.notes ?? "").replace(/;/g, ","),
      ];
    });
    const csv  = BOM + [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url;
    a.download = `${trip.title.replace(/\s+/g, "_")}-passageiros.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  const totalExpected    = passengers.length * trip.price_per_person;
  const totalPaidAll     = passengers.reduce((s, p) => s + getPaid(p.id), 0);
  const totalOutstanding = Math.max(0, totalExpected - totalPaidAll);
  const pct              = totalExpected > 0 ? Math.min(100, (totalPaidAll / totalExpected) * 100) : 0;

  const filtered = passengers.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.full_name.toLowerCase().includes(q) ||
      (p.phone ?? "").includes(q) ||
      (p.email ?? "").toLowerCase().includes(q) ||
      (p.id_card_number ?? "").toLowerCase().includes(q);
  });

  const roomGroups = (() => {
    const out: { main: Passenger; companions: Passenger[] }[] = [];
    const done = new Set<string>();
    for (const p of passengers) {
      if (done.has(p.id) || !p.is_main_occupant) continue;
      const comps = p.room_id ? passengers.filter(c => c.room_id === p.room_id && !c.is_main_occupant) : [];
      out.push({ main: p, companions: comps });
      done.add(p.id); comps.forEach(c => done.add(c.id));
    }
    for (const p of passengers) { if (!done.has(p.id)) out.push({ main: p, companions: [] }); }
    return out;
  })();

  const filteredGroups = !search ? roomGroups : roomGroups.filter(({ main, companions }) => {
    const q = search.toLowerCase();
    const m = (p: Passenger) => p.full_name.toLowerCase().includes(q) || (p.phone ?? "").includes(q) ||
      (p.email ?? "").toLowerCase().includes(q) || (p.id_card_number ?? "").toLowerCase().includes(q);
    return m(main) || companions.some(m);
  });

  const thCls = "text-left text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] px-3 py-3 border-b border-[var(--line)] whitespace-nowrap font-medium bg-[var(--cream)]/40";
  const tdCls = "px-3 py-3 text-[12px] border-b border-[var(--line)] whitespace-nowrap";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] text-[var(--muted)] hover:text-[var(--ink)] transition mb-4">
          <ArrowLeft className="w-4 h-4" /> Todas as viagens
        </button>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-[32px] tracking-tight">{trip.title}</h1>
            <p className="text-[13px] text-[var(--muted)] mt-0.5">
              {trip.destination} · {fmtDate(trip.start_date)} – {fmtDate(trip.end_date)} · {fmt(trip.price_per_person)}/pessoa
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowExpenses(true)}
              className="inline-flex items-center gap-2 rounded-full bg-white border border-[var(--line)] px-4 py-2 text-[13px] hover:bg-[var(--cream-2)] transition">
              <Receipt className="w-4 h-4" /> Encargos
            </button>
            <button onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-full bg-white border border-[var(--line)] px-4 py-2 text-[13px] hover:bg-[var(--cream-2)] transition">
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
            <button onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] text-[var(--cream)] px-5 py-2.5 text-[14px] hover:bg-[var(--ink-soft)] transition">
              <Plus className="w-4 h-4" /> Adicionar passageiro
            </button>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="bg-white rounded-2xl border border-[var(--line)] p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Passageiros</p>
            <p className="text-[28px] font-display tracking-tight mt-1">{passengers.length}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Total esperado</p>
            <p className="text-[28px] font-display tracking-tight mt-1">{fmt(totalExpected)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-emerald-600">Recebido</p>
            <p className="text-[28px] font-display tracking-tight mt-1 text-emerald-700">{fmt(totalPaidAll)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-red-500">Encargos</p>
            <p className="text-[28px] font-display tracking-tight mt-1 text-red-600">{fmt(totalExpenses)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Lucro estimado</p>
            <p className={`text-[28px] font-display tracking-tight mt-1 ${totalPaidAll - totalExpenses >= 0 ? "text-emerald-700" : "text-red-600"}`}>
              {fmt(totalPaidAll - totalExpenses)}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <div className="h-2 bg-[var(--cream-2)] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[11px] text-[var(--muted)] mt-1.5">{pct.toFixed(0)}% cobrado</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-[var(--line)] rounded-full px-4 py-2 max-w-sm">
        <Search className="w-4 h-4 text-[var(--muted)] shrink-0" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome, tel., email, CC…"
          className="bg-transparent text-[13px] focus:outline-none w-full" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[var(--line)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 820 }}>
            <thead>
              <tr>
                <th className={`${thCls} w-10 text-center rounded-tl-2xl`}>#</th>
                <th className={`${thCls} min-w-[160px]`}>Nome</th>
                <th className={`${thCls} min-w-[110px]`}>CC nº</th>
                <th className={`${thCls} min-w-[100px]`}>Val. CC</th>
                <th className={`${thCls} min-w-[80px]`}>NIF</th>
                <th className={`${thCls} min-w-[100px]`}>Data nasc.</th>
                <th className={`${thCls} min-w-[95px]`}>Nacion.</th>
                <th className={`${thCls} min-w-[105px]`}>Pagamento</th>
                <th className={`${thCls} w-20 text-center rounded-tr-2xl`}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} className="text-center py-14 text-[13px] text-[var(--muted)]">A carregar...</td></tr>
              )}
              {!loading && filteredGroups.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-14">
                    <p className="text-[13px] text-[var(--muted)]">
                      {search ? "Nenhum passageiro encontrado." : "Nenhum passageiro ainda."}
                    </p>
                    {!search && (
                      <button onClick={() => setShowAddModal(true)}
                        className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-[var(--ink)] hover:underline">
                        <Plus className="w-4 h-4" /> Adicionar o primeiro passageiro
                      </button>
                    )}
                  </td>
                </tr>
              )}
              {!loading && filteredGroups.map(({ main: p, companions }, groupIdx) => {
                const paid     = getPaid(p.id);
                const totalDue = trip.price_per_person;
                const out      = Math.max(0, totalDue - paid);
                const status   = payStatus(paid, totalDue);
                const warn     = ccExpired(p.id_card_expiry, trip.end_date);
                const hasComp  = companions.length > 0;
                const isOpen   = expandedRooms.has(p.room_id ?? p.id);
                return (
                  <Fragment key={p.id}>
                    {/* Main / titular row */}
                    <tr
                      className={`hover:bg-[var(--cream)]/30 group ${hasComp ? "cursor-pointer" : ""}`}
                      onClick={hasComp ? () => toggleRoom(p.room_id ?? p.id) : undefined}
                    >
                      <td className={`${tdCls} text-center text-[var(--muted)]`}>
                        <div className="flex items-center justify-center gap-1">
                          {hasComp
                            ? (isOpen
                                ? <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)]" />
                                : <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)]" />)
                            : null}
                          <span>{groupIdx + 1}</span>
                        </div>
                      </td>
                      <td className={`${tdCls} font-medium`}>
                        <div>{p.full_name}</div>
                        {hasComp && (
                          <div className="text-[10px] text-[var(--muted)] mt-0.5">
                            {ROOM_TYPES[p.room_type]?.label ?? p.room_type} · titular · {roomSz} pax
                          </div>
                        )}
                      </td>
                      <td className={tdCls}>{p.id_card_number ?? <span className="text-[var(--muted)]">—</span>}</td>
                      <td className={tdCls}>
                        <span className={`inline-flex items-center gap-1 ${warn ? "text-amber-600 font-medium" : ""}`}>
                          {warn && <span title="CC expira antes da viagem"><AlertTriangle className="w-3 h-3 shrink-0" /></span>}
                          {fmtDate(p.id_card_expiry)}
                        </span>
                      </td>
                      <td className={tdCls}>{p.nif ?? <span className="text-[var(--muted)]">—</span>}</td>
                      <td className={tdCls}>{fmtDate(p.date_of_birth)}</td>
                      <td className={tdCls}>{p.nationality ?? <span className="text-[var(--muted)]">—</span>}</td>
                      <td className={tdCls} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setPayPax(p)} className="text-left group/pay">
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${status.cls}`}>
                            {status.label}
                          </span>
                          <span className="block text-[10px] text-[var(--muted)] mt-0.5 group-hover/pay:text-[var(--ink)] transition">
                            {fmt(paid)} · {fmt(out)} em falta
                          </span>
                        </button>
                      </td>
                      <td className={`${tdCls} text-center`} onClick={e => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => setEditPax(p)}
                            className="p-1.5 rounded-lg hover:bg-[var(--cream-2)] transition" title="Editar documentos">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deletePassenger(p.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--clay-dark)] transition" title="Apagar">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Companion rows (accordion children) */}
                    {hasComp && isOpen && companions.map((c) => {
                      const cPaid   = getPaid(c.id);
                      const cOut    = Math.max(0, trip.price_per_person - cPaid);
                      const cStatus = payStatus(cPaid, trip.price_per_person);
                      const cWarn   = ccExpired(c.id_card_expiry, trip.end_date);
                      return (
                        <tr key={c.id} className="bg-[var(--cream)]/40 group border-t-0">
                          <td className={`${tdCls} text-center text-[var(--muted)] border-t-0`} />
                          <td className={`${tdCls} border-t-0`}>
                            <div className="flex items-center gap-2 pl-4">
                              <div className="w-px h-8 bg-[var(--line)] shrink-0" />
                              <div>
                                <div className="text-[12px] font-medium text-[var(--ink)]">{c.full_name}</div>
                                <div className="text-[10px] text-[var(--muted)]">Acompanhante</div>
                              </div>
                            </div>
                          </td>
                          <td className={`${tdCls} text-[12px] border-t-0`}>{c.id_card_number ?? <span className="text-[var(--muted)]">—</span>}</td>
                          <td className={`${tdCls} border-t-0`}>
                            <span className={`inline-flex items-center gap-1 text-[12px] ${cWarn ? "text-amber-600 font-medium" : ""}`}>
                              {cWarn && <span title="CC expira antes da viagem"><AlertTriangle className="w-3 h-3 shrink-0" /></span>}
                              {fmtDate(c.id_card_expiry)}
                            </span>
                          </td>
                          <td className={`${tdCls} text-[12px] border-t-0`}>{c.nif ?? <span className="text-[var(--muted)]">—</span>}</td>
                          <td className={`${tdCls} text-[12px] border-t-0`}>{fmtDate(c.date_of_birth)}</td>
                          <td className={`${tdCls} text-[12px] border-t-0`}>{c.nationality ?? <span className="text-[var(--muted)]">—</span>}</td>
                          <td className={`${tdCls} border-t-0`}>
                            <button onClick={() => setPayPax(c)} className="text-left group/pay">
                              <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${cStatus.cls}`}>
                                {cStatus.label}
                              </span>
                              <span className="block text-[10px] text-[var(--muted)] mt-0.5 group-hover/pay:text-[var(--ink)] transition">
                                {fmt(cPaid)} · {fmt(cOut)} em falta
                              </span>
                            </button>
                          </td>
                          <td className={`${tdCls} text-center border-t-0`}>
                            <div className="inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                              <button onClick={() => setEditPax(c)}
                                className="p-1.5 rounded-lg hover:bg-[var(--cream-2)] transition" title="Editar documentos">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deletePassenger(c.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--clay-dark)] transition" title="Apagar">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {passengers.length > 0 && (
          <div className="px-4 py-3 border-t border-[var(--line)] text-[12px] text-[var(--muted)]">
            {passengers.length} passageiro{passengers.length !== 1 ? "s" : ""}
            {search && ` · ${filteredGroups.reduce((s, g) => s + 1 + g.companions.length, 0)} encontrado${filteredGroups.length !== 1 ? "s" : ""}`}
          </div>
        )}
      </div>

      {/* Add passenger modal */}
      <PassengerModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addPassenger}
        onEdit={() => Promise.resolve()}
        editPax={null}
        takenClientIds={takenClientIds}
      />

      {/* Edit passenger modal */}
      <PassengerModal
        open={!!editPax}
        onClose={() => setEditPax(null)}
        onAdd={() => Promise.resolve()}
        onEdit={updatePassenger}
        editPax={editPax}
        takenClientIds={takenClientIds}
      />

      {/* Expenses modal */}
      <Modal open={showExpenses} onClose={() => setShowExpenses(false)} title="Encargos da viagem" wide>
        {showExpenses && (
          <ExpensesModal
            tripId={trip.id}
            onTotalChange={setTotalExpenses}
            onClose={() => setShowExpenses(false)}
          />
        )}
      </Modal>

      {/* Payment modal */}
      <Modal
        open={!!payPax}
        onClose={() => setPayPax(null)}
        title={payPax ? `Pagamentos — ${payPax.full_name}` : "Pagamentos"}
        wide
      >
        {payPax && (
          <PaymentModal
            passenger={payPax}
            payments={payments.get(payPax.id) ?? []}
            pricePerPerson={trip.price_per_person}
            onAdd={(data) => addPayment(payPax.id, data)}
            onDelete={(payId) => deletePayment(payPax.id, payId)}
            onClose={() => setPayPax(null)}
          />
        )}
      </Modal>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function GroupsView() {
  const [selectedTrip, setSelectedTrip] = useState<TripGroup | null>(null);
  if (selectedTrip) {
    return <TripDetailView trip={selectedTrip} onBack={() => setSelectedTrip(null)} />;
  }
  return <TripListView onSelect={setSelectedTrip} />;
}
