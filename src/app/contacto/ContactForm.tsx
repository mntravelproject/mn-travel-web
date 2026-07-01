"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { User, Mail, Phone, MessageSquare, Check } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const CONTACT_TYPES = [
  { value: "orcamento",   label: "Pedido de Orçamento Personalizado" },
  { value: "informacao",  label: "Pedido de Informação" },
  { value: "ajuda",       label: "Pedido de Ajuda" },
  { value: "outro",       label: "Outro" },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function ContactForm() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    type: "", subject: "", message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("O nome, o e-mail e a mensagem são obrigatórios.");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:    form.name,
        email:   form.email,
        phone:   form.phone   || null,
        type:    form.type    || "informacao",
        subject: form.subject || null,
        message: form.message,
      }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(json.error || "Erro ao enviar. Por favor tente novamente."); }
    else         { setSuccess(true); }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-7">
          <Check className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-[28px] tracking-tight">Mensagem enviada!</h3>
        <p className="mt-3 text-[15px] text-[var(--muted)] leading-relaxed max-w-sm">
          Recebemos o seu contacto e responderemos em breve.
        </p>
        <button
          onClick={() => { setSuccess(false); setForm({ name: "", email: "", phone: "", type: "", subject: "", message: "" }); }}
          className="mt-8 text-[13px] tracking-tight text-[var(--muted)] hover:text-[var(--ink)] transition underline underline-offset-4"
        >
          Enviar nova mensagem
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nome */}
      <div>
        <label className="block text-[10.5px] uppercase tracking-[0.18em] text-[var(--muted)] mb-2">
          Nome completo <span style={{ color: "var(--gold)" }}>*</span>
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
          <input
            type="text" required value={form.name} onChange={set("name")}
            placeholder="O seu nome"
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-[var(--line)] rounded-xl text-[14px] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] transition"
          />
        </div>
      </div>

      {/* Email + Telefone */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10.5px] uppercase tracking-[0.18em] text-[var(--muted)] mb-2">
            E-mail <span style={{ color: "var(--gold)" }}>*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
            <input
              type="email" required value={form.email} onChange={set("email")}
              placeholder="email@exemplo.pt"
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-[var(--line)] rounded-xl text-[14px] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] transition"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10.5px] uppercase tracking-[0.18em] text-[var(--muted)] mb-2">Telefone</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
            <input
              type="tel" value={form.phone} onChange={set("phone")}
              placeholder="+351 9xx xxx xxx"
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-[var(--line)] rounded-xl text-[14px] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] transition"
            />
          </div>
        </div>
      </div>

      {/* Tipo de contacto */}
      <div>
        <label className="block text-[10.5px] uppercase tracking-[0.18em] text-[var(--muted)] mb-2">Tipo de contacto</label>
        <Select
          value={form.type || "__placeholder__"}
          onValueChange={(v) => setForm((f) => ({ ...f, type: v === "__placeholder__" ? "" : v }))}
        >
          <SelectTrigger className="py-3.5">
            <SelectValue placeholder="Seleccionar tipo…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__placeholder__" className="text-[var(--muted)]">Seleccionar tipo…</SelectItem>
            {CONTACT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Assunto */}
      <div>
        <label className="block text-[10.5px] uppercase tracking-[0.18em] text-[var(--muted)] mb-2">Assunto</label>
        <input
          type="text" value={form.subject} onChange={set("subject")}
          placeholder="Resumo breve do seu pedido"
          className="w-full px-4 py-3.5 bg-white border border-[var(--line)] rounded-xl text-[14px] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] transition"
        />
      </div>

      {/* Mensagem */}
      <div>
        <label className="block text-[10.5px] uppercase tracking-[0.18em] text-[var(--muted)] mb-2">
          Mensagem <span style={{ color: "var(--gold)" }}>*</span>
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-[var(--muted)] pointer-events-none" />
          <textarea
            required rows={5} value={form.message} onChange={set("message")}
            placeholder="Descreva o seu pedido em detalhe…"
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-[var(--line)] rounded-xl text-[14px] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] transition resize-none"
          />
        </div>
      </div>

      {error && <p className="text-[13px] text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full py-4 text-[14px] font-semibold tracking-tight transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "var(--gold)", color: "var(--dark)" }}
      >
        {submitting ? "A enviar…" : "Enviar mensagem →"}
      </button>

      <p className="text-[11px] text-center text-[var(--muted)] leading-relaxed">
        Os seus dados são tratados de forma confidencial e nunca partilhados com terceiros.
      </p>
    </form>
  );
}
