"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, MapPin, Minus, Plus, ArrowRight, Check } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Pill } from "@/components/ui/Pill";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { trips } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export default function TripDetailPage() {
  const params = useParams();
  const trip = trips.find((t) => t.slug === params.slug);

  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState<"itinerary" | "includes" | "dates">("itinerary");
  const [pax, setPax] = useState(2);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  if (!trip) return notFound();

  return (
    <>
      <Header />
      <main>
        <div className="pt-[72px]">
          {/* Back */}
          <div className="max-w-[1320px] mx-auto px-6 lg:px-10 pt-8">
            <Link
              href="/viagens"
              className="inline-flex items-center gap-2 text-[13px] text-[var(--muted)] hover:text-[var(--ink)] tracking-tight transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Todas as viagens
            </Link>
          </div>

          {/* Title */}
          <section className="max-w-[1320px] mx-auto px-6 lg:px-10 pt-8 pb-12">
            <div className="grid lg:grid-cols-12 gap-8 items-end">
              <div className="lg:col-span-8">
                <div className="flex items-center gap-3 mb-5">
                  <Pill className="!bg-[var(--clay-soft)] !border-transparent !text-[var(--clay-dark)]">
                    {trip.tag}
                  </Pill>
                  <span className="text-[13px] text-[var(--muted)] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {trip.country}
                  </span>
                </div>
                <h1 className="font-display text-[44px] md:text-[64px] leading-[1.02] tracking-tight text-balance">
                  {trip.title}
                </h1>
              </div>
              <div className="lg:col-span-4 flex flex-wrap gap-6 text-[13px]">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Duração</div>
                  <div className="mt-1 text-[var(--ink)] tracking-tight">{trip.duration} dias · {trip.nights} noites</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Avaliação</div>
                  <div className="mt-1 text-[var(--ink)] tracking-tight flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" /> {trip.rating}{" "}
                    <span className="text-[var(--muted)]">({trip.reviews})</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Tipologia</div>
                  <div className="mt-1 text-[var(--ink)] tracking-tight">Privada · personalizável</div>
                </div>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="max-w-[1320px] mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-4 gap-3 h-[460px] lg:h-[560px]">
              <div className="col-span-4 lg:col-span-2 row-span-2 rounded-3xl overflow-hidden img-zoom">
                <img src={trip.gallery[activeImg]} alt="" className="w-full h-full object-cover" />
              </div>
              {trip.gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative rounded-2xl overflow-hidden img-zoom hidden lg:block ${
                    activeImg === i ? "ring-2 ring-offset-2 ring-[var(--ink)]" : ""
                  }`}
                >
                  <img src={g} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </section>

          {/* Content */}
          <section className="max-w-[1320px] mx-auto px-6 lg:px-10 mt-16 grid lg:grid-cols-12 gap-12">
            {/* Left */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="pb-12 border-b border-[var(--line)]">
                <SectionLabel>A viagem</SectionLabel>
                <p className="mt-6 font-display text-[28px] md:text-[34px] leading-[1.25] tracking-tight text-balance">
                  {trip.short}
                </p>
                <p className="mt-8 text-[15.5px] text-[var(--ink-soft)] leading-[1.75] max-w-2xl">
                  Em {trip.duration} dias entre alojamentos cuidadosamente escolhidos, refeições com
                  chefs locais e experiências que não se encontram em catálogo, esta é uma viagem que
                  se vive como um filme — pausado, contemplativo, gravado na memória pelos detalhes.
                </p>

                <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { l: "Privacidade", v: "100%" },
                    { l: "Guias locais", v: trip.duration > 7 ? "5" : "3" },
                    { l: "Refeições incl.", v: "12" },
                    { l: "Transfers", v: "Privados" },
                  ].map((x) => (
                    <div key={x.l} className="p-5 rounded-2xl bg-[var(--cream-2)]">
                      <div className="font-display text-[28px] leading-none">{x.v}</div>
                      <div className="mt-2 text-[12px] uppercase tracking-[0.15em] text-[var(--muted)]">{x.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-10">
                {/* Tabs */}
                <div className="flex items-center gap-2 mb-8 border-b border-[var(--line)]">
                  {[
                    { id: "itinerary", l: "Itinerário" },
                    { id: "includes", l: "Inclui" },
                    { id: "dates", l: "Datas & preços" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id as typeof tab)}
                      className={`px-4 py-3 text-[14px] tracking-tight transition-all border-b-2 -mb-px ${
                        tab === t.id
                          ? "border-[var(--ink)] text-[var(--ink)] font-medium"
                          : "border-transparent text-[var(--muted)]"
                      }`}
                    >
                      {t.l}
                    </button>
                  ))}
                </div>

                {/* Itinerary tab */}
                {tab === "itinerary" && (
                  <div className="relative">
                    <div className="absolute left-[19px] top-2 bottom-2 w-px bg-[var(--line-2)]" />
                    {trip.itinerary.map((it, i) => (
                      <div key={i} className="relative pl-12 pb-10 last:pb-0">
                        <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-[var(--cream)] border border-[var(--line-2)] flex items-center justify-center font-display text-[14px]">
                          {i + 1}
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">{it.d}</div>
                        <h4 className="mt-1.5 font-display text-[22px] leading-tight tracking-tight">{it.t}</h4>
                        <p className="mt-2 text-[14.5px] text-[var(--muted)] leading-relaxed max-w-2xl">{it.b}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Includes tab */}
                {tab === "includes" && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      "Voos internacionais em classe executiva",
                      "Alojamento em hotéis 5★ ou boutique",
                      "Refeições conforme programa",
                      "Transferes privados em todos os destinos",
                      "Guias locais especializados (PT/EN)",
                      "Experiências exclusivas curadas pela MN",
                      "Seguro de viagem premium",
                      "Concierge 24/7 durante toda a viagem",
                    ].map((x) => (
                      <div key={x} className="flex items-start gap-3 p-5 rounded-2xl bg-[var(--cream-2)]">
                        <div className="w-5 h-5 rounded-full bg-[var(--ink)] text-[var(--cream)] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-[14.5px] text-[var(--ink-soft)]">{x}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dates tab */}
                {tab === "dates" && (
                  <div className="space-y-3">
                    {[
                      { d: "12 Mai — 19 Mai 2026", s: "3 lugares" },
                      { d: "04 Jun — 11 Jun 2026", s: "Disponível" },
                      { d: "16 Set — 23 Set 2026", s: "Disponível" },
                      { d: "08 Out — 15 Out 2026", s: "2 lugares" },
                    ].map((d) => (
                      <div
                        key={d.d}
                        className="flex items-center justify-between p-6 rounded-2xl border border-[var(--line)] hover:border-[var(--ink)] transition cursor-pointer"
                      >
                        <div>
                          <div className="font-display text-[20px] tracking-tight">{d.d}</div>
                          <div className="text-[12px] text-[var(--muted)] mt-1 tracking-tight">{d.s}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[20px] font-medium tracking-tight">{formatPrice(trip.price)}</div>
                          <div className="text-[12px] text-[var(--muted)] tracking-tight">por pessoa</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-5 xl:col-span-4">
              <div className="lg:sticky lg:top-[88px] rounded-[28px] bg-[var(--cream-2)] p-7 border border-[var(--line)]">
                <div className="flex items-end justify-between pb-6 border-b border-[var(--line-2)]">
                  <div>
                    <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--muted)]">desde</div>
                    <div className="mt-1 font-display text-[40px] leading-none">{formatPrice(trip.price)}</div>
                    <div className="mt-1 text-[12px] text-[var(--muted)] tracking-tight">por pessoa · ocupação dupla</div>
                  </div>
                  <div className="flex items-center gap-1 text-[13px]">
                    <Star className="w-4 h-4 fill-current" /> {trip.rating}
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block rounded-xl bg-white border border-[var(--line)] px-4 py-3">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Check-in</span>
                      <input type="date" className="w-full mt-1 bg-transparent text-[13px] focus:outline-none" />
                    </label>
                    <label className="block rounded-xl bg-white border border-[var(--line)] px-4 py-3">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Viajantes</span>
                      <div className="flex items-center justify-between mt-1 text-[13px]">
                        <button
                          onClick={() => setPax(Math.max(1, pax - 1))}
                          className="w-5 h-5 rounded-full bg-[var(--cream-2)] flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        {pax} adultos
                        <button
                          onClick={() => setPax(pax + 1)}
                          className="w-5 h-5 rounded-full bg-[var(--cream-2)] flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </label>
                  </div>

                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nome completo"
                    className="w-full rounded-xl bg-white border border-[var(--line)] px-4 py-3 text-[13.5px] focus:outline-none focus:border-[var(--ink)]"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Email"
                      className="w-full rounded-xl bg-white border border-[var(--line)] px-4 py-3 text-[13.5px] focus:outline-none focus:border-[var(--ink)]"
                    />
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Telefone"
                      className="w-full rounded-xl bg-white border border-[var(--line)] px-4 py-3 text-[13.5px] focus:outline-none focus:border-[var(--ink)]"
                    />
                  </div>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={3}
                    placeholder="Conte-nos como sonha esta viagem (opcional)"
                    className="w-full rounded-xl bg-white border border-[var(--line)] px-4 py-3 text-[13.5px] focus:outline-none focus:border-[var(--ink)] resize-none"
                  />

                  <button className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--clay)] hover:bg-[var(--clay-dark)] text-white px-7 py-4 text-[15px] font-medium tracking-tight transition mt-2">
                    Pedir proposta personalizada <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="w-full text-[13px] py-2 text-[var(--muted)] hover:text-[var(--ink)] tracking-tight transition">
                    Falar com curador agora →
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-[var(--line-2)] text-[12px] text-[var(--muted)] leading-relaxed">
                  <strong className="text-[var(--ink)] font-medium block mb-1">Sem compromisso</strong>
                  Receberá uma proposta detalhada em 48h. Pagamento apenas após confirmação do
                  programa final.
                </div>
              </div>
            </aside>
          </section>

          {/* Quote section */}
          <section className="mt-32 relative h-[80vh] min-h-[600px] overflow-hidden">
            <img src={trip.hero} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/30" />
            <div className="relative h-full max-w-[1320px] mx-auto px-6 lg:px-10 flex flex-col justify-center text-white">
              <div className="max-w-2xl">
                <SectionLabel>
                  <span className="text-white/60">Inspiração</span>
                </SectionLabel>
                <h2 className="mt-6 font-display text-[48px] md:text-[80px] leading-[0.98] tracking-tight text-balance">
                  &ldquo;Não viajamos para fugir da vida.{" "}
                  <span className="italic font-light">Viajamos para que a vida não nos fuja.&rdquo;</span>
                </h2>
                <div className="mt-8 text-[13px] tracking-[0.2em] uppercase text-white/60">
                  — Anthony Bourdain
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}