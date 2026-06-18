"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, Plane, Plus, Edit3, Trash2, Bell, TrendingUp,
  Search, ArrowLeft, Calendar, Users, Settings, LogOut,
  Upload, Image as ImageIcon, Sparkles, Copy, FileText, Download, Phone, Mail, ChevronDown,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import type { TravelPackageCard, Category } from "@/types/database";
import { formatPrice, formatTripDate } from "@/lib/utils";
import { Pill } from "@/components/ui/Pill";

type View = "dashboard" | "trips" | "edit" | "bookings" | "users" | "settings";

const NAV = [
  { id: "dashboard", label: "Dashboard",     icon: LayoutDashboard },
  { id: "trips",     label: "Viagens",        icon: Plane },
  { id: "bookings",  label: "Reservas",       icon: Calendar },
  { id: "users",     label: "Equipa",         icon: Users },
  { id: "settings",  label: "Definições",     icon: Settings },
];

const STATS = [
  { l: "Receita este mês",  v: "€284 320", d: "+12.4%", up: true },
  { l: "Reservas ativas",   v: "42",        d: "+6",     up: true },
  { l: "Novas consultas",   v: "128",       d: "+18%",   up: true },
  { l: "Conversão",         v: "23.1%",     d: "-1.2%",  up: false },
];

const BOOKINGS = [
  { name: "Joana Mendes",  trip: "Amalfi Coast", date: "Hoje, 14:32",   state: "Confirmado",  value: "€9 780"  },
  { name: "Tomás Lopes",   trip: "Kyoto",        date: "Hoje, 10:18",   state: "Em proposta", value: "€14 480" },
  { name: "Maria Vaz",     trip: "Maldivas",     date: "Ontem",         state: "Pago",        value: "€19 700" },
  { name: "Pedro Rocha",   trip: "Patagónia",    date: "2 dias atrás",  state: "Confirmado",  value: "€22 840" },
  { name: "Inês Antunes",  trip: "Marrocos",     date: "3 dias atrás",  state: "Em proposta", value: "€10 640" },
];

const BARS   = [60, 78, 52, 91, 68, 100];
const MONTHS = ["Nov", "Dez", "Jan", "Fev", "Mar", "Abr"];

export default function AdminPage() {
  const router = useRouter();
  const [view,        setView]       = useState<View>("dashboard");
  const [trips,       setTrips]      = useState<TravelPackageCard[]>([]);
  const [refreshKey,  setRefreshKey] = useState(0);
  const [editId,         setEditId]        = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [search,         setSearch]         = useState("");
  const [userName,       setUserName]       = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email?.split("@")[0] ??
        "Admin";
      setUserName(name);
    });
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("travel_packages")
      .select("*, category:categories(id, name, slug)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setTrips(data as TravelPackageCard[]);
      });
  }, [refreshKey]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const openEdit = (id: string | null) => { setEditId(id); setView("edit"); };

  async function delTrip(id: string) {
    setTrips((p) => p.filter((t) => t.id !== id));
    const supabase = createClient();
    await supabase.from("travel_packages").delete().eq("id", id);
  }

  async function dupTrip(id: string) {
    const original = trips.find((t) => t.id === id);
    if (!original) return;
    const supabase = createClient();
    const uniqueSlug = `viagem-${Date.now()}`;

    const { data, error } = await supabase
      .from("travel_packages")
      .insert({
        slug:              uniqueSlug,
        title:             original.title,
        country:           original.country,
        duration_days:     original.duration_days,
        nights:            original.nights,
        price_from:        original.price_from,
        short_description: original.short_description,
        long_description:  original.long_description,
        hero_image_url:    original.hero_image_url,
        tag:               original.tag,
        category_id:       original.category_id,
        departure_date:    original.departure_date,
        return_date:       original.return_date,
        available_seats:   original.available_seats,
        trip_status:       original.trip_status,
        pdf_url:           original.pdf_url,
        is_published:      false,
        is_featured:       false,
      })
      .select("*, category:categories(id, name, slug)")
      .single();

    if (error) { console.error("Erro ao duplicar viagem:", error.message); return; }
    if (!data) return;

    // Copy gallery images
    const { data: images } = await supabase
      .from("package_images")
      .select("image_url, alt_text, sort_order")
      .eq("package_id", id)
      .order("sort_order");

    if (images && images.length > 0) {
      await supabase.from("package_images").insert(
        images.map((img) => ({ ...img, package_id: data.id }))
      );
    }

    // Copy itinerary
    const { data: itinerary } = await supabase
      .from("package_itinerary")
      .select("day_label, title, description, sort_order")
      .eq("package_id", id)
      .order("sort_order");

    if (itinerary && itinerary.length > 0) {
      await supabase.from("package_itinerary").insert(
        itinerary.map((row) => ({ ...row, package_id: data.id }))
      );
    }

    setTrips((p) => [data as TravelPackageCard, ...p]);
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[var(--cream)] pt-[72px]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-10 grid lg:grid-cols-[230px_1fr] gap-8">

          {/* ── Sidebar ── */}
          <aside className="lg:sticky lg:top-[88px] lg:self-start">
            <div className="px-3 py-2 mb-6">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">Admin · v3.2</div>
              <div className="mt-1 font-display text-[20px]">Painel MN</div>
            </div>
            <nav className="space-y-1">
              {NAV.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setView(id as View)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] tracking-tight transition ${
                    view === id ? "bg-[var(--ink)] text-[var(--cream)]" : "text-[var(--ink-soft)] hover:bg-[var(--cream-2)]"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.8} /> {label}
                </button>
              ))}
            </nav>
            <div className="mt-8 pt-6 border-t border-[var(--line)]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] text-[var(--muted)] hover:text-[var(--ink)] tracking-tight transition"
              >
                <LogOut className="w-4 h-4" /> Terminar sessão
              </button>
            </div>
          </aside>

          {/* ── Main ── */}
          <main>
            {view === "dashboard" && (
              <Dashboard onNavigate={(v) => setView(v as View)} userName={userName} />
            )}
            {view === "trips" && (
              <TripsList
                trips={trips}
                search={search}
                setSearch={setSearch}
                onEdit={openEdit}
                onDelete={(id) => setPendingDeleteId(id)}
                onDuplicate={dupTrip}
                onNew={() => openEdit(null)}
              />
            )}
            {view === "edit" && (
              <EditForm
                trip={trips.find((t) => t.id === editId) ?? null}
                onBack={() => setView("trips")}
                onSaved={() => { setRefreshKey((k) => k + 1); setView("trips"); }}
              />
            )}
            {view === "bookings" && <BookingsView />}
            {!["dashboard", "trips", "edit", "bookings"].includes(view) && (
              <div className="bg-white rounded-2xl border border-[var(--line)] p-16 text-center">
                <div className="font-display text-[28px]">{view}</div>
                <p className="mt-2 text-[var(--muted)] text-[14px]">
                  Esta secção ainda não está disponível.
                </p>
              </div>
            )}
          </main>

        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
      {pendingDeleteId && (() => {
        const tripTitle = trips.find((t) => t.id === pendingDeleteId)?.title ?? "esta viagem";
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setPendingDeleteId(null)} />
            <div className="relative bg-white rounded-2xl border border-[var(--line)] shadow-xl p-8 w-full max-w-sm">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-5">
                <Trash2 className="w-4 h-4 text-red-600" />
              </div>
              <h2 className="font-display text-[22px] tracking-tight mb-2">Apagar viagem?</h2>
              <p className="text-[14px] text-[var(--muted)] tracking-tight leading-relaxed mb-7">
                Tens a certeza que queres apagar <span className="text-[var(--ink)] font-medium">"{tripTitle}"</span>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPendingDeleteId(null)}
                  className="flex-1 rounded-full border border-[var(--line)] py-2.5 text-[14px] tracking-tight hover:bg-[var(--cream)] transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { delTrip(pendingDeleteId); setPendingDeleteId(null); }}
                  className="flex-1 rounded-full bg-red-600 text-white py-2.5 text-[14px] tracking-tight hover:bg-red-700 transition"
                >
                  Apagar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}

/* ─────────────────────────────────────────────────────── Dashboard */
function Dashboard({ onNavigate, userName }: { onNavigate: (v: string) => void; userName: string }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[36px] tracking-tight">Olá, {userName || "…"}.</h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">Eis o resumo do que se passa hoje.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full border border-[var(--line)] flex items-center justify-center relative hover:border-[var(--ink)] transition">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--clay)]" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.l} className="bg-white rounded-2xl p-6 border border-[var(--line)]">
            <div className="text-[12px] uppercase tracking-[0.16em] text-[var(--muted)]">{s.l}</div>
            <div className="mt-3 font-display text-[36px] leading-none tracking-tight">{s.v}</div>
            <div className={`mt-3 text-[12px] inline-flex items-center gap-1 tracking-tight ${s.up ? "text-emerald-700" : "text-[var(--clay-dark)]"}`}>
              <TrendingUp className={`w-3.5 h-3.5 ${!s.up ? "rotate-180" : ""}`} /> {s.d}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + top destination */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[var(--line)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-[22px] tracking-tight">Receita · últimos 6 meses</h3>
              <p className="text-[12px] text-[var(--muted)] tracking-tight">Reservas confirmadas</p>
            </div>
            <select className="text-[12px] border border-[var(--line)] rounded-full px-3 py-1.5 focus:outline-none">
              <option>6 meses</option>
              <option>12 meses</option>
            </select>
          </div>
          <div className="h-52 flex items-end gap-3">
            {BARS.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-[var(--ink)] to-[var(--ink-soft)] rounded-t-lg"
                  style={{ height: `${h}%` }}
                />
                <div className="text-[11px] text-[var(--muted)] tracking-tight">{MONTHS[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--ink)] text-[var(--cream)] rounded-2xl p-6">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/50">Top destino</div>
          <div className="mt-2 font-display text-[28px]">Itália</div>
          <div className="mt-1 text-[13px] text-white/65 tracking-tight">38% das reservas Q1</div>
          <div className="mt-6 space-y-3 text-[13px]">
            {[
              { l: "Itália",    v: 38 },
              { l: "Japão",     v: 21 },
              { l: "Maldivas",  v: 18 },
              { l: "Patagónia", v: 12 },
            ].map((r) => (
              <div key={r.l}>
                <div className="flex justify-between mb-1.5 text-white/75 tracking-tight">
                  <span>{r.l}</span><span>{r.v}%</span>
                </div>
                <div className="h-1 bg-white/15 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--clay)] rounded-full" style={{ width: `${r.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings table */}
      <div className="bg-white rounded-2xl border border-[var(--line)] overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-[var(--line)]">
          <h3 className="font-display text-[22px] tracking-tight">Reservas recentes</h3>
          <button
            onClick={() => onNavigate("trips")}
            className="text-[13px] tracking-tight link-underline"
          >
            Ver todas →
          </button>
        </div>
        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] border-b border-[var(--line)]">
              {["Cliente", "Viagem", "Data", "Estado", "Valor"].map((h, i) => (
                <th key={h} className={`font-medium p-4 ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BOOKINGS.map((r, i) => (
              <tr key={i} className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--cream)]/50">
                <td className="p-4 font-medium tracking-tight">{r.name}</td>
                <td className="p-4 text-[var(--ink-soft)]">{r.trip}</td>
                <td className="p-4 text-[var(--muted)] tracking-tight">{r.date}</td>
                <td className="p-4">
                  <Pill className={
                    r.state === "Pago"
                      ? "!bg-emerald-50 !text-emerald-800 !border-emerald-200"
                      : r.state === "Confirmado"
                      ? "!bg-[var(--cream-2)]"
                      : "!bg-[var(--clay-soft)] !text-[var(--clay-dark)] !border-transparent"
                  }>
                    {r.state}
                  </Pill>
                </td>
                <td className="p-4 text-right font-medium tracking-tight">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── Trips list */
function TripsList({
  trips, search, setSearch, onEdit, onDelete, onDuplicate, onNew,
}: {
  trips: TravelPackageCard[];
  search: string;
  setSearch: (v: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onNew: () => void;
}) {
  const filtered = trips.filter(
    (t) =>
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-[36px] tracking-tight">Viagens</h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">Gerir todos os pacotes do catálogo MN.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[var(--line)] rounded-full px-4 py-2">
            <Search className="w-4 h-4 text-[var(--muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Procurar viagens..."
              className="bg-transparent text-[13px] focus:outline-none w-44"
            />
          </div>
          <button
            onClick={onNew}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] text-[var(--cream)] px-5 py-2.5 text-[14px] tracking-tight hover:bg-[var(--ink-soft)] transition"
          >
            <Plus className="w-4 h-4" /> Nova viagem
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--line)] overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] border-b border-[var(--line)] bg-[var(--cream)]/40">
              <th className="text-left font-medium p-4">Viagem</th>
              <th className="text-left font-medium p-4 hidden lg:table-cell">País</th>
              <th className="text-left font-medium p-4 hidden md:table-cell">Duração</th>
              <th className="text-left font-medium p-4 hidden xl:table-cell">Datas</th>
              <th className="text-left font-medium p-4">Preço</th>
              <th className="text-left font-medium p-4 hidden lg:table-cell">Estado</th>
              <th className="text-right font-medium p-4 w-12">·</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--cream)]/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {t.hero_image_url ? (
                      <img src={t.hero_image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[var(--cream-2)] flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-[var(--muted)]" strokeWidth={1.5} />
                      </div>
                    )}
                    <div>
                      <div className="font-medium tracking-tight max-w-xs truncate">{t.title}</div>
                      <div className="text-[12px] text-[var(--muted)] tracking-tight">{t.category?.name ?? "—"}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-[var(--ink-soft)] hidden lg:table-cell">{t.country}</td>
                <td className="p-4 text-[var(--muted)] hidden md:table-cell tracking-tight">{t.duration_days} dias</td>
                <td className="p-4 hidden xl:table-cell">
                  {t.departure_date ? (
                    <div className="text-[13px] tracking-tight">
                      <span className="text-[var(--ink)]">{formatTripDate(t.departure_date)}</span>
                      {t.return_date && (
                        <span className="text-[var(--muted)]"> → {formatTripDate(t.return_date)}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[var(--muted)] text-[13px]">—</span>
                  )}
                </td>
                <td className="p-4 font-medium tracking-tight">{formatPrice(t.price_from)}</td>
                <td className="p-4 hidden lg:table-cell">
                  {t.is_published ? (
                    <Pill className="!bg-emerald-50 !text-emerald-800 !border-emerald-200">Publicada</Pill>
                  ) : (
                    <Pill className="!bg-[var(--cream-2)] !text-[var(--muted)] !border-[var(--line)]">Rascunho</Pill>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button onClick={() => onEdit(t.id)} className="p-2 rounded-lg hover:bg-[var(--cream-2)] transition" title="Editar">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDuplicate(t.id)} className="p-2 rounded-lg hover:bg-[var(--cream-2)] transition" title="Duplicar">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(t.id)} className="p-2 rounded-lg hover:bg-[var(--cream-2)] text-[var(--clay-dark)] transition" title="Apagar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── Bookings view */
type BookingStatus = "pending" | "contacted" | "confirmed" | "cancelled";

type BookingRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  pax_count: number;
  status: BookingStatus;
  created_at: string;
  package: { title: string } | null;
};

const BOOKING_STATUS: Record<BookingStatus, { label: string; cls: string }> = {
  pending:   { label: "Novo",        cls: "!bg-blue-50 !text-blue-700 !border-blue-200" },
  contacted: { label: "Contactado",  cls: "!bg-amber-50 !text-amber-700 !border-amber-200" },
  confirmed: { label: "Confirmado",  cls: "!bg-emerald-50 !text-emerald-800 !border-emerald-200" },
  cancelled: { label: "Cancelado",   cls: "!bg-red-50 !text-red-600 !border-red-200" },
};

function BookingsView() {
  const [bookings,  setBookings]  = useState<BookingRequest[]>([]);
  const [search,    setSearch]    = useState("");
  const [loading,   setLoading]   = useState(true);
  const [openMenu,  setOpenMenu]  = useState<string | null>(null);

  useEffect(() => {
    if (!openMenu) return;
    const handler = () => setOpenMenu(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openMenu]);

  useEffect(() => {
    createClient()
      .from("booking_requests")
      .select("id, name, email, phone, message, pax_count, status, created_at, package:travel_packages(title)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setBookings(data as unknown as BookingRequest[]);
        setLoading(false);
      });
  }, []);

  const filtered = bookings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return b.name.toLowerCase().includes(q) || (b.package?.title ?? "").toLowerCase().includes(q);
  });

  async function updateStatus(id: string, status: BookingStatus) {
    setOpenMenu(null);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    await createClient().from("booking_requests").update({ status }).eq("id", id);
  }

  function exportCSV() {
    const BOM = "﻿";
    const headers = ["Nome", "Email", "Telefone", "Viagem", "Pax", "Estado", "Mensagem", "Data"];
    const rows = filtered.map((b) => [
      b.name,
      b.email,
      b.phone ?? "",
      b.package?.title ?? "",
      String(b.pax_count),
      BOOKING_STATUS[b.status]?.label ?? b.status,
      (b.message ?? "").replace(/,/g, ";").replace(/\n/g, " "),
      new Date(b.created_at).toLocaleString("pt-PT"),
    ]);
    const csv = BOM + [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `reservas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-[36px] tracking-tight">Reservas</h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">Pedidos de reserva recebidos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[var(--line)] rounded-full px-4 py-2">
            <Search className="w-4 h-4 text-[var(--muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Procurar por nome ou viagem..."
              className="bg-transparent text-[13px] focus:outline-none w-52"
            />
          </div>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-full bg-white border border-[var(--line)] px-5 py-2.5 text-[14px] tracking-tight hover:bg-[var(--cream-2)] transition"
          >
            <Download className="w-4 h-4" /> Exportar Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[var(--line)]">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] border-b border-[var(--line)] bg-[var(--cream)]/40">
              <th className="text-left font-medium p-4 rounded-tl-2xl">Cliente</th>
              <th className="text-left font-medium p-4 hidden md:table-cell">Contacto</th>
              <th className="text-left font-medium p-4 hidden lg:table-cell">Viagem</th>
              <th className="text-left font-medium p-4 hidden xl:table-cell">Pax</th>
              <th className="text-left font-medium p-4 hidden sm:table-cell">Data</th>
              <th className="text-left font-medium p-4 rounded-tr-2xl">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-[var(--muted)] text-[13px]">A carregar...</td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-[var(--muted)] text-[13px]">
                  {search ? "Nenhum resultado para a pesquisa." : "Ainda não há pedidos de reserva."}
                </td>
              </tr>
            )}
            {filtered.map((b) => {
              const st = BOOKING_STATUS[b.status];
              return (
                <tr key={b.id} className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--cream)]/40">
                  {/* Nome */}
                  <td className="p-4">
                    <div className="font-medium tracking-tight">{b.name}</div>
                    {b.message && (
                      <div className="text-[12px] text-[var(--muted)] mt-1 leading-relaxed">{b.message}</div>
                    )}
                  </td>
                  {/* Contacto */}
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex flex-col gap-1">
                      <a href={`mailto:${b.email}`} className="flex items-center gap-1.5 text-[13px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition">
                        <Mail className="w-3.5 h-3.5" /> {b.email}
                      </a>
                      {b.phone && (
                        <a href={`tel:${b.phone}`} className="flex items-center gap-1.5 text-[13px] text-[var(--muted)] hover:text-[var(--ink)] transition">
                          <Phone className="w-3.5 h-3.5" /> {b.phone}
                        </a>
                      )}
                    </div>
                  </td>
                  {/* Viagem */}
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-[13px] text-[var(--ink-soft)]">{b.package?.title ?? "—"}</span>
                  </td>
                  {/* Pax */}
                  <td className="p-4 hidden xl:table-cell text-[var(--muted)] text-[13px]">
                    {b.pax_count} pax
                  </td>
                  {/* Data */}
                  <td className="p-4 hidden sm:table-cell text-[var(--muted)] text-[13px] whitespace-nowrap">
                    {fmtDate(b.created_at)}
                  </td>
                  {/* Estado */}
                  <td className="p-4">
                    <div className="relative inline-block">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === b.id ? null : b.id); }}
                        className="flex items-center gap-1"
                      >
                        <Pill className={st?.cls}>{st?.label ?? b.status}</Pill>
                        <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)]" />
                      </button>
                      {openMenu === b.id && (
                        <div className="absolute left-0 top-8 z-20 bg-white border border-[var(--line)] rounded-xl shadow-lg py-1 min-w-[148px]">
                          {(Object.entries(BOOKING_STATUS) as [BookingStatus, { label: string; cls: string }][]).map(([val, cfg]) => (
                            <button
                              key={val}
                              onClick={() => updateStatus(b.id, val)}
                              className="w-full text-left px-4 py-2 text-[13px] hover:bg-[var(--cream-2)] flex items-center gap-2"
                            >
                              <Pill className={`${cfg.cls} !text-[11px]`}>{cfg.label}</Pill>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Totals footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-[var(--line)] bg-[var(--cream)]/40 text-[12px] text-[var(--muted)] tracking-tight flex gap-6">
            <span>{filtered.length} pedido{filtered.length !== 1 ? "s" : ""}</span>
            <span>{filtered.filter(b => b.status === "pending").length} novos</span>
            <span>{filtered.filter(b => b.status === "confirmed").length} confirmados</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── Edit form */
type ItineraryRow = { day_label: string; title: string; description: string };

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function EditForm({ trip, onBack, onSaved }: { trip: TravelPackageCard | null; onBack: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title:             trip?.title             ?? "",
    country:           trip?.country           ?? "",
    price_from:        trip?.price_from        ?? 0,
    duration_days:     trip?.duration_days     ?? 7,
    nights:            trip?.nights            ?? 6,
    departure_date:    trip?.departure_date    ?? "",
    return_date:       trip?.return_date       ?? "",
    available_seats:   trip?.available_seats != null ? String(trip.available_seats) : "",
    trip_status:       trip?.trip_status       ?? "disponivel",
    category_id:       (trip?.category_id      ?? null) as string | null,
    short_description: trip?.short_description ?? "",
    long_description:  trip?.long_description  ?? "",
    is_published:      trip?.is_published      ?? false,
    is_featured:       trip?.is_featured       ?? false,
    tag:               trip?.tag               ?? "",
  });

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    createClient()
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => { if (data) setCategories(data as Category[]); });
  }, []);

  const [itinerary, setItinerary] = useState<ItineraryRow[]>([
    { day_label: "Dia 1", title: "", description: "" },
    { day_label: "Dia 2", title: "", description: "" },
  ]);

  const [gallery,      setGallery]      = useState<string[]>([]);

  useEffect(() => {
    if (!trip?.id) return;
    const supabase = createClient();
    supabase
      .from("package_images")
      .select("image_url")
      .eq("package_id", trip.id)
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setGallery(data.map((r) => r.image_url));
        } else if (trip.hero_image_url) {
          setGallery([trip.hero_image_url]);
        }
      });
  }, [trip?.id]);
  const [uploading,    setUploading]    = useState(false);
  const [dragOver,     setDragOver]     = useState(false);
  const [uploadError,  setUploadError]  = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pdfUrl,       setPdfUrl]       = useState(trip?.pdf_url ?? "");
  const [pdfName,      setPdfName]      = useState(() => trip?.pdf_url ? decodeURIComponent(trip.pdf_url.split("/").pop() ?? "documento.pdf") : "");
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfError,     setPdfError]     = useState("");
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");

  async function uploadFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type === "image/webp");
    if (Array.from(files).length > arr.length) {
      setUploadError("Apenas ficheiros .webp são aceites.");
      return;
    }
    setUploadError("");
    if (!arr.length) return;
    setUploading(true);
    setError("");
    try {
      const supabase = createClient();
      const urls: string[] = [];
      for (const file of arr) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `packages/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("package-images").upload(path, file);
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from("package-images").getPublicUrl(path);
        urls.push(publicUrl);
      }
      setGallery((prev) => [...prev, ...urls]);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Erro ao carregar imagem.");
    } finally {
      setUploading(false);
    }
  }

  async function uploadPdf(file: File) {
    if (file.type !== "application/pdf") { setPdfError("Apenas ficheiros PDF são aceites."); return; }
    setPdfError("");
    setPdfUploading(true);
    try {
      const supabase = createClient();
      const path = `pdfs/${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`;
      const { error: upErr } = await supabase.storage.from("package-images").upload(path, file, { contentType: "application/pdf" });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("package-images").getPublicUrl(path);
      setPdfUrl(publicUrl);
      setPdfName(file.name);
    } catch (err: unknown) {
      setPdfError(err instanceof Error ? err.message : "Erro ao carregar PDF.");
    } finally {
      setPdfUploading(false);
    }
  }

  function updateItinerary(i: number, field: keyof ItineraryRow, value: string) {
    setItinerary((prev) => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
  }

  function addItineraryRow() {
    setItinerary((prev) => [
      ...prev,
      { day_label: `Dia ${prev.length + 1}`, title: "", description: "" },
    ]);
  }

  function removeItineraryRow(i: number) {
    setItinerary((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!form.title.trim() || !form.country.trim()) {
      setError("Título e país são obrigatórios.");
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);

    const supabase = createClient();

    const fields = {
      title:             form.title.trim(),
      country:           form.country.trim(),
      duration_days:     form.duration_days,
      nights:            form.nights,
      price_from:        form.price_from,
      short_description: form.short_description.trim() || null,
      long_description:  form.long_description.trim()  || null,
      departure_date:    form.departure_date || null,
      return_date:       form.return_date    || null,
      available_seats:   form.available_seats !== "" ? Number(form.available_seats) : null,
      trip_status:       form.trip_status || null,
      category_id:       form.category_id || null,
      pdf_url:           pdfUrl || null,
      is_published:      form.is_published,
      is_featured:       form.is_featured,
      tag:               form.tag || null,
      hero_image_url:    gallery[0] ?? null,
    };

    try {
      let packageId: string;

      if (trip?.id) {
        // ── Update existing trip ──────────────────────────────
        const { error: dbError } = await supabase
          .from("travel_packages")
          .update(fields)
          .eq("id", trip.id);
        if (dbError) throw dbError;
        packageId = trip.id;

        // Sync images: replace all
        await supabase.from("package_images").delete().eq("package_id", packageId);
        if (gallery.length > 0) {
          await supabase.from("package_images").insert(
            gallery.map((url, i) => ({ package_id: packageId, image_url: url, sort_order: i }))
          );
        }
      } else {
        // ── Insert new trip ───────────────────────────────────
        const { data, error: dbError } = await supabase
          .from("travel_packages")
          .insert({ slug: generateSlug(form.title), ...fields })
          .select("id")
          .single();
        if (dbError) throw dbError;
        packageId = data.id;

        if (gallery.length > 0) {
          await supabase.from("package_images").insert(
            gallery.map((url, i) => ({ package_id: packageId, image_url: url, sort_order: i }))
          );
        }

        // Save itinerary (only on create)
        const validRows = itinerary.filter((it) => it.title.trim());
        if (validRows.length > 0) {
          const { error: itError } = await supabase.from("package_itinerary").insert(
            validRows.map((it, i) => ({
              package_id:  packageId,
              day_label:   it.day_label,
              title:       it.title.trim(),
              description: it.description.trim(),
              sort_order:  i,
            }))
          );
          if (itError) throw itError;
        }
      }

      setSaved(true);
      setTimeout(() => { setSaved(false); onSaved(); }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao guardar.");
    } finally {
      setSaving(false);
    }
  }

  const TAGS = ["Bestseller", "Editor's pick", "Novo", "Lua de mel", "Edição limitada"];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={onBack}
            className="text-[13px] text-[var(--muted)] hover:text-[var(--ink)] inline-flex items-center gap-1.5 tracking-tight transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar a viagens
          </button>
          <h1 className="font-display text-[36px] tracking-tight mt-2">
            {trip ? "Editar viagem" : "Nova viagem"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <span className="text-[13px] text-red-600 tracking-tight">{error}</span>
          )}
          {saved && (
            <span className="text-[13px] text-emerald-700 tracking-tight">Guardado ✓</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] text-[var(--cream)] px-5 py-2.5 text-[14px] tracking-tight hover:bg-[var(--ink-soft)] transition disabled:opacity-50"
          >
            {saving ? "A guardar…" : "Guardar alterações"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-[var(--line)] p-7">
            <h3 className="font-display text-[20px] tracking-tight mb-1">Informação base</h3>
            <p className="text-[13px] text-[var(--muted)] mb-6 tracking-tight">Os campos visíveis no catálogo.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">Título</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Amalfi Coast — Slow Mediterranean Summer"
                  className="w-full rounded-xl bg-white border border-[var(--line-2)] px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--ink)]"
                />
                {form.title && (
                  <p className="mt-1.5 text-[11px] text-[var(--muted)] tracking-tight">
                    slug: <span className="font-mono">{generateSlug(form.title)}</span>
                  </p>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">País</label>
                  <input
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="Itália"
                    className="w-full rounded-xl bg-white border border-[var(--line-2)] px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">Preço base (€)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.price_from}
                    onChange={(e) => setForm({ ...form, price_from: +e.target.value })}
                    className="w-full rounded-xl bg-white border border-[var(--line-2)] px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--ink)]"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">Duração (dias)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.duration_days}
                    onChange={(e) => setForm({ ...form, duration_days: +e.target.value, nights: Math.max(1, +e.target.value - 1) })}
                    className="w-full rounded-xl bg-white border border-[var(--line-2)] px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">Noites</label>
                  <input
                    type="number"
                    min={1}
                    value={form.nights}
                    onChange={(e) => setForm({ ...form, nights: +e.target.value })}
                    className="w-full rounded-xl bg-white border border-[var(--line-2)] px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--ink)]"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">Data de partida</label>
                  <input
                    type="date"
                    value={form.departure_date}
                    onChange={(e) => setForm({ ...form, departure_date: e.target.value })}
                    className="w-full rounded-xl bg-white border border-[var(--line-2)] px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">Data de regresso</label>
                  <input
                    type="date"
                    value={form.return_date}
                    min={form.departure_date || undefined}
                    onChange={(e) => setForm({ ...form, return_date: e.target.value })}
                    className="w-full rounded-xl bg-white border border-[var(--line-2)] px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--ink)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">Descrição curta</label>
                <textarea
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                  rows={3}
                  placeholder="Uma frase que captura a essência da viagem..."
                  className="w-full rounded-xl bg-white border border-[var(--line-2)] px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--ink)] resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">Descrição longa</label>
                <textarea
                  value={form.long_description}
                  onChange={(e) => setForm({ ...form, long_description: e.target.value })}
                  rows={5}
                  placeholder="Descrição completa da viagem..."
                  className="w-full rounded-xl bg-white border border-[var(--line-2)] px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--ink)] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="bg-white rounded-2xl border border-[var(--line)] p-7">
            <h3 className="font-display text-[20px] tracking-tight mb-1">Galeria</h3>
            <p className="text-[13px] text-[var(--muted)] tracking-tight">
              A primeira imagem será a principal · 4:3 ou 16:9 · 2000px+ recomendado.
            </p>

            {uploadError && (
              <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-[13px] text-red-700 tracking-tight">
                {uploadError}
              </div>
            )}

            <div className="mt-6" />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/webp"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) uploadFiles(e.target.files); e.target.value = ""; }}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {gallery.map((url, i) => (
                <div key={url} className="aspect-square rounded-xl bg-[var(--cream-2)] border border-[var(--line)] overflow-hidden relative group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <div className="absolute top-2 left-2 bg-[var(--ink)] text-[var(--cream)] text-[10px] px-2 py-0.5 rounded-full tracking-tight">
                      Principal
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setGallery((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[var(--clay-dark)]" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files); }}
                disabled={uploading}
                className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition disabled:opacity-50 ${
                  dragOver ? "border-[var(--ink)] bg-[var(--cream-2)]" : "border-[var(--line-2)] hover:border-[var(--ink)] hover:bg-[var(--cream)]"
                }`}
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-[var(--line-2)] border-t-[var(--ink)] rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-[var(--muted)]" strokeWidth={1.5} />
                    <span className="text-[12px] text-[var(--muted)] tracking-tight">Carregar</span>
                    <span className="text-[10px] text-[var(--muted)] tracking-tight opacity-60">ou arrastar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* PDF */}
          <div className="bg-white rounded-2xl border border-[var(--line)] p-7">
            <h3 className="font-display text-[20px] tracking-tight mb-1">Ficha da viagem (PDF)</h3>
            <p className="text-[13px] text-[var(--muted)] mb-5 tracking-tight">
              Documento descarregável visível na página da viagem.
            </p>
            {pdfError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-[13px] text-red-700 tracking-tight">
                {pdfError}
              </div>
            )}
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) uploadPdf(e.target.files[0]); e.target.value = ""; }}
            />
            {pdfUrl ? (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--line)] bg-[var(--cream-2)]">
                <FileText className="w-8 h-8 text-[var(--clay)] flex-shrink-0" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium tracking-tight truncate">{pdfName || "documento.pdf"}</div>
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] text-[var(--muted)] hover:text-[var(--ink)] transition">
                    Abrir PDF →
                  </a>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => pdfInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg border border-[var(--line-2)] text-[12px] hover:border-[var(--ink)] transition tracking-tight"
                  >
                    Substituir
                  </button>
                  <button
                    onClick={() => { setPdfUrl(""); setPdfName(""); }}
                    className="p-2 rounded-lg hover:bg-red-50 text-[var(--muted)] hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => pdfInputRef.current?.click()}
                disabled={pdfUploading}
                className="w-full rounded-xl border-2 border-dashed border-[var(--line-2)] hover:border-[var(--ink)] py-8 flex flex-col items-center gap-2 transition disabled:opacity-50"
              >
                {pdfUploading ? (
                  <div className="w-5 h-5 border-2 border-[var(--line-2)] border-t-[var(--ink)] rounded-full animate-spin" />
                ) : (
                  <>
                    <FileText className="w-7 h-7 text-[var(--muted)]" strokeWidth={1.5} />
                    <span className="text-[13px] text-[var(--muted)] tracking-tight">Carregar PDF</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Itinerary */}
          <div className="bg-white rounded-2xl border border-[var(--line)] p-7">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display text-[20px] tracking-tight">Itinerário</h3>
              <button
                onClick={addItineraryRow}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line-2)] hover:border-[var(--ink)] px-3 py-1.5 text-[12px] tracking-tight transition"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar dia
              </button>
            </div>
            <p className="text-[13px] text-[var(--muted)] mb-6 tracking-tight">
              Etapas do programa visíveis na página de detalhe.
            </p>
            <div className="space-y-3">
              {itinerary.map((it, i) => (
                <div key={i} className="p-4 rounded-xl border border-[var(--line)] flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-full bg-[var(--cream-2)] flex items-center justify-center font-display text-[14px] flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="grid sm:grid-cols-[120px_1fr] gap-2">
                      <input
                        value={it.day_label}
                        onChange={(e) => updateItinerary(i, "day_label", e.target.value)}
                        placeholder="Dia 1–2"
                        className="bg-[var(--cream-2)] rounded-lg px-3 py-1.5 text-[12px] text-[var(--muted)] focus:outline-none"
                      />
                      <input
                        value={it.title}
                        onChange={(e) => updateItinerary(i, "title", e.target.value)}
                        placeholder="Título da etapa"
                        className="w-full bg-transparent text-[14px] font-medium focus:outline-none border-b border-transparent focus:border-[var(--line-2)]"
                      />
                    </div>
                    <textarea
                      value={it.description}
                      onChange={(e) => updateItinerary(i, "description", e.target.value)}
                      placeholder="Descrição..."
                      rows={2}
                      className="w-full bg-transparent text-[13px] text-[var(--muted)] focus:outline-none resize-none"
                    />
                  </div>
                  <button
                    onClick={() => removeItineraryRow(i)}
                    className="p-2 rounded-lg hover:bg-red-50 text-[var(--muted)] hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: publication + tag + AI */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[var(--line)] p-7">
            <h3 className="font-display text-[20px] tracking-tight mb-1">Categoria</h3>
            <p className="text-[13px] text-[var(--muted)] mb-4 tracking-tight">Tipo de viagem.</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setForm((f) => ({ ...f, category_id: f.category_id === cat.id ? null : cat.id }))}
                  className={`px-3 py-1.5 rounded-full border text-[12px] tracking-tight transition ${
                    form.category_id === cat.id
                      ? "bg-[var(--ink)] text-[var(--cream)] border-[var(--ink)]"
                      : "border-[var(--line-2)] hover:border-[var(--ink)]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
              {categories.length === 0 && (
                <p className="text-[12px] text-[var(--muted)] tracking-tight">A carregar categorias…</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[var(--line)] p-7">
            <h3 className="font-display text-[20px] tracking-tight mb-1">Publicação</h3>
            <p className="text-[13px] text-[var(--muted)] mb-6 tracking-tight">Visibilidade da viagem.</p>
            <div className="space-y-3">
              <button
                onClick={() => setForm((f) => ({ ...f, is_published: !f.is_published }))}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--line)] cursor-pointer"
              >
                <span className="text-[14px]">Publicada</span>
                <span className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors ${form.is_published ? "bg-[var(--ink)]" : "bg-[var(--cream-2)]"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.is_published ? "right-0.5" : "left-0.5 border border-[var(--line-2)]"}`} />
                </span>
              </button>
              <button
                onClick={() => setForm((f) => ({ ...f, is_featured: !f.is_featured }))}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--line)] cursor-pointer"
              >
                <span className="text-[14px]">Em destaque</span>
                <span className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors ${form.is_featured ? "bg-[var(--ink)]" : "bg-[var(--cream-2)]"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.is_featured ? "right-0.5" : "left-0.5 border border-[var(--line-2)]"}`} />
                </span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[var(--line)] p-7">
            <h3 className="font-display text-[20px] tracking-tight mb-1">Disponibilidade</h3>
            <p className="text-[13px] text-[var(--muted)] mb-4 tracking-tight">Estado e lugares disponíveis.</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {([
                { v: "disponivel",      l: "Disponível",      cls: "border-emerald-300 text-emerald-800 bg-emerald-50" },
                { v: "ultimos_lugares", l: "Últimos lugares", cls: "border-amber-300 text-amber-800 bg-amber-50" },
                { v: "esgotado",        l: "Esgotado",        cls: "border-red-300 text-red-700 bg-red-50" },
                { v: "em_breve",        l: "Em breve",        cls: "border-[var(--line-2)] text-[var(--ink)]" },
              ] as const).map(({ v, l, cls }) => (
                <button
                  key={v}
                  onClick={() => setForm((f) => ({ ...f, trip_status: v }))}
                  className={`px-3 py-2 rounded-xl border text-[12px] tracking-tight transition text-center ${
                    form.trip_status === v ? cls + " font-medium" : "border-[var(--line-2)] text-[var(--muted)] hover:border-[var(--ink)]"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">Lugares disponíveis</label>
              <input
                type="number"
                min={0}
                value={form.available_seats}
                onChange={(e) => setForm((f) => ({ ...f, available_seats: e.target.value }))}
                placeholder="Sem limite"
                className="w-full rounded-xl bg-white border border-[var(--line-2)] px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[var(--line)] p-7">
            <h3 className="font-display text-[20px] tracking-tight mb-1">Tag</h3>
            <p className="text-[13px] text-[var(--muted)] mb-4 tracking-tight">Etiqueta destacada no card.</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setForm((f) => ({ ...f, tag: f.tag === tag ? "" : tag }))}
                  className={`px-3 py-1.5 rounded-full border text-[12px] tracking-tight transition ${
                    form.tag === tag
                      ? "bg-[var(--ink)] text-[var(--cream)] border-[var(--ink)]"
                      : "border-[var(--line-2)] hover:border-[var(--ink)]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[var(--ink)] text-[var(--cream)] rounded-2xl p-7">
            <Sparkles className="w-5 h-5 mb-4" />
            <h3 className="font-display text-[20px] tracking-tight">Sugerir com IA</h3>
            <p className="text-[13px] text-white/65 mt-2 leading-relaxed">
              Gerar descrição, itinerário e tags a partir do título.
            </p>
            <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--clay)] hover:bg-[var(--clay-dark)] text-white px-4 py-2 text-[13px] tracking-tight transition">
              Gerar conteúdo →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}