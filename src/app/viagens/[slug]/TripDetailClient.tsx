"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Star, MapPin, Minus, Plus, ArrowRight, Check, FileText } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Pill } from "@/components/ui/Pill";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SlideUp, SlideIn, StaggerContainer, StaggerItem, FadeIn, ScaleIn } from "@/components/animations";
import { formatPrice, formatTripDate } from "@/lib/utils";
import type { TravelPackageWithRelations } from "@/types/database";

interface Props {
  trip: TravelPackageWithRelations;
  remainingSeats: number | null;
  dateSeats: Record<string, number | null>;
}

const ease = [0.16, 1, 0.3, 1] as const;

const STATUS: Record<string, { label: string; cls: string }> = {
  disponivel:      { label: "Disponível",      cls: "!bg-emerald-50 !text-emerald-800 !border-emerald-200" },
  ultimos_lugares: { label: "Últimos lugares", cls: "!bg-amber-50 !text-amber-800 !border-amber-200" },
  esgotado:        { label: "Não disponível",  cls: "!bg-red-50 !text-red-600 !border-red-200" },
  em_breve:        { label: "Em breve",        cls: "!bg-[var(--cream-2)] !text-[var(--ink-soft)]" },
};

function seatBadge(remaining: number | null, dbStatus: string | null) {
  if (remaining === 0) return { label: "Não disponível", cls: "!bg-red-50 !text-red-600 !border-red-200" };
  if (remaining !== null && remaining <= 5) return { label: "Últimos lugares", cls: "!bg-amber-50 !text-amber-800 !border-amber-200" };
  if (dbStatus && STATUS[dbStatus]) return STATUS[dbStatus];
  return STATUS.disponivel;
}

export function TripDetailClient({ trip, remainingSeats, dateSeats }: Props) {
  const [activeImg,     setActiveImg]     = useState(0);
  const [tab,           setTab]           = useState<"itinerary" | "includes" | "dates">("itinerary");
  const [pax,           setPax]           = useState(2);
  const [companions,    setCompanions]    = useState<string[]>([""]);
  const [form,          setForm]          = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting,    setSubmitting]    = useState(false);
  const [submitted,     setSubmitted]     = useState(false);
  const [formError,     setFormError]     = useState("");
  const [selectedDate,  setSelectedDate]  = useState<string | null>(null);
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);

  const groupDates = trip.trip_type === "grupo" ? (trip.dates ?? []) : [];
  const isIndividual = trip.trip_type === "individual";
  const reduced = useReducedMotion();

  // Manter o array de acompanhantes sincronizado com o número de viajantes
  useEffect(() => {
    const needed = Math.max(0, pax - 1);
    setCompanions((prev) => {
      if (prev.length === needed) return prev;
      if (prev.length < needed) return [...prev, ...Array(needed - prev.length).fill("")];
      return prev.slice(0, needed);
    });
  }, [pax]);

  // Limite de lugares disponíveis para a data seleccionada
  const selectedDateObj = groupDates.find((d) => d.id === selectedDate);
  const maxPax = selectedDate && selectedDateObj
    ? (dateSeats[selectedDate] ?? selectedDateObj.available_seats ?? 99)
    : 99;

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) { setFormError("O nome e o e-mail são obrigatórios."); return; }
    if (groupDates.length > 0 && !selectedDate) { setFormError("Seleccione uma data de partida."); return; }
    setSubmitting(true);
    setFormError("");

    const checkIn = groupDates.length > 0
      ? groupDates.find((d) => d.id === selectedDate)?.departure_date ?? null
      : checkInRef.current?.value || null;
    const checkOut = groupDates.length > 0
      ? groupDates.find((d) => d.id === selectedDate)?.return_date ?? null
      : checkOutRef.current?.value || null;

    // Incluir nomes dos acompanhantes na mensagem
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
        package_id:      trip.id,
        package_date_id: selectedDate ?? null,
        name:            form.name,
        email:           form.email,
        phone:           form.phone  || null,
        pax_count:       pax,
        check_in_date:   checkIn,
        check_out_date:  checkOut,
        message:         fullMessage,
      }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) { setFormError(json.error || "Erro ao enviar. Tente novamente."); }
    else         { setSubmitted(true); }
  }

  const gallery = trip.images ?? [];
  const itinerary = trip.itinerary ?? [];
  const availability = seatBadge(remainingSeats, trip.trip_status ?? null);

  return (
    <>
      <Header />
      <main>
        <div>
          {/* Dark hero */}
          <div
            style={{
              minHeight: "68vh", position: "relative",
              display: "flex", alignItems: "flex-end",
              overflow: "hidden", background: "var(--dark)",
              padding: "clamp(110px,15vw,150px) 6vw 52px",
            }}
          >
            {/* Background image */}
            {trip.hero_image_url && (
              <div
                style={{
                  position: "absolute", inset: 0,
                  backgroundSize: "cover", backgroundPosition: "center",
                  backgroundImage: `url(${trip.hero_image_url})`,
                }}
              />
            )}
            {/* Overlay */}
            <div
              style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(0deg, rgba(10,18,28,.96) 0%, rgba(10,18,28,.42) 54%, rgba(10,18,28,.16) 100%)",
              }}
            />
            {/* Content */}
            <div style={{ position: "relative", zIndex: 2, color: "#fff", maxWidth: 920, width: "100%" }}>
              <Link
                href="/viagens"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.58)",
                  letterSpacing: "0.05em", marginBottom: 40, cursor: "pointer",
                  transition: "color .2s", textTransform: "uppercase", textDecoration: "none",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.58)"; }}
              >
                <ArrowLeft style={{ width: 14, height: 14 }} /> Voltar às viagens
              </Link>
              <div
                style={{
                  fontSize: 10.5, fontWeight: 700, letterSpacing: "0.22em",
                  textTransform: "uppercase", color: "var(--gold2)", marginBottom: 12,
                }}
              >
                {trip.country}
              </div>
              <h1
                className="font-display"
                style={{
                  fontSize: "clamp(44px, 5.5vw, 80px)", fontWeight: 400,
                  lineHeight: 0.93, letterSpacing: "-.04em", margin: 0,
                }}
              >
                {trip.title}
              </h1>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
                <span
                  style={{
                    padding: "8px 18px", borderRadius: 999,
                    background: "rgba(255,255,255,.14)", backdropFilter: "blur(8px)",
                    color: "#fff", fontSize: 12.5, fontWeight: 600,
                  }}
                >
                  {trip.duration_days} dias
                </span>
                <span
                  style={{
                    padding: "8px 18px", borderRadius: 999,
                    background: "rgba(255,255,255,.14)", backdropFilter: "blur(8px)",
                    color: "#fff", fontSize: 12.5, fontWeight: 600,
                  }}
                >
                  {isIndividual ? "Privado" : "Grupo"}
                </span>
                <span
                  style={{
                    padding: "8px 18px", borderRadius: 999,
                    background: "var(--gold)", color: "#fff",
                    fontSize: 12.5, fontWeight: 600,
                  }}
                >
                  desde {formatPrice(trip.price_from)}
                </span>
              </div>
            </div>
          </div>

          {/* Title meta for accessibility / non-hero info */}
          <section className="max-w-[1320px] mx-auto px-6 lg:px-10 pt-8 pb-4">
            <div className="flex items-center gap-4 flex-wrap text-[13px]">
              {trip.tag && (
                <Pill className="!bg-[var(--gold-soft)] !border-transparent !text-[var(--gold)]">
                  {trip.tag}
                </Pill>
              )}
              {!isIndividual && trip.trip_type !== "grupo" && (trip.trip_status || remainingSeats !== null) && (
                <Pill className={availability.cls}>
                  {availability.label}
                  {remainingSeats !== null && remainingSeats > 0 && remainingSeats <= 5 && (
                    <span className="ml-1 opacity-70">· {remainingSeats} lugar{remainingSeats !== 1 ? "es" : ""}</span>
                  )}
                </Pill>
              )}
              <span className="text-[var(--muted)] flex items-center gap-1">
                <Star className="w-3.5 h-3.5" style={{ fill: "var(--gold)", color: "var(--gold)" }} />
                {trip.rating} <span className="opacity-60">({trip.review_count} avaliações)</span>
              </span>
            </div>
          </section>

          {/* Main grid: left = gallery + description/tabs, right = booking card */}
          <section className="max-w-[1320px] mx-auto px-6 lg:px-10">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">

              {/* Left column: gallery + description + tabs */}
              <div className="lg:col-span-7 xl:col-span-8">

                {/* Gallery */}
                {gallery.length > 0 && (
                  <ScaleIn from={0.97} delay={0.05}>
                    <div className="grid grid-cols-4 gap-3 h-[220px] sm:h-[320px] md:h-[420px] lg:h-[560px]">
                      <div className="col-span-4 lg:col-span-2 row-span-2 rounded-3xl overflow-hidden">
                        <motion.img
                          key={activeImg}
                          src={gallery[activeImg]?.image_url ?? trip.hero_image_url ?? ""}
                          alt={trip.title}
                          className="w-full h-full object-cover"
                          initial={{ opacity: 0, scale: reduced ? 1 : 1.03 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.45, ease }}
                        />
                      </div>
                      {gallery.map((img, i) => (
                        <motion.button
                          key={img.id}
                          onClick={() => setActiveImg(i)}
                          whileHover={{ scale: reduced ? 1 : 1.02 }}
                          whileTap={{ scale: reduced ? 1 : 0.98 }}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                          className={`relative rounded-2xl overflow-hidden hidden lg:block ${
                            activeImg === i ? "ring-2 ring-offset-2 ring-[var(--gold)]" : ""
                          }`}
                        >
                          <img src={img.image_url} alt={img.alt_text ?? ""} className="w-full h-full object-cover" />
                        </motion.button>
                      ))}
                    </div>
                  </ScaleIn>
                )}

                {/* Description + Stats + Tabs */}
                <SlideUp delay={0.05} className="mt-8 md:mt-10">
                  <div className="pb-12 border-b border-[var(--line)]">
                    <SectionLabel>A viagem</SectionLabel>
                    <p className="mt-6 font-display text-[28px] md:text-[34px] leading-[1.25] tracking-tight text-balance">
                      {trip.short_description}
                    </p>
                    {trip.long_description && (
                      <p className="mt-8 text-[15.5px] text-[var(--ink-soft)] leading-[1.75] max-w-2xl">
                        {trip.long_description}
                      </p>
                    )}

                    <StaggerContainer className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4" staggerDelay={0.07} initialDelay={0.1}>
                      {[
                        { l: "Privacidade", v: "100%" },
                        { l: "Guias locais", v: trip.duration_days > 7 ? "5" : "3" },
                        { l: "Refeições incl.", v: "12" },
                        { l: "Transfers", v: "Privados" },
                      ].map((x) => (
                        <StaggerItem key={x.l}>
                          <div className="p-5 rounded-2xl bg-[var(--cream-2)]">
                            <div className="font-display text-[28px] leading-none">{x.v}</div>
                            <div className="mt-2 text-[12px] uppercase tracking-[0.15em] text-[var(--muted)]">{x.l}</div>
                          </div>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </div>

                  <div className="pt-10">
                    {/* Tabs */}
                    <div className="flex items-center gap-2 mb-8 border-b border-[var(--line)]">
                      {[
                        { id: "itinerary", l: "Itinerário" },
                        { id: "includes",  l: "Inclui" },
                        ...(!isIndividual ? [{ id: "dates", l: "Datas & preços" }] : []),
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTab(t.id as typeof tab)}
                          className={`px-4 py-3 text-[14px] tracking-tight transition-all border-b-2 -mb-px ${
                            tab === t.id
                              ? "border-[var(--gold)] text-[var(--ink)] font-medium"
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
                        {itinerary.length > 0 ? (
                          <StaggerContainer staggerDelay={0.06}>
                            {itinerary.map((it, i) => (
                              <StaggerItem key={it.id}>
                                <div className="relative pl-12 pb-10 last:pb-0">
                                  <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-[var(--cream)] border border-[var(--line-2)] flex items-center justify-center font-display text-[14px]">
                                    {i + 1}
                                  </div>
                                  <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">{it.day_label}</div>
                                  <h4 className="mt-1.5 font-display text-[22px] leading-tight tracking-tight">{it.title}</h4>
                                  <p className="mt-2 text-[14.5px] text-[var(--muted)] leading-relaxed max-w-2xl">{it.description}</p>
                                </div>
                              </StaggerItem>
                            ))}
                          </StaggerContainer>
                        ) : (
                          <p className="text-[var(--muted)] text-[14px]">Itinerário detalhado disponível na proposta.</p>
                        )}
                      </div>
                    )}

                    {/* Includes tab */}
                    {tab === "includes" && (
                      trip.includes && trip.includes.length > 0 ? (
                        <StaggerContainer className="grid sm:grid-cols-2 gap-4" staggerDelay={0.05}>
                          {trip.includes.map((inc) => (
                            <StaggerItem key={inc.id}>
                              <div className="flex items-start gap-3 p-5 rounded-2xl bg-[var(--cream-2)]">
                                <div className="w-5 h-5 rounded-full bg-[var(--ink)] text-[var(--cream)] flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Check className="w-3 h-3" />
                                </div>
                                <span className="text-[14.5px] text-[var(--ink-soft)]">{inc.title}</span>
                              </div>
                            </StaggerItem>
                          ))}
                        </StaggerContainer>
                      ) : (
                        <p className="text-[var(--muted)] text-[14px] tracking-tight">
                          Programa detalhado disponível na proposta personalizada.
                        </p>
                      )
                    )}

                    {/* Dates tab */}
                    {tab === "dates" && (
                      trip.departure_date ? (
                        <StaggerContainer className="space-y-3" staggerDelay={0.07}>
                          <StaggerItem>
                            <div className="flex items-center justify-between p-6 rounded-2xl border border-[var(--line)] hover:border-[var(--ink)] transition-colors">
                              <div>
                                <div className="font-display text-[20px] tracking-tight">
                                  {formatTripDate(trip.departure_date)}
                                  {trip.return_date && ` — ${formatTripDate(trip.return_date)}`}
                                </div>
                                {!isIndividual && (
                                  <div className="text-[12px] text-[var(--muted)] mt-1 tracking-tight">
                                    {availability.label}
                                    {remainingSeats !== null && remainingSeats > 0 && remainingSeats <= 5 &&
                                      ` · ${remainingSeats} lugar${remainingSeats !== 1 ? "es" : ""}`}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-[20px] font-medium tracking-tight">{formatPrice(trip.price_from)}</div>
                                <div className="text-[12px] text-[var(--muted)] tracking-tight">por pessoa</div>
                              </div>
                            </div>
                          </StaggerItem>
                        </StaggerContainer>
                      ) : (
                        <p className="text-[var(--muted)] text-[14px] tracking-tight">
                          Datas disponíveis a pedido. Contacte a nossa equipa.
                        </p>
                      )
                    )}
                  </div>
                </SlideUp>

              </div>

              {/* Right column: Booking Card (sticky) */}
              <SlideIn direction="right" delay={0.1} className="mt-6 lg:mt-0 lg:col-span-5 xl:col-span-4">
                <div className="lg:sticky lg:top-[116px] rounded-[20px] sm:rounded-[28px] bg-[var(--cream-2)] p-4 sm:p-5 md:p-7 border border-[var(--line)]">
                  <div className="flex items-end justify-between pb-6 border-b border-[var(--line-2)]">
                    <div>
                      <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--muted)]">desde</div>
                      <div className="mt-1 font-display text-[40px] leading-none">{formatPrice(trip.price_from)}</div>
                      <div className="mt-1 text-[12px] text-[var(--muted)] tracking-tight">por pessoa</div>
                      {!isIndividual && remainingSeats !== null && trip.trip_type !== "grupo" && (
                        <div className={`mt-1.5 text-[12px] font-medium tracking-tight ${
                          remainingSeats === 0 ? "text-red-600" :
                          remainingSeats <= 5  ? "text-amber-700" : "text-emerald-700"
                        }`}>
                          {remainingSeats === 0
                            ? "Não disponível"
                            : remainingSeats <= 5
                              ? `Últimos lugares · ${remainingSeats} lugar${remainingSeats !== 1 ? "es" : ""}`
                              : `${remainingSeats} lugar${remainingSeats !== 1 ? "es" : ""} disponíve${remainingSeats !== 1 ? "is" : "l"}`}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[13px]">
                      <Star className="w-4 h-4" style={{ fill: "var(--gold)", color: "var(--gold)" }} /> {trip.rating}
                    </div>
                  </div>

                  {submitted ? (
                    <div className="mt-6 py-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                        <Check className="w-6 h-6 text-emerald-600" />
                      </div>
                      <p className="font-display text-[20px] tracking-tight">Reserva recebida!</p>
                      <p className="mt-2 text-[13px] text-[var(--muted)] leading-relaxed">
                        Entraremos em contacto em breve para confirmar a sua reserva.
                      </p>
                    </div>
                  ) : (
                  <form onSubmit={handleBooking} className="space-y-3 mt-6">
                    {groupDates.length > 0 ? (
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-2">Data de partida</div>
                        <div className="space-y-2">
                          {groupDates.map((d) => {
                            const isSelected = selectedDate === d.id;
                            const rem = dateSeats[d.id] ?? d.available_seats;
                            const isSoldOut = rem === 0;
                            return (
                              <button
                                key={d.id}
                                type="button"
                                disabled={isSoldOut}
                                onClick={() => !isSoldOut && setSelectedDate(d.id)}
                                className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                                  isSoldOut
                                    ? "border-[var(--line)] bg-[var(--cream-2)] opacity-50 cursor-not-allowed"
                                    : isSelected
                                      ? "border-[var(--ink)] bg-white"
                                      : "border-[var(--line)] bg-white hover:border-[var(--ink-soft)]"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-[13.5px] font-medium">{formatTripDate(d.departure_date)}</span>
                                    {d.return_date && (
                                      <span className="text-[12px] text-[var(--muted)] ml-2">→ {formatTripDate(d.return_date)}</span>
                                    )}
                                    {d.notes && (
                                      <div className="text-[11px] text-[var(--muted)] mt-0.5">{d.notes}</div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      const rem = dateSeats[d.id] ?? d.available_seats;
                                      if (rem == null) return null;
                                      if (rem === 0) return <span className="text-[11px] font-medium text-red-500">Esgotado</span>;
                                      return (
                                        <span className={`text-[11px] font-medium ${rem <= 3 ? "text-amber-600" : "text-emerald-600"}`}>
                                          {rem} lugar{rem !== 1 ? "es" : ""}
                                        </span>
                                      );
                                    })()}
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-[var(--ink)] bg-[var(--ink)]" : "border-[var(--line-2)]"}`}>
                                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : trip.trip_type !== "grupo" ? (
                      <div className="grid grid-cols-2 gap-3">
                        <label className="block rounded-xl bg-white border border-[var(--line)] px-4 py-3">
                          <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Início</span>
                          <input ref={checkInRef} type="date" className="w-full mt-1 bg-transparent text-[13px] focus:outline-none" />
                        </label>
                        <label className="block rounded-xl bg-white border border-[var(--line)] px-4 py-3">
                          <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Fim</span>
                          <input ref={checkOutRef} type="date" className="w-full mt-1 bg-transparent text-[13px] focus:outline-none" />
                        </label>
                      </div>
                    ) : null}
                    <label className="block rounded-xl bg-white border border-[var(--line)] px-4 py-3">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Viajantes</span>
                      <div className="flex items-center justify-between mt-1 text-[13px]">
                        <motion.button
                          type="button"
                          whileHover={{ scale: reduced ? 1 : 1.15 }}
                          whileTap={{ scale: reduced ? 1 : 0.85 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          onClick={() => setPax(Math.max(1, pax - 1))}
                          className="w-5 h-5 rounded-full bg-[var(--cream-2)] flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </motion.button>
                        {pax} adulto{pax !== 1 ? "s" : ""}
                        <motion.button
                          type="button"
                          whileHover={{ scale: reduced ? 1 : 1.15 }}
                          whileTap={{ scale: reduced ? 1 : 0.85 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          onClick={() => setPax(Math.min(maxPax, pax + 1))}
                          disabled={pax >= maxPax}
                          className="w-5 h-5 rounded-full bg-[var(--cream-2)] flex items-center justify-center disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </motion.button>
                      </div>
                    </label>

                    {/* Titular da reserva */}
                    <div className="space-y-3">
                      {pax > 1 && (
                        <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] pt-1">
                          Titular da reserva
                        </div>
                      )}
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Nome completo"
                        className="w-full rounded-xl bg-white border border-[var(--line)] px-4 py-3 text-[13.5px] focus:outline-none focus:border-[var(--ink)] transition-colors"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="E-mail"
                          className="w-full rounded-xl bg-white border border-[var(--line)] px-4 py-3 text-[13.5px] focus:outline-none focus:border-[var(--ink)] transition-colors"
                        />
                        <input
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="Telefone"
                          className="w-full rounded-xl bg-white border border-[var(--line)] px-4 py-3 text-[13.5px] focus:outline-none focus:border-[var(--ink)] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Acompanhantes — quando há mais de um viajante */}
                    {companions.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                          Acompanhante{companions.length > 1 ? "s" : ""}
                        </div>
                        {companions.map((name, i) => (
                          <input
                            key={i}
                            value={name}
                            onChange={(e) => {
                              const next = [...companions];
                              next[i] = e.target.value;
                              setCompanions(next);
                            }}
                            placeholder={`Acompanhante ${i + 1} — Nome completo`}
                            className="w-full rounded-xl bg-white border border-[var(--line)] px-4 py-3 text-[13.5px] focus:outline-none focus:border-[var(--ink)] transition-colors"
                          />
                        ))}
                      </div>
                    )}

                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={3}
                      placeholder="Conte-nos como sonha esta viagem (opcional)"
                      className="w-full rounded-xl bg-white border border-[var(--line)] px-4 py-3 text-[13.5px] focus:outline-none focus:border-[var(--ink)] resize-none transition-colors"
                    />

                    {formError && <p className="text-[12px] text-red-600">{formError}</p>}

                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: reduced ? 1 : 1.02 }}
                      whileTap={{ scale: reduced ? 1 : 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full text-[var(--dark)] px-7 py-4 text-[15px] font-semibold tracking-tight transition-all hover:brightness-110 mt-2 disabled:opacity-60"
                      style={{ background: "var(--gold)" }}
                    >
                      {submitting ? "A processar…" : <><span>Efetuar reserva</span> <ArrowRight className="w-4 h-4" /></>}
                    </motion.button>
                    {trip.pdf_url && (
                      <a
                        href={trip.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line-2)] hover:border-[var(--ink)] px-7 py-3.5 text-[14px] tracking-tight transition-colors"
                      >
                        <FileText className="w-4 h-4" /> Descarregar ficha da viagem
                      </a>
                    )}
                    <Link href="/contacto" className="w-full text-center block text-[13px] py-2 text-[var(--muted)] hover:text-[var(--ink)] tracking-tight transition-colors">
                      Entrar em contacto com a equipa →
                    </Link>
                  </form>
                  )}

                  <div className="mt-6 pt-6 border-t border-[var(--line-2)] text-[12px] text-[var(--muted)] leading-relaxed">
                    <strong className="text-[var(--ink)] font-medium block mb-1">Reserva sem risco</strong>
                    A sua reserva será confirmada em 48h. Pagamento apenas após confirmação do
                    programa final.
                  </div>
                </div>
              </SlideIn>

            </div>
          </section>

          {/* Quote section */}
          <section className="mt-16 md:mt-32 relative h-[50vh] min-h-[320px] md:h-[80vh] md:min-h-[560px] overflow-hidden">
            <motion.img
              src={trip.hero_image_url ?? ""}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ scale: reduced ? 1 : 1.05 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: reduced ? 0.01 : 1.2, ease: "easeOut" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/30" />
            <div className="relative h-full max-w-[1320px] mx-auto px-6 lg:px-10 flex flex-col justify-center text-white">
              <SlideUp delay={0.1} className="max-w-2xl">
                <SectionLabel>
                  <span className="text-white/60">Inspiração</span>
                </SectionLabel>
                <h2 className="mt-6 font-display text-[28px] sm:text-[38px] md:text-[56px] lg:text-[80px] leading-[0.98] tracking-tight text-balance">
                  &ldquo;Não viajamos para fugir da vida.{" "}
                  <span className="italic font-light">Viajamos para que a vida não nos fuja.&rdquo;</span>
                </h2>
                <div className="mt-8 text-[13px] tracking-[0.2em] uppercase text-white/60">
                  — Anthony Bourdain
                </div>
              </SlideUp>
            </div>
          </section>
        </div>
      </main>
      <Footer className="!mt-0" />
    </>
  );
}
