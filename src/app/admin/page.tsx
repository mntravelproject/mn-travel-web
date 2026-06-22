"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard, Plane, Plus, Edit3, Trash2, Bell, TrendingUp,
  Search, ArrowLeft, Calendar, Users, Settings, LogOut, X,
  Upload, Image as ImageIcon, Sparkles, Copy, FileText, Download, Phone, Mail, ChevronDown,
  MessageSquare, CheckCircle, UserCircle, UserPlus, Globe,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { GroupsView } from "./GroupsView";
import type { TravelPackageCard, Category } from "@/types/database";
import { formatPrice, formatTripDate } from "@/lib/utils";
import { Pill } from "@/components/ui/Pill";

type View = "dashboard" | "trips" | "edit" | "bookings" | "quotes" | "clients" | "groups" | "users" | "settings";

const NAV = [
  { id: "dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { id: "groups",    label: "Viagens",    icon: Plane },
  { id: "bookings",  label: "Pedidos de reserva", icon: Calendar },
  { id: "quotes",    label: "Orçamentos", icon: MessageSquare },
  { id: "trips",     label: "Destinos",   icon: Globe },
  { id: "clients",   label: "Clientes",   icon: Users },
  { id: "users",     label: "Equipa",     icon: Users },
  { id: "settings",  label: "Definições", icon: Settings },
];

// ─── Dashboard types ──────────────────────────────────────────────────────────
type BookingRow = {
  id: string; name: string; email: string; phone: string | null;
  package_id: string | null; created_at: string; status: string; pax_count: number;
  package: { title: string; country: string; price_from: number } | null;
};
type DashboardData = {
  revenueThisMonth:  number;
  revenueLastMonth:  number;
  activeBookings:    number;
  bookingsThisMonth: number;
  bookingsLastMonth: number;
  contactsThisMonth: number;
  contactsLastMonth: number;
  conversionRate:    number;
  conversionLast:    number;
  pendingCount:      number;
  recentBookings:    BookingRow[];
  topCountries:      { name: string; count: number; pct: number }[];
  monthlyChart:      { month: string; revenue: number; pct: number }[];
};

function relDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (hours < 1)  return "Agora";
  if (hours < 24) return `Hoje, ${new Date(iso).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}`;
  if (days  === 1) return "Ontem";
  if (days  < 7)  return `${days} dias atrás`;
  return new Date(iso).toLocaleDateString("pt-PT");
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:   { label: "Pendente",    cls: "!bg-amber-50 !text-amber-800 !border-amber-200" },
  contacted: { label: "Contactado",  cls: "!bg-blue-50 !text-blue-800 !border-blue-200" },
  confirmed: { label: "Confirmado",  cls: "!bg-[var(--cream-2)]" },
  cancelled: { label: "Cancelado",   cls: "!bg-red-50 !text-red-700 !border-red-200" },
};

export default function AdminPage() {
  const router = useRouter();
  const [view,        setView]       = useState<View>("dashboard");
  const [trips,       setTrips]      = useState<TravelPackageCard[]>([]);
  const [refreshKey,  setRefreshKey] = useState(0);
  const [editId,         setEditId]        = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [search,         setSearch]         = useState("");
  const [userName,       setUserName]       = useState("");
  const [bookingsBadge,  setBookingsBadge]  = useState(0);
  const [quotesBadge,    setQuotesBadge]    = useState(0);

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
    // Badge: reservas por tratar
    supabase
      .from("booking_requests")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "contacted"])
      .then(({ count }) => setBookingsBadge(count ?? 0));
    // Badge: orçamentos por responder
    supabase
      .from("contact_requests")
      .select("id", { count: "exact", head: true })
      .eq("type", "orcamento")
      .eq("status", "novo")
      .then(({ count }) => setQuotesBadge(count ?? 0));
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

    if (error) { console.error("Erro ao duplicar destino:", error.message); return; }
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
              {NAV.map(({ id, label, icon: Icon }) => {
                const isActive = view === id;
                const badge = id === "bookings" && bookingsBadge > 0 ? bookingsBadge
                           : id === "quotes"   && quotesBadge   > 0 ? quotesBadge
                           : 0;
                return (
                  <button
                    key={id}
                    onClick={() => setView(id as View)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] tracking-tight transition ${
                      isActive ? "bg-[var(--ink)] text-[var(--cream)]" : "text-[var(--ink-soft)] hover:bg-[var(--cream-2)]"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                    <span className="flex-1 text-left">{label}</span>
                    {badge > 0 && (
                      <span className={`text-[10px] font-semibold px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full shrink-0 ${
                        isActive ? "bg-white/25 text-white" : "bg-amber-500 text-white"
                      }`}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
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
            {view === "bookings" && <BookingsView onBadgeChange={setBookingsBadge} />}
            {view === "quotes"   && <QuotesView onBadgeChange={setQuotesBadge} />}
            {view === "clients"  && <ClientsView />}
            {view === "groups"   && <GroupsView />}
            {view === "users"    && <UsersView />}
            {!["dashboard", "trips", "edit", "bookings", "quotes", "clients", "groups", "users"].includes(view) && (
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
        const tripTitle = trips.find((t) => t.id === pendingDeleteId)?.title ?? "este destino";
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setPendingDeleteId(null)} />
            <div className="relative bg-white rounded-2xl border border-[var(--line)] shadow-xl p-8 w-full max-w-sm">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-5">
                <Trash2 className="w-4 h-4 text-red-600" />
              </div>
              <h2 className="font-display text-[22px] tracking-tight mb-2">Apagar destino?</h2>
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
  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const now = new Date();

      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(),     1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const sixMonthsAgo   = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();

      const [
        { data: allBookingsRaw },
        { data: paymentsAllRaw },
        { count: contactsThisMonth },
        { count: contactsLastMonth },
        { data: recentRaw },
      ] = await Promise.all([
        // All booking requests: status + created_at + country for stats, chart, top countries
        supabase.from("booking_requests")
          .select("id, status, created_at, package:travel_packages(country)"),
        // All trip payments since 6 months ago: for revenue stat + revenue chart
        supabase.from("trip_payments")
          .select("amount, payment_date")
          .gte("payment_date", sixMonthsAgo),
        // Contacts this month
        supabase.from("contact_requests")
          .select("id", { count: "exact", head: true })
          .gte("created_at", thisMonthStart),
        // Contacts last month
        supabase.from("contact_requests")
          .select("id", { count: "exact", head: true })
          .gte("created_at", lastMonthStart)
          .lt("created_at", thisMonthStart),
        // Recent 10 bookings for table (full join)
        supabase.from("booking_requests")
          .select("id, name, email, phone, package_id, created_at, status, pax_count, package:travel_packages(title, country, price_from)")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const allBookings = (allBookingsRaw ?? []) as {
        id: string; status: string; created_at: string;
        package?: { country?: string } | null;
      }[];
      const payments = (paymentsAllRaw ?? []) as { amount: number; payment_date: string }[];

      // ── 1. Receita este mês / último mês ──────────────────────────
      const revenueThisMonth = payments
        .filter((p) => p.payment_date >= thisMonthStart)
        .reduce((s, p) => s + p.amount, 0);
      const revenueLastMonth = payments
        .filter((p) => p.payment_date >= lastMonthStart && p.payment_date < thisMonthStart)
        .reduce((s, p) => s + p.amount, 0);

      // ── 2. Reservas ativas (total corrente) + este/último mês ─────
      const activeBookings    = allBookings.filter((b) => ["pending", "contacted", "confirmed"].includes(b.status)).length;
      const pendingCount      = allBookings.filter((b) => ["pending", "contacted"].includes(b.status)).length;
      const bookingsThisMonth = allBookings.filter((b) => b.created_at >= thisMonthStart).length;
      const bookingsLastMonth = allBookings.filter((b) => b.created_at >= lastMonthStart && b.created_at < thisMonthStart).length;

      // ── 3. Conversão (all-time vs mês passado) ───────────────────
      const nonCancelled   = allBookings.filter((b) => b.status !== "cancelled");
      const confirmed      = allBookings.filter((b) => b.status === "confirmed");
      const conversionRate = nonCancelled.length > 0 ? (confirmed.length / nonCancelled.length) * 100 : 0;

      const lastMonthBks   = allBookings.filter((b) => b.created_at >= lastMonthStart && b.created_at < thisMonthStart);
      const lmNonCancelled = lastMonthBks.filter((b) => b.status !== "cancelled");
      const lmConfirmed    = lastMonthBks.filter((b) => b.status === "confirmed");
      const conversionLast = lmNonCancelled.length > 0
        ? (lmConfirmed.length / lmNonCancelled.length) * 100
        : conversionRate;

      // ── 4. Top países (a partir das reservas) ────────────────────
      const countryCounts: Record<string, number> = {};
      for (const b of allBookings) {
        const country = b.package?.country;
        if (country) countryCounts[country] = (countryCounts[country] ?? 0) + 1;
      }
      const maxC = Math.max(...Object.values(countryCounts), 1);
      const topCountries = Object.entries(countryCounts)
        .sort(([, a], [, b]) => b - a).slice(0, 4)
        .map(([name, count]) => ({ name, count, pct: Math.round((count / maxC) * 100) }));

      // ── 5. Gráfico de receita mensal (últimos 6 meses) ───────────
      const monthKeys:   string[] = [];
      const monthLabels: string[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
        monthLabels.push(d.toLocaleDateString("pt-PT", { month: "short" }));
      }
      const monthlyRevenue: Record<string, number> = Object.fromEntries(monthKeys.map((k) => [k, 0]));
      for (const p of payments) {
        const d = new Date(p.payment_date + "T00:00:00");
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (k in monthlyRevenue) monthlyRevenue[k] += p.amount;
      }
      const maxR = Math.max(...Object.values(monthlyRevenue), 1);
      const monthlyChart = monthKeys.map((k, i) => ({
        month:   monthLabels[i],
        revenue: monthlyRevenue[k],
        pct:     Math.max(4, Math.round((monthlyRevenue[k] / maxR) * 100)),
      }));

      setData({
        revenueThisMonth, revenueLastMonth,
        activeBookings, bookingsThisMonth, bookingsLastMonth, pendingCount,
        contactsThisMonth: contactsThisMonth ?? 0,
        contactsLastMonth: contactsLastMonth ?? 0,
        conversionRate, conversionLast,
        recentBookings: (recentRaw ?? []) as BookingRow[],
        topCountries:   topCountries.length ? topCountries : [],
        monthlyChart,
      });
      setLoading(false);
    }
    load();
  }, []);

  const sk = "animate-pulse bg-[var(--cream-2)] rounded-xl";
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 w-64 rounded-xl bg-[var(--cream-2)] animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map((i) => <div key={i} className={`${sk} h-36`} />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className={`${sk} lg:col-span-2 h-64`} />
          <div className={`${sk} h-64`} />
        </div>
        <div className={`${sk} h-64`} />
      </div>
    );
  }

  const d = data!;
  const fmtEur = (n: number) => n.toLocaleString("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const pct    = (a: number, b: number) => b > 0 ? ((a - b) / b * 100).toFixed(1) : null;
  const sign   = (n: number) => n >= 0 ? `+${n}` : String(n);

  const revChangePct = pct(d.revenueThisMonth, d.revenueLastMonth);
  const cntChangePct = pct(d.contactsThisMonth, d.contactsLastMonth);
  const bkDelta      = d.bookingsThisMonth - d.bookingsLastMonth;
  const convDelta    = (d.conversionRate - d.conversionLast).toFixed(1);

  const stats = [
    {
      l: "Receita este mês",
      v: fmtEur(d.revenueThisMonth),
      d: revChangePct ? `${Number(revChangePct) >= 0 ? "+" : ""}${revChangePct}%` : "—",
      up: d.revenueThisMonth >= d.revenueLastMonth,
    },
    {
      l: "Reservas ativas",
      v: String(d.activeBookings),
      d: `${sign(bkDelta)} este mês`,
      up: bkDelta >= 0,
    },
    {
      l: "Novas consultas",
      v: String(d.contactsThisMonth),
      d: cntChangePct ? `${Number(cntChangePct) >= 0 ? "+" : ""}${cntChangePct}%` : "—",
      up: d.contactsThisMonth >= d.contactsLastMonth,
    },
    {
      l: "Conversão",
      v: `${d.conversionRate.toFixed(1)}%`,
      d: `${Number(convDelta) >= 0 ? "+" : ""}${convDelta}%`,
      up: d.conversionRate >= d.conversionLast,
    },
  ];

  const topDest = d.topCountries[0];

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
            {d.pendingCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--clay)]" />
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.l} className="bg-white rounded-2xl p-6 border border-[var(--line)]">
            <div className="text-[12px] uppercase tracking-[0.16em] text-[var(--muted)]">{s.l}</div>
            <div className="mt-3 font-display text-[32px] leading-none tracking-tight">{s.v}</div>
            <div className={`mt-3 text-[12px] inline-flex items-center gap-1 tracking-tight ${s.up ? "text-emerald-700" : "text-[var(--clay-dark)]"}`}>
              <TrendingUp className={`w-3.5 h-3.5 shrink-0 ${!s.up ? "rotate-180" : ""}`} />
              {s.d}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + top destination */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[var(--line)]">
          <div className="mb-6">
            <h3 className="font-display text-[22px] tracking-tight">Receita · últimos 6 meses</h3>
            <p className="text-[12px] text-[var(--muted)] tracking-tight mt-0.5">Pagamentos recebidos em grupos</p>
          </div>
          <div className="h-52 flex items-end gap-3">
            {d.monthlyChart.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full flex flex-col items-center">
                  {m.revenue > 0 && (
                    <span className="absolute -top-6 text-[10px] text-[var(--muted)] opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                      {fmtEur(m.revenue)}
                    </span>
                  )}
                  <div
                    className="w-full bg-gradient-to-t from-[var(--ink)] to-[var(--ink-soft)] rounded-t-lg transition-all"
                    style={{ height: `${m.pct}%` }}
                  />
                </div>
                <div className="text-[11px] text-[var(--muted)] tracking-tight capitalize">{m.month}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--ink)] text-[var(--cream)] rounded-2xl p-6">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/50">Top destino</div>
          {topDest ? (
            <>
              <div className="mt-2 font-display text-[28px]">{topDest.name}</div>
              <div className="mt-1 text-[13px] text-white/65 tracking-tight">
                {Math.round(topDest.pct)}% das reservas
              </div>
            </>
          ) : (
            <div className="mt-2 font-display text-[22px] text-white/40">Sem dados</div>
          )}
          <div className="mt-6 space-y-3 text-[13px]">
            {d.topCountries.map((r) => (
              <div key={r.name}>
                <div className="flex justify-between mb-1.5 text-white/75 tracking-tight">
                  <span>{r.name}</span><span>{r.count} reserva{r.count !== 1 ? "s" : ""}</span>
                </div>
                <div className="h-1 bg-white/15 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--clay)] rounded-full" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
            {d.topCountries.length === 0 && (
              <p className="text-white/40 text-[12px]">Ainda sem reservas com destino associado.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bookings table */}
      <div className="bg-white rounded-2xl border border-[var(--line)] overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-[var(--line)]">
          <h3 className="font-display text-[22px] tracking-tight">Pedidos de reserva recentes</h3>
          <button onClick={() => onNavigate("bookings")} className="text-[13px] tracking-tight link-underline">
            Ver todas →
          </button>
        </div>
        {d.recentBookings.length === 0 ? (
          <div className="py-16 text-center text-[14px] text-[var(--muted)]">Nenhuma reserva ainda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] border-b border-[var(--line)]">
                  {["Cliente", "Viagem", "Data", "Estado", "Pax", "Estimativa"].map((h, i) => (
                    <th key={h} className={`font-medium p-4 ${i >= 4 ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.recentBookings.map((r) => {
                  const st  = STATUS_MAP[r.status] ?? { label: r.status, cls: "" };
                  const est = r.package ? r.pax_count * r.package.price_from : null;
                  return (
                    <tr key={r.id} className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--cream)]/50">
                      <td className="p-4 font-medium tracking-tight">
                        <div>{r.name}</div>
                        {r.email && <div className="text-[12px] text-[var(--muted)] font-normal">{r.email}</div>}
                      </td>
                      <td className="p-4 text-[var(--ink-soft)]">{r.package?.title ?? <span className="text-[var(--muted)]">—</span>}</td>
                      <td className="p-4 text-[var(--muted)] tracking-tight whitespace-nowrap">{relDate(r.created_at)}</td>
                      <td className="p-4"><Pill className={st.cls}>{st.label}</Pill></td>
                      <td className="p-4 text-right text-[var(--muted)]">{r.pax_count}</td>
                      <td className="p-4 text-right font-medium tracking-tight">
                        {est != null
                          ? fmtEur(est)
                          : <span className="text-[var(--muted)]">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── Table helpers */
const PER_PAGE = 10;

type SortState = { key: string; dir: "asc" | "desc" };

function getVal(obj: Record<string, unknown>, key: string): unknown {
  return key.split(".").reduce((o, k) => (o as Record<string, unknown>)?.[k], obj as unknown);
}

function applySortFilter<T extends Record<string, unknown>>(
  items: T[],
  sort: SortState | null,
): T[] {
  if (!sort) return items;
  return [...items].sort((a, b) => {
    const av = getVal(a, sort.key) ?? "";
    const bv = getVal(b, sort.key) ?? "";
    let cmp = 0;
    if (typeof av === "boolean" && typeof bv === "boolean") {
      cmp = Number(av) - Number(bv);
    } else if (typeof av === "number" && typeof bv === "number") {
      cmp = av - bv;
    } else {
      cmp = String(av).localeCompare(String(bv), "pt");
    }
    return sort.dir === "asc" ? cmp : -cmp;
  });
}

function Th({
  label, field, sort, onSort, className = "",
}: {
  label: string; field: string; sort: SortState | null;
  onSort: (k: string) => void; className?: string;
}) {
  const active = sort?.key === field;
  return (
    <th
      onClick={() => onSort(field)}
      className={`text-left font-medium p-4 cursor-pointer select-none group hover:text-[var(--ink)] ${className}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={`text-[10px] transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}>
          {active && sort?.dir === "desc" ? "↓" : "↑"}
        </span>
      </span>
    </th>
  );
}

function Pagination({
  page, total, count, onPage,
}: {
  page: number; total: number; count: number; onPage: (p: number) => void;
}) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--line)] bg-[var(--cream)]/40 text-[12px] text-[var(--muted)]">
      <span>{count} resultado{count !== 1 ? "s" : ""} · Página {page} de {total}</span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onPage(1)}
          className="px-2 py-1 rounded-lg hover:bg-[var(--line)] disabled:opacity-30 disabled:cursor-not-allowed transition"
        >«</button>
        <button
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          className="px-3 py-1 rounded-lg hover:bg-[var(--line)] disabled:opacity-30 disabled:cursor-not-allowed transition"
        >Anterior</button>
        {Array.from({ length: total }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === total || Math.abs(p - page) <= 1)
          .reduce<(number | "…")[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "…" ? (
              <span key={`e${i}`} className="px-2">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPage(p as number)}
                className={`w-8 h-8 rounded-lg text-[12px] transition ${
                  page === p
                    ? "bg-[var(--ink)] text-[var(--cream)]"
                    : "hover:bg-[var(--line)]"
                }`}
              >{p}</button>
            )
          )}
        <button
          disabled={page === total}
          onClick={() => onPage(page + 1)}
          className="px-3 py-1 rounded-lg hover:bg-[var(--line)] disabled:opacity-30 disabled:cursor-not-allowed transition"
        >Próxima</button>
        <button
          disabled={page === total}
          onClick={() => onPage(total)}
          className="px-2 py-1 rounded-lg hover:bg-[var(--line)] disabled:opacity-30 disabled:cursor-not-allowed transition"
        >»</button>
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
  const [sort, setSort] = useState<SortState | null>({ key: "title", dir: "asc" });
  const [page, setPage] = useState(1);
  const [seatsByPackage, setSeatsByPackage] = useState<Record<string, number>>({});

  useEffect(() => {
    createClient()
      .from("booking_requests")
      .select("package_id, pax_count")
      .eq("status", "confirmed")
      .then(({ data }) => {
        const map: Record<string, number> = {};
        for (const b of data ?? []) {
          if (b.package_id) map[b.package_id] = (map[b.package_id] ?? 0) + (b.pax_count as number);
        }
        setSeatsByPackage(map);
      });
  }, []);

  const filtered = trips.filter(
    (t) =>
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.country.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = applySortFilter(filtered as unknown as Record<string, unknown>[], sort) as unknown as typeof filtered;
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function onSort(key: string) {
    setSort((s) => s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
    setPage(1);
  }

  useEffect(() => { setPage(1); }, [search]);

  const thBase = "text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] border-b border-[var(--line)] bg-[var(--cream)]/40";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-[36px] tracking-tight">Destinos</h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">Gerir todos os destinos do catálogo MN.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[var(--line)] rounded-full px-4 py-2">
            <Search className="w-4 h-4 text-[var(--muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Procurar destinos..."
              className="bg-transparent text-[13px] focus:outline-none w-44"
            />
          </div>
          <button
            onClick={onNew}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] text-[var(--cream)] px-5 py-2.5 text-[14px] tracking-tight hover:bg-[var(--ink-soft)] transition"
          >
            <Plus className="w-4 h-4" /> Novo destino
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--line)] overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className={thBase}>
              <Th label="Destino"  field="title"          sort={sort} onSort={onSort} className="rounded-tl-2xl" />
              <Th label="País"     field="country"        sort={sort} onSort={onSort} className="hidden lg:table-cell" />
              <Th label="Duração"  field="duration_days"  sort={sort} onSort={onSort} className="hidden md:table-cell" />
              <Th label="Partida"  field="departure_date" sort={sort} onSort={onSort} className="hidden xl:table-cell" />
              <Th label="Preço"    field="price_from"     sort={sort} onSort={onSort} />
              <Th label="Lugares"  field="available_seats" sort={sort} onSort={onSort} className="hidden lg:table-cell" />
              <Th label="Estado"   field="is_published"   sort={sort} onSort={onSort} className="hidden lg:table-cell" />
              <th className="text-right font-medium p-4 w-12 rounded-tr-2xl">·</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr><td colSpan={8} className="p-12 text-center text-[var(--muted)] text-[13px]">Nenhum destino encontrado.</td></tr>
            )}
            {paged.map((t) => (
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
                      {t.return_date && <span className="text-[var(--muted)]"> → {formatTripDate(t.return_date)}</span>}
                    </div>
                  ) : <span className="text-[var(--muted)] text-[13px]">—</span>}
                </td>
                <td className="p-4 font-medium tracking-tight">{formatPrice(t.price_from)}</td>
                <td className="p-4 hidden lg:table-cell">
                  {t.available_seats != null ? (() => {
                    const taken = seatsByPackage[t.id] ?? 0;
                    const total = t.available_seats;
                    const pct   = Math.min(100, Math.round((taken / total) * 100));
                    const color = taken >= total ? "bg-red-500" : taken >= total * 0.8 ? "bg-amber-500" : "bg-emerald-500";
                    const textColor = taken >= total ? "text-red-600 font-semibold" : taken >= total * 0.8 ? "text-amber-700" : "text-[var(--ink)]";
                    return (
                      <div>
                        <div className={`text-[13px] tracking-tight ${textColor}`}>
                          {taken}<span className="text-[var(--muted)] font-normal">/{total}</span>
                        </div>
                        <div className="h-1 w-20 bg-[var(--cream-2)] rounded-full mt-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })() : <span className="text-[var(--muted)] text-[13px]">—</span>}
                </td>
                <td className="p-4 hidden lg:table-cell">
                  {t.is_published ? (
                    <Pill className="!bg-emerald-50 !text-emerald-800 !border-emerald-200">Publicada</Pill>
                  ) : (
                    <Pill className="!bg-[var(--cream-2)] !text-[var(--muted)] !border-[var(--line)]">Rascunho</Pill>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button onClick={() => onEdit(t.id)} className="p-2 rounded-lg hover:bg-[var(--cream-2)] transition" title="Editar"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => onDuplicate(t.id)} className="p-2 rounded-lg hover:bg-[var(--cream-2)] transition" title="Duplicar"><Copy className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(t.id)} className="p-2 rounded-lg hover:bg-[var(--cream-2)] text-[var(--clay-dark)] transition" title="Apagar"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} total={totalPages} count={sorted.length} onPage={setPage} />
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
  package_id: string | null;
  status: BookingStatus;
  created_at: string;
  package: { title: string; available_seats: number | null } | null;
};

const BOOKING_STATUS: Record<BookingStatus, { label: string; cls: string }> = {
  pending:   { label: "Novo",        cls: "!bg-blue-50 !text-blue-700 !border-blue-200" },
  contacted: { label: "Contactado",  cls: "!bg-amber-50 !text-amber-700 !border-amber-200" },
  confirmed: { label: "Confirmado",  cls: "!bg-emerald-50 !text-emerald-800 !border-emerald-200" },
  cancelled: { label: "Cancelado",   cls: "!bg-red-50 !text-red-600 !border-red-200" },
};

function BookingsView({ onBadgeChange }: { onBadgeChange?: (n: number) => void }) {
  const [bookings,       setBookings]       = useState<BookingRequest[]>([]);
  const [search,         setSearch]         = useState("");
  const [loading,        setLoading]        = useState(true);
  const [openMenu,       setOpenMenu]       = useState<string | null>(null);
  const [sort,           setSort]           = useState<SortState | null>({ key: "created_at", dir: "desc" });
  const [page,           setPage]           = useState(1);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenu) return;
    const handler = () => setOpenMenu(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openMenu]);

  useEffect(() => {
    createClient()
      .from("booking_requests")
      .select("id, name, email, phone, message, pax_count, package_id, status, created_at, package:travel_packages(title, available_seats)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setBookings(data as unknown as BookingRequest[]);
        setLoading(false);
      });
  }, []);

  // Mantém o badge do sidebar sincronizado com o estado actual
  useEffect(() => {
    if (loading) return;
    onBadgeChange?.(bookings.filter((b) => b.status === "pending" || b.status === "contacted").length);
  }, [bookings, loading, onBadgeChange]);

  useEffect(() => { setPage(1); }, [search, sort]);

  const filtered = bookings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return b.name.toLowerCase().includes(q) || (b.package?.title ?? "").toLowerCase().includes(q);
  });

  const sorted  = applySortFilter(filtered as unknown as Record<string, unknown>[], sort) as unknown as typeof filtered;
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const paged   = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function onSort(key: string) {
    setSort((s) => s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  }

  async function updateStatus(id: string, status: BookingStatus) {
    setOpenMenu(null);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    const supabase = createClient();
    await supabase.from("booking_requests").update({ status }).eq("id", id);

    // Ao confirmar ou cancelar, recalcula trip_status do destino
    const booking = bookings.find((b) => b.id === id);
    const pkgId   = booking?.package_id;
    const seats   = booking?.package?.available_seats;
    if (pkgId && seats != null && (status === "confirmed" || status === "cancelled")) {
      const { data: confirmed } = await supabase
        .from("booking_requests")
        .select("pax_count")
        .eq("package_id", pkgId)
        .eq("status", "confirmed");
      const taken = (confirmed ?? []).reduce((s: number, b: { pax_count: number }) => s + b.pax_count, 0);
      const trip_status = taken >= seats
        ? "esgotado"
        : taken >= seats * 0.8
          ? "ultimos_lugares"
          : "disponivel";
      await supabase.from("travel_packages").update({ trip_status }).eq("id", pkgId);
    }
  }

  async function deleteBooking(id: string) {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    await createClient().from("booking_requests").delete().eq("id", id);
  }

  function exportCSV() {
    const BOM = "﻿";
    const headers = ["Nome", "Email", "Telefone", "Viagem", "Pax", "Estado", "Mensagem", "Data"];
    const rows = sorted.map((b) => [
      b.name, b.email, b.phone ?? "", b.package?.title ?? "",
      String(b.pax_count), BOOKING_STATUS[b.status]?.label ?? b.status,
      (b.message ?? "").replace(/,/g, ";").replace(/\n/g, " "),
      new Date(b.created_at).toLocaleString("pt-PT"),
    ]);
    const csv = BOM + [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `pedidos-reserva-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  const thBase = "text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] border-b border-[var(--line)] bg-[var(--cream)]/40";

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-[36px] tracking-tight">Pedidos de reserva</h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">Todos os pedidos de reserva recebidos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[var(--line)] rounded-full px-4 py-2">
            <Search className="w-4 h-4 text-[var(--muted)]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar por nome ou viagem..." className="bg-transparent text-[13px] focus:outline-none w-52" />
          </div>
          <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-full bg-white border border-[var(--line)] px-5 py-2.5 text-[14px] tracking-tight hover:bg-[var(--cream-2)] transition">
            <Download className="w-4 h-4" /> Exportar Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--line)]">
        <table className="w-full text-[14px]">
          <thead>
            <tr className={thBase}>
              <Th label="Cliente"  field="name"         sort={sort} onSort={onSort} className="rounded-tl-2xl" />
              <Th label="Contacto" field="email"        sort={sort} onSort={onSort} className="hidden md:table-cell" />
              <Th label="Viagem"   field="package.title" sort={sort} onSort={onSort} className="hidden lg:table-cell" />
              <Th label="Pax"      field="pax_count"    sort={sort} onSort={onSort} className="hidden xl:table-cell" />
              <Th label="Data"     field="created_at"   sort={sort} onSort={onSort} className="hidden sm:table-cell" />
              <Th label="Estado"   field="status"       sort={sort} onSort={onSort} className="rounded-tr-2xl" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-12 text-center text-[var(--muted)] text-[13px]">A carregar...</td></tr>}
            {!loading && paged.length === 0 && (
              <tr><td colSpan={6} className="p-12 text-center text-[var(--muted)] text-[13px]">
                {search ? "Nenhum resultado para a pesquisa." : "Ainda não há pedidos de reserva."}
              </td></tr>
            )}
            {paged.map((b) => {
              const st = BOOKING_STATUS[b.status];
              return (
                <tr key={b.id} className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--cream)]/40">
                  <td className="p-4">
                    <div className="font-medium tracking-tight">{b.name}</div>
                    {b.message && <div className="text-[12px] text-[var(--muted)] mt-1 leading-relaxed">{b.message}</div>}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex flex-col gap-1">
                      <a href={`mailto:${b.email}`} className="flex items-center gap-1.5 text-[13px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition"><Mail className="w-3.5 h-3.5" /> {b.email}</a>
                      {b.phone && <a href={`tel:${b.phone}`} className="flex items-center gap-1.5 text-[13px] text-[var(--muted)] hover:text-[var(--ink)] transition"><Phone className="w-3.5 h-3.5" /> {b.phone}</a>}
                    </div>
                  </td>
                  <td className="p-4 hidden lg:table-cell"><span className="text-[13px] text-[var(--ink-soft)]">{b.package?.title ?? "—"}</span></td>
                  <td className="p-4 hidden xl:table-cell text-[var(--muted)] text-[13px]">{b.pax_count} pax</td>
                  <td className="p-4 hidden sm:table-cell text-[var(--muted)] text-[13px] whitespace-nowrap">{fmtDate(b.created_at)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="relative inline-block">
                        <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === b.id ? null : b.id); }} className="flex items-center gap-1">
                          <Pill className={st?.cls}>{st?.label ?? b.status}</Pill>
                          <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)]" />
                        </button>
                        {openMenu === b.id && (
                          <div className="absolute left-0 top-8 z-20 bg-white border border-[var(--line)] rounded-xl shadow-lg py-1 min-w-[148px]">
                            {(Object.entries(BOOKING_STATUS) as [BookingStatus, { label: string; cls: string }][]).map(([val, cfg]) => (
                              <button key={val} onClick={() => updateStatus(b.id, val)} className="w-full text-left px-4 py-2 text-[13px] hover:bg-[var(--cream-2)] flex items-center gap-2">
                                <Pill className={`${cfg.cls} !text-[11px]`}>{cfg.label}</Pill>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={() => setPendingDeleteId(b.id)} className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-600 hover:bg-red-50 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={page} total={totalPages} count={sorted.length} onPage={setPage} />
      </div>

      {pendingDeleteId && (() => {
        const name = bookings.find((b) => b.id === pendingDeleteId)?.name ?? "este pedido";
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/40" onClick={() => setPendingDeleteId(null)} />
            <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <Trash2 className="w-4 h-4 text-red-600" />
              </div>
              <h2 className="font-display text-[22px] tracking-tight mb-2">Apagar pedido?</h2>
              <p className="text-[14px] text-[var(--muted)] tracking-tight leading-relaxed mb-7">
                Tens a certeza que queres apagar o pedido de <span className="text-[var(--ink)] font-medium">"{name}"</span>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setPendingDeleteId(null)} className="flex-1 rounded-full border border-[var(--line)] py-2.5 text-[14px] tracking-tight hover:bg-[var(--cream-2)] transition">
                  Cancelar
                </button>
                <button onClick={() => { deleteBooking(pendingDeleteId); setPendingDeleteId(null); }}
                  className="flex-1 rounded-full bg-red-600 text-white py-2.5 text-[14px] tracking-tight hover:bg-red-700 transition">
                  Apagar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ─────────────────────────────────────────────────────── Quotes view */
type ContactRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  type: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
};

const CONTACT_TYPE_LABELS: Record<string, string> = {
  orcamento:  "Orçamento",
  informacao: "Informação",
  ajuda:      "Ajuda",
  outro:      "Outro",
};

function QuotesView({ onBadgeChange }: { onBadgeChange?: (n: number) => void }) {
  const [quotes,         setQuotes]         = useState<ContactRequest[]>([]);
  const [search,         setSearch]         = useState("");
  const [loading,        setLoading]        = useState(true);
  const [sort,           setSort]           = useState<SortState | null>({ key: "created_at", dir: "desc" });
  const [page,           setPage]           = useState(1);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .from("contact_requests")
      .select("*")
      .eq("type", "orcamento")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setQuotes(data as ContactRequest[]);
        setLoading(false);
      });
  }, []);

  // Mantém o badge sincronizado quando os orçamentos mudam
  useEffect(() => {
    if (loading) return;
    onBadgeChange?.(quotes.filter((q) => q.status === "novo").length);
  }, [quotes, loading, onBadgeChange]);

  useEffect(() => { setPage(1); }, [search, sort]);

  const filtered = quotes.filter((q) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return q.name.toLowerCase().includes(s) || (q.subject ?? "").toLowerCase().includes(s) || q.email.toLowerCase().includes(s);
  });

  const sorted = applySortFilter(filtered as unknown as Record<string, unknown>[], sort) as unknown as typeof filtered;
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function onSort(key: string) {
    setSort((s) => s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  }

  async function markResponded(id: string) {
    const next = quotes.find((q) => q.id === id)?.status === "respondido" ? "novo" : "respondido";
    setQuotes((prev) => prev.map((q) => q.id === id ? { ...q, status: next } : q));
    await createClient().from("contact_requests").update({ status: next }).eq("id", id);
  }

  async function deleteQuote(id: string) {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    await createClient().from("contact_requests").delete().eq("id", id);
  }

  function exportCSV() {
    const BOM = "﻿";
    const headers = ["Nome", "Email", "Telefone", "Assunto", "Mensagem", "Estado", "Data"];
    const rows = sorted.map((q) => [
      q.name, q.email, q.phone ?? "", q.subject ?? "", q.message.replace(/,/g, ";").replace(/\n/g, " "),
      q.status, new Date(q.created_at).toLocaleString("pt-PT"),
    ]);
    const csv = BOM + [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `orcamentos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  const thBase = "text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] border-b border-[var(--line)] bg-[var(--cream)]/40";

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-[36px] tracking-tight">Orçamentos</h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">Pedidos de orçamento personalizado recebidos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[var(--line)] rounded-full px-4 py-2">
            <Search className="w-4 h-4 text-[var(--muted)]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar por nome ou assunto…" className="bg-transparent text-[13px] focus:outline-none w-52" />
          </div>
          <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-full bg-white border border-[var(--line)] px-5 py-2.5 text-[14px] tracking-tight hover:bg-[var(--cream-2)] transition">
            <Download className="w-4 h-4" /> Exportar Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--line)]">
        <table className="w-full text-[14px]">
          <thead>
            <tr className={thBase}>
              <Th label="Cliente" field="name"       sort={sort} onSort={onSort} className="rounded-tl-2xl" />
              <Th label="Contacto" field="email"     sort={sort} onSort={onSort} className="hidden md:table-cell" />
              <Th label="Assunto"  field="subject"   sort={sort} onSort={onSort} className="hidden lg:table-cell" />
              <Th label="Data"     field="created_at" sort={sort} onSort={onSort} className="hidden sm:table-cell" />
              <Th label="Estado"   field="status"    sort={sort} onSort={onSort} className="rounded-tr-2xl" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-12 text-center text-[var(--muted)] text-[13px]">A carregar...</td></tr>}
            {!loading && paged.length === 0 && (
              <tr><td colSpan={5} className="p-12 text-center text-[var(--muted)] text-[13px]">
                {search ? "Nenhum resultado." : "Ainda não há pedidos de orçamento."}
              </td></tr>
            )}
            {paged.map((q) => {
              const responded = q.status === "respondido";
              return (
                <tr key={q.id} className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--cream)]/40">
                  <td className="p-4">
                    <div className={`font-medium tracking-tight ${responded ? "text-[var(--muted)]" : ""}`}>{q.name}</div>
                    {q.message && <div className="text-[12px] text-[var(--muted)] mt-1 leading-relaxed">{q.message}</div>}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex flex-col gap-1">
                      <a href={`mailto:${q.email}`} className="flex items-center gap-1.5 text-[13px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition"><Mail className="w-3.5 h-3.5" /> {q.email}</a>
                      {q.phone && <a href={`tel:${q.phone}`} className="flex items-center gap-1.5 text-[13px] text-[var(--muted)] hover:text-[var(--ink)] transition"><Phone className="w-3.5 h-3.5" /> {q.phone}</a>}
                    </div>
                  </td>
                  <td className="p-4 hidden lg:table-cell"><span className="text-[13px] text-[var(--ink-soft)]">{q.subject ?? "—"}</span></td>
                  <td className="p-4 hidden sm:table-cell text-[var(--muted)] text-[13px] whitespace-nowrap">{fmtDate(q.created_at)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => markResponded(q.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] tracking-tight transition ${
                          responded
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-[var(--cream-2)] text-[var(--muted)] border-[var(--line)] hover:bg-[var(--line)]"
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {responded ? "Respondido" : "Novo"}
                      </button>
                      <button onClick={() => setPendingDeleteId(q.id)} className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-600 hover:bg-red-50 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={page} total={totalPages} count={sorted.length} onPage={setPage} />
      </div>

      {pendingDeleteId && (() => {
        const name = quotes.find((q) => q.id === pendingDeleteId)?.name ?? "este orçamento";
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/40" onClick={() => setPendingDeleteId(null)} />
            <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <Trash2 className="w-4 h-4 text-red-600" />
              </div>
              <h2 className="font-display text-[22px] tracking-tight mb-2">Apagar orçamento?</h2>
              <p className="text-[14px] text-[var(--muted)] tracking-tight leading-relaxed mb-7">
                Tens a certeza que queres apagar o pedido de <span className="text-[var(--ink)] font-medium">"{name}"</span>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setPendingDeleteId(null)} className="flex-1 rounded-full border border-[var(--line)] py-2.5 text-[14px] tracking-tight hover:bg-[var(--cream-2)] transition">
                  Cancelar
                </button>
                <button onClick={() => { deleteQuote(pendingDeleteId); setPendingDeleteId(null); }}
                  className="flex-1 rounded-full bg-red-600 text-white py-2.5 text-[14px] tracking-tight hover:bg-red-700 transition">
                  Apagar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ─────────────────────────────────────────────────────── Shared Modal */
function Modal({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full sm:max-w-lg bg-[var(--cream)] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]"
          >
            <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-[var(--line)] shrink-0">
              <h2 className="font-display text-[22px] tracking-tight">{title}</h2>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--cream-2)] transition text-[var(--muted)]"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────── Clients view */
type Client = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function ClientsView() {
  const [clients,    setClients]    = useState<Client[]>([]);
  const [search,     setSearch]     = useState("");
  const [loading,    setLoading]    = useState(true);
  const [sort,       setSort]       = useState<SortState | null>({ key: "name", dir: "asc" });
  const [page,       setPage]       = useState(1);
  const [showForm,   setShowForm]   = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [form,       setForm]       = useState({ name: "", email: "", phone: "", country: "", notes: "" });
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => { setPage(1); }, [search, sort]);

  function loadClients() {
    setLoading(true);
    createClient()
      .from("clients")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data }) => {
        if (data) setClients(data as Client[]);
        setLoading(false);
      });
  }

  function openNew() {
    setEditClient(null);
    setForm({ name: "", email: "", phone: "", country: "", notes: "" });
    setFormError("");
    setShowForm(true);
  }

  function openEdit(c: Client) {
    setEditClient(c);
    setForm({ name: c.name, email: c.email, phone: c.phone ?? "", country: c.country ?? "", notes: c.notes ?? "" });
    setFormError("");
    setShowForm(true);
  }

  async function saveClient(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { setFormError("O nome é obrigatório."); return; }
    setSaving(true);
    setFormError("");
    const supabase = createClient();
    if (editClient) {
      const { error } = await supabase.from("clients").update({
        name: form.name, email: form.email || undefined,
        phone: form.phone || null, country: form.country || null, notes: form.notes || null,
      }).eq("id", editClient.id);
      if (error) { setFormError(error.message); setSaving(false); return; }
      setClients((prev) => prev.map((c) => c.id === editClient.id ? { ...c, ...form, phone: form.phone || null, country: form.country || null, notes: form.notes || null } : c));
    } else {
      const { data, error } = await supabase.from("clients").insert({
        name: form.name, email: form.email || undefined,
        phone: form.phone || null, country: form.country || null, notes: form.notes || null,
      }).select("*").single();
      if (error) { setFormError(error.message); setSaving(false); return; }
      if (data) setClients((prev) => [data as Client, ...prev]);
    }
    setSaving(false);
    setShowForm(false);
  }

  async function deleteClient(id: string) {
    if (!confirm("Apagar este cliente?")) return;
    await createClient().from("clients").delete().eq("id", id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  function exportCSV() {
    const BOM = "﻿";
    const headers = ["Nome", "Email", "Telefone", "País", "Notas", "Data"];
    const rows = sorted.map((c) => [
      c.name, c.email, c.phone ?? "", c.country ?? "", (c.notes ?? "").replace(/,/g, ";").replace(/\n/g, " "),
      new Date(c.created_at).toLocaleString("pt-PT"),
    ]);
    const csv = BOM + [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `clientes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.country ?? "").toLowerCase().includes(q);
  });

  const sorted     = applySortFilter(filtered as unknown as Record<string, unknown>[], sort) as unknown as typeof filtered;
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const paged      = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function onSort(key: string) {
    setSort((s) => s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-PT");
  }

  const thBase = "text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] border-b border-[var(--line)] bg-[var(--cream)]/40";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-[36px] tracking-tight">Clientes</h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">{clients.length} cliente{clients.length !== 1 ? "s" : ""} registado{clients.length !== 1 ? "s" : ""}.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[var(--line)] rounded-full px-4 py-2">
            <Search className="w-4 h-4 text-[var(--muted)]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar por nome, email ou país…" className="bg-transparent text-[13px] focus:outline-none w-56" />
          </div>
          <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-full bg-white border border-[var(--line)] px-5 py-2.5 text-[14px] tracking-tight hover:bg-[var(--cream-2)] transition">
            <Download className="w-4 h-4" /> Exportar
          </button>
          <button onClick={openNew} className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] text-[var(--cream)] px-5 py-2.5 text-[14px] tracking-tight hover:bg-[var(--ink-soft)] transition">
            <UserPlus className="w-4 h-4" /> Novo cliente
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[var(--line)] overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className={thBase}>
              <Th label="Nome"     field="name"       sort={sort} onSort={onSort} className="rounded-tl-2xl" />
              <Th label="Email"    field="email"      sort={sort} onSort={onSort} className="hidden md:table-cell" />
              <Th label="Telefone" field="phone"      sort={sort} onSort={onSort} className="hidden lg:table-cell" />
              <Th label="País"     field="country"    sort={sort} onSort={onSort} className="hidden xl:table-cell" />
              <Th label="Desde"    field="created_at" sort={sort} onSort={onSort} className="hidden sm:table-cell" />
              <th className="text-right font-medium p-4 rounded-tr-2xl w-20">·</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-12 text-center text-[var(--muted)] text-[13px]">A carregar...</td></tr>}
            {!loading && paged.length === 0 && (
              <tr><td colSpan={6} className="p-12 text-center text-[var(--muted)] text-[13px]">
                {search ? "Nenhum cliente encontrado." : "Ainda não há clientes registados."}
              </td></tr>
            )}
            {paged.map((c) => (
              <tr key={c.id} className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--cream)]/40">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--cream-2)] border border-[var(--line)] flex items-center justify-center shrink-0">
                      <UserCircle className="w-5 h-5 text-[var(--muted)]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="font-medium tracking-tight">{c.name}</div>
                      {c.notes && <div className="text-[12px] text-[var(--muted)] mt-0.5 max-w-[220px] truncate">{c.notes}</div>}
                    </div>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell">
                  {c.email ? (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-[13px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition">
                      <Mail className="w-3.5 h-3.5" /> {c.email}
                    </a>
                  ) : <span className="text-[var(--muted)] text-[13px]">—</span>}
                </td>
                <td className="p-4 hidden lg:table-cell">
                  {c.phone ? (
                    <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-[13px] text-[var(--muted)] hover:text-[var(--ink)] transition">
                      <Phone className="w-3.5 h-3.5" /> {c.phone}
                    </a>
                  ) : <span className="text-[var(--muted)] text-[13px]">—</span>}
                </td>
                <td className="p-4 hidden xl:table-cell">
                  {c.country ? (
                    <span className="flex items-center gap-1.5 text-[13px] text-[var(--ink-soft)]">
                      <Globe className="w-3.5 h-3.5 text-[var(--muted)]" /> {c.country}
                    </span>
                  ) : <span className="text-[var(--muted)] text-[13px]">—</span>}
                </td>
                <td className="p-4 hidden sm:table-cell text-[var(--muted)] text-[13px] whitespace-nowrap">{fmtDate(c.created_at)}</td>
                <td className="p-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-[var(--cream-2)] transition" title="Editar"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => deleteClient(c.id)} className="p-2 rounded-lg hover:bg-[var(--cream-2)] text-[var(--clay-dark)] transition" title="Apagar"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} total={totalPages} count={sorted.length} onPage={setPage} />
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editClient ? "Editar cliente" : "Novo cliente"}>
        <form onSubmit={saveClient} className="px-7 py-6 space-y-4">
          {[
            { label: "Nome completo *", key: "name",    type: "text",  placeholder: "Nome do cliente" },
            { label: "Email",           key: "email",   type: "email", placeholder: "email@exemplo.pt" },
            { label: "Telefone",        key: "phone",   type: "tel",   placeholder: "+351 9xx xxx xxx" },
            { label: "País",            key: "country", type: "text",  placeholder: "Portugal" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-white border border-[var(--line)] rounded-xl text-[14px] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] transition"
              />
            </div>
          ))}
          <div>
            <label className="block text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5">Notas</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Observações sobre o cliente…"
              className="w-full px-4 py-3 bg-white border border-[var(--line)] rounded-xl text-[14px] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] transition resize-none"
            />
          </div>
          {formError && <p className="text-[13px] text-red-600">{formError}</p>}
          <div className="flex gap-3 pt-1 pb-1">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-full border border-[var(--line)] py-3 text-[14px] tracking-tight hover:bg-[var(--cream-2)] transition">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-full bg-[var(--ink)] text-[var(--cream)] py-3 text-[14px] tracking-tight hover:bg-[var(--ink-soft)] transition disabled:opacity-50">
              {saving ? "A guardar…" : editClient ? "Guardar" : "Criar cliente"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── Users view */
type AdminUser = {
  id: string;
  email: string;
  role: "admin" | "staff";
  created_at: string;
  last_sign_in: string | null;
  confirmed: boolean;
};

const ROLE_LABELS: Record<string, { label: string; cls: string }> = {
  admin: { label: "Administrador", cls: "bg-[var(--ink)] text-[var(--cream)]" },
  staff: { label: "Funcionário",   cls: "bg-[var(--cream-2)] text-[var(--ink-soft)] border border-[var(--line)]" },
};

function UsersView() {
  const [users,        setUsers]        = useState<AdminUser[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [sort,         setSort]         = useState<SortState | null>({ key: "email", dir: "asc" });
  const [page,         setPage]         = useState(1);
  // "new" | "edit" | null
  const [panel,        setPanel]        = useState<"new" | "edit" | null>(null);
  const [editTarget,   setEditTarget]   = useState<AdminUser | null>(null);
  // new user form
  const [newForm,      setNewForm]      = useState({ email: "", password: "", role: "staff" });
  const [newError,     setNewError]     = useState("");
  const [newSaving,    setNewSaving]    = useState(false);
  // edit form
  const [editEmail,    setEditEmail]    = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole,     setEditRole]     = useState("staff");
  const [editError,    setEditError]    = useState("");
  const [editSaving,   setEditSaving]   = useState(false);
  const [resetSaving,  setResetSaving]  = useState(false);
  const [resetDone,    setResetDone]    = useState(false);
  // role dropdown
  const [openRoleMenu, setOpenRoleMenu] = useState<string | null>(null);
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);

  useEffect(() => { loadUsers(); }, []);
  useEffect(() => { setPage(1); }, [sort]);

  useEffect(() => {
    if (!openRoleMenu) return;
    const handler = () => setOpenRoleMenu(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openRoleMenu]);

  function loadUsers() {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setUsers(data as AdminUser[]); })
      .finally(() => setLoading(false));
  }

  function openNew() {
    setNewForm({ email: "", password: "", role: "staff" });
    setNewError(""); setPanel("new");
  }

  function openEdit(u: AdminUser) {
    setEditTarget(u);
    setEditEmail(u.email);
    setEditPassword("");
    setEditRole(u.role);
    setEditError(""); setResetDone(false);
    setPanel("edit");
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm.email || !newForm.password) { setNewError("Email e password são obrigatórios."); return; }
    setNewSaving(true); setNewError("");
    const res  = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newForm) });
    const data = await res.json();
    if (!res.ok) { setNewError(data.error ?? "Erro ao criar utilizador."); setNewSaving(false); return; }
    setUsers((prev) => [data as AdminUser, ...prev]);
    setNewSaving(false); setPanel(null);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    if (!editEmail) { setEditError("O email não pode ficar vazio."); return; }
    setEditSaving(true); setEditError("");
    const body: Record<string, string> = {};
    if (editEmail    !== editTarget.email) body.email    = editEmail;
    if (editPassword)                      body.password = editPassword;
    if (editRole     !== editTarget.role)  body.role     = editRole;

    if (Object.keys(body).length === 0) { setEditSaving(false); setPanel(null); return; }

    const res  = await fetch(`/api/admin/users/${editTarget.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setEditError(data.error ?? "Erro ao guardar."); setEditSaving(false); return; }

    setUsers((prev) => prev.map((u) => u.id === editTarget.id
      ? { ...u, email: editEmail, role: editRole as "admin" | "staff" }
      : u));
    setEditSaving(false); setPanel(null);
  }

  async function sendReset() {
    if (!editTarget) return;
    setResetSaving(true); setResetDone(false);
    await fetch(`/api/admin/users/${editTarget.id}/reset-password`, { method: "POST" });
    setResetSaving(false); setResetDone(true);
  }

  async function changeRole(id: string, role: string) {
    setOpenRoleMenu(null); setRoleUpdating(id);
    await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: role as "admin" | "staff" } : u));
    setRoleUpdating(null);
  }

  async function deleteUser(id: string, email: string) {
    if (!confirm(`Apagar o utilizador ${email}?`)) return;
    const res  = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { alert(data.error ?? "Erro ao apagar utilizador."); return; }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (editTarget?.id === id) setPanel(null);
  }

  function fmtDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-PT");
  }

  const sorted     = applySortFilter(users as unknown as Record<string, unknown>[], sort) as unknown as typeof users;
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const paged      = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function onSort(key: string) {
    setSort((s) => s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  }

  const thBase = "text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] border-b border-[var(--line)] bg-[var(--cream)]/40";


  const inputCls = "w-full px-4 py-3 bg-white border border-[var(--line)] rounded-xl text-[14px] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] transition";
  const labelCls = "block text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1.5";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-[36px] tracking-tight">Equipa</h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">{users.length} utilizador{users.length !== 1 ? "es" : ""} registado{users.length !== 1 ? "s" : ""}.</p>
        </div>
        <button onClick={openNew}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] text-[var(--cream)] px-5 py-2.5 text-[14px] tracking-tight hover:bg-[var(--ink-soft)] transition">
          <UserPlus className="w-4 h-4" /> Novo utilizador
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[var(--line)] overflow-visible">
        <table className="w-full text-[14px]">
          <thead>
            <tr className={thBase}>
              <Th label="Email"        field="email"        sort={sort} onSort={onSort} className="rounded-tl-2xl" />
              <Th label="Permissão"    field="role"         sort={sort} onSort={onSort} />
              <Th label="Confirmado"   field="confirmed"    sort={sort} onSort={onSort} className="hidden md:table-cell" />
              <Th label="Último login" field="last_sign_in" sort={sort} onSort={onSort} className="hidden lg:table-cell" />
              <Th label="Criado em"    field="created_at"   sort={sort} onSort={onSort} className="hidden sm:table-cell" />
              <th className="text-right font-medium p-4 rounded-tr-2xl w-24">·</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-12 text-center text-[var(--muted)] text-[13px]">A carregar...</td></tr>}
            {!loading && paged.length === 0 && (
              <tr><td colSpan={6} className="p-12 text-center text-[var(--muted)] text-[13px]">Nenhum utilizador encontrado.</td></tr>
            )}
            {paged.map((u) => {
              const rl = ROLE_LABELS[u.role] ?? ROLE_LABELS.staff;
              return (
                <tr key={u.id} className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--cream)]/40">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--cream-2)] border border-[var(--line)] flex items-center justify-center shrink-0">
                        <UserCircle className="w-5 h-5 text-[var(--muted)]" strokeWidth={1.5} />
                      </div>
                      <span className="font-medium tracking-tight text-[13px]">{u.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="relative inline-block">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenRoleMenu(openRoleMenu === u.id ? null : u.id); }}
                        disabled={roleUpdating === u.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase cursor-pointer transition ${rl.cls} disabled:opacity-50`}
                      >
                        {roleUpdating === u.id ? "…" : rl.label} <ChevronDown className="w-3 h-3" />
                      </button>
                      {openRoleMenu === u.id && (
                        <div className="absolute left-0 top-full mt-1.5 z-50 w-44 bg-white border border-[var(--line)] rounded-xl shadow-lg overflow-hidden">
                          {Object.entries(ROLE_LABELS).map(([key, { label, cls }]) => (
                            <button key={key} onClick={() => changeRole(u.id, key)}
                              className={`w-full text-left px-4 py-2.5 text-[12px] tracking-wide uppercase font-medium hover:bg-[var(--cream)]/60 transition flex items-center gap-2 ${u.role === key ? "opacity-50 cursor-default" : ""}`}>
                              <span className={`inline-block w-2 h-2 rounded-full ${cls.includes("var(--ink)]") ? "bg-[var(--ink)]" : "bg-[var(--muted)]"}`} />
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className={`inline-flex items-center gap-1.5 text-[12px] ${u.confirmed ? "text-emerald-600" : "text-amber-600"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.confirmed ? "bg-emerald-500" : "bg-amber-400"}`} />
                      {u.confirmed ? "Confirmado" : "Pendente"}
                    </span>
                  </td>
                  <td className="p-4 hidden lg:table-cell text-[var(--muted)] text-[13px]">{fmtDate(u.last_sign_in)}</td>
                  <td className="p-4 hidden sm:table-cell text-[var(--muted)] text-[13px] whitespace-nowrap">{fmtDate(u.created_at)}</td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-[var(--cream-2)] transition" title="Editar">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteUser(u.id, u.email)} className="p-2 rounded-lg hover:bg-[var(--cream-2)] text-[var(--clay-dark)] transition" title="Apagar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={page} total={totalPages} count={sorted.length} onPage={setPage} />
      </div>

      {/* Modal — Novo utilizador */}
      <Modal open={panel === "new"} onClose={() => setPanel(null)} title="Novo utilizador">
        <form onSubmit={createUser} className="px-7 py-6 space-y-5">
          <div>
            <label className={labelCls}>Email *</label>
            <input type="email" value={newForm.email} onChange={(e) => setNewForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="utilizador@mntravel.pt" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Password *</label>
            <input type="password" value={newForm.password} onChange={(e) => setNewForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Mínimo 8 caracteres" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Permissão *</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(ROLE_LABELS).map(([key, { label }]) => (
                <button key={key} type="button" onClick={() => setNewForm((f) => ({ ...f, role: key }))}
                  className={`py-3 rounded-xl border text-[13px] tracking-tight transition ${newForm.role === key ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--cream)]" : "border-[var(--line)] hover:border-[var(--ink-soft)]"}`}>
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[12px] text-[var(--muted)]">
              {newForm.role === "admin" ? "Acesso completo a todas as funcionalidades." : "Acesso de leitura e edição, sem gestão de utilizadores."}
            </p>
          </div>
          {newError && <p className="text-[13px] text-red-600">{newError}</p>}
          <div className="flex gap-3 pt-1 pb-1">
            <button type="button" onClick={() => setPanel(null)} className="flex-1 rounded-full border border-[var(--line)] py-3 text-[14px] tracking-tight hover:bg-[var(--cream-2)] transition">Cancelar</button>
            <button type="submit" disabled={newSaving} className="flex-1 rounded-full bg-[var(--ink)] text-[var(--cream)] py-3 text-[14px] tracking-tight hover:bg-[var(--ink-soft)] transition disabled:opacity-50">
              {newSaving ? "A criar…" : "Criar utilizador"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal — Editar utilizador */}
      <Modal open={panel === "edit" && !!editTarget} onClose={() => setPanel(null)} title="Editar utilizador">
        {editTarget && (
          <div className="px-7 py-6 space-y-7">
            <form onSubmit={saveEdit} className="space-y-5">
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Nova password</label>
                <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Deixar vazio para não alterar" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Permissão</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(ROLE_LABELS).map(([key, { label }]) => (
                    <button key={key} type="button" onClick={() => setEditRole(key)}
                      className={`py-3 rounded-xl border text-[13px] tracking-tight transition ${editRole === key ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--cream)]" : "border-[var(--line)] hover:border-[var(--ink-soft)]"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {editError && <p className="text-[13px] text-red-600">{editError}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setPanel(null)} className="flex-1 rounded-full border border-[var(--line)] py-3 text-[14px] tracking-tight hover:bg-[var(--cream-2)] transition">Cancelar</button>
                <button type="submit" disabled={editSaving} className="flex-1 rounded-full bg-[var(--ink)] text-[var(--cream)] py-3 text-[14px] tracking-tight hover:bg-[var(--ink-soft)] transition disabled:opacity-50">
                  {editSaving ? "A guardar…" : "Guardar"}
                </button>
              </div>
            </form>

            <div className="border-t border-[var(--line)]" />

            <div className="space-y-3">
              <p className="text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)]">Reset de password</p>
              <p className="text-[13px] text-[var(--ink-soft)] leading-relaxed">
                Envia um email de recuperação para <strong>{editTarget.email}</strong>.
              </p>
              {resetDone ? (
                <div className="flex items-center gap-2 text-emerald-600 text-[13px]">
                  <CheckCircle className="w-4 h-4" /> Email de recuperação enviado.
                </div>
              ) : (
                <button onClick={sendReset} disabled={resetSaving}
                  className="rounded-full border border-[var(--line)] px-5 py-2.5 text-[13px] tracking-tight hover:bg-[var(--cream-2)] transition disabled:opacity-50 inline-flex items-center gap-2">
                  {resetSaving ? "A enviar…" : "Enviar email de reset"}
                </button>
              )}
            </div>

            <div className="border-t border-[var(--line)]" />

            <div className="space-y-3 pb-1">
              <p className="text-[10.5px] uppercase tracking-[0.16em] text-red-500">Zona de perigo</p>
              <button onClick={() => deleteUser(editTarget.id, editTarget.email)}
                className="rounded-full border border-red-200 text-red-600 px-5 py-2.5 text-[13px] tracking-tight hover:bg-red-50 transition inline-flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Apagar utilizador
              </button>
            </div>
          </div>
        )}
      </Modal>
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
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar a destinos
          </button>
          <h1 className="font-display text-[36px] tracking-tight mt-2">
            {trip ? "Editar destino" : "Novo destino"}
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