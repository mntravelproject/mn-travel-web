import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArrowRight, Globe, Heart, Star, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre — MN Travel",
  description: "Somos curadores de experiências de viagem. Conheça a nossa história, filosofia e a equipa por detrás da MN Travel.",
};

const VALUES = [
  {
    icon: Heart,
    title: "Paixão pelo detalhe",
    description: "Cada viagem é construída com atenção minuciosa a cada momento — do hotel ao guia local, da mesa de jantar ao pôr do sol.",
  },
  {
    icon: Globe,
    title: "Conhecimento do mundo",
    description: "Anos de experiência em destinos de todos os continentes permitem-nos recomendar o que realmente vale a pena.",
  },
  {
    icon: Star,
    title: "Exclusividade",
    description: "Acesso a experiências e propriedades fora do alcance das plataformas de viagem convencionais.",
  },
  {
    icon: Shield,
    title: "Confiança e discrição",
    description: "Acompanhamos cada cliente com total privacidade e disponibilidade antes, durante e após a viagem.",
  },
];

export default function SobrePage() {
  return (
    <>
      <Header />
      <main>

        {/* Dark hero */}
        <section
          style={{
            minHeight: "56vh", position: "relative",
            display: "flex", alignItems: "center",
            overflow: "hidden", background: "var(--dark)",
            padding: "clamp(110px,15vw,150px) 6vw 76px",
          }}
        >
          <div
            style={{
              position: "absolute", inset: 0,
              backgroundSize: "cover", backgroundPosition: "center",
              backgroundImage: "url('https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=2400&q=90')",
              opacity: 0.28,
            }}
          />
          <div
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(105deg, rgba(10,18,28,.92) 40%, rgba(10,18,28,.35) 100%)",
            }}
          />
          <div style={{ position: "relative", zIndex: 2, color: "#fff", maxWidth: 1440, margin: "0 auto", width: "100%" }}>
            <div
              style={{
                fontSize: 10.5, fontWeight: 700, letterSpacing: "0.22em",
                textTransform: "uppercase", color: "var(--gold2)", marginBottom: 16,
              }}
            >
              Sobre nós
            </div>
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(44px, 5.5vw, 78px)", fontWeight: 400,
                lineHeight: 0.93, letterSpacing: "-.04em", maxWidth: 680,
              }}
            >
              Não fabricamos<br />viagens. <em>Desenhamos</em><br />histórias.
            </h1>
          </div>
        </section>

        {/* Imagem + Missão */}
        <section className="max-w-[1320px] mx-auto px-6 lg:px-10 py-14 md:py-24 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center border-b border-[var(--line)]">
          <div className="rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[520px]">
            <img
              src="https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=1200&q=85"
              alt="Viagem de luxo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <SectionLabel>A nossa missão</SectionLabel>
            <h2 className="mt-5 font-display text-[28px] sm:text-[36px] md:text-[44px] leading-[1.05] tracking-tight">
              Curar experiências que ficam para sempre.
            </h2>
            <div className="mt-6 space-y-4 text-[15px] text-[var(--muted)] leading-relaxed">
              <p>
                Não somos uma agência de viagens convencional. Somos curadores — pessoas que visitaram os destinos, dormiu nos hotéis e conhece os guias que recomendam.
              </p>
              <p>
                Trabalhamos com um número limitado de clientes por ano para garantir que cada viagem recebe a atenção que merece. O resultado é uma experiência desenhada ao milímetro, onde o imprevisto agradável faz parte do plano.
              </p>
              <p>
                Da primeira conversa ao regresso a casa, a MN Travel está sempre a um contacto de distância.
              </p>
            </div>
            <div className="mt-8 h-px bg-[var(--line)]" />
            <div className="mt-8 grid grid-cols-3 gap-6">
              {[
                { value: "10+", label: "Anos de experiência" },
                { value: "60+", label: "Destinos no mundo" },
                { value: "500+", label: "Viagens realizadas" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="font-display text-[32px] tracking-tight" style={{ color: "var(--gold)" }}>{value}</div>
                  <div className="mt-1 text-[12px] text-[var(--muted)] leading-snug tracking-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="max-w-[1320px] mx-auto px-6 lg:px-10 py-14 md:py-24 border-b border-[var(--line)]">
          <SectionLabel>O que nos guia</SectionLabel>
          <h2 className="mt-5 font-display text-[28px] sm:text-[36px] md:text-[44px] tracking-tight max-w-xl">
            Os valores por detrás de cada viagem.
          </h2>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="space-y-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--gold-soft)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "var(--gold)" }} strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-[20px] tracking-tight">{title}</h3>
                <p className="text-[14px] text-[var(--muted)] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Abordagem */}
        <section className="max-w-[1320px] mx-auto px-6 lg:px-10 py-14 md:py-24 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center border-b border-[var(--line)]">
          <div>
            <SectionLabel>A nossa abordagem</SectionLabel>
            <h2 className="mt-5 font-display text-[28px] sm:text-[36px] md:text-[44px] leading-[1.05] tracking-tight">
              Cada cliente é único.<br />
              <span className="italic font-light">Cada viagem também.</span>
            </h2>
            <div className="mt-8 space-y-6">
              {[
                { num: "01", title: "Conversa inicial", desc: "Começamos por ouvir — os seus interesses, o seu ritmo, o que já viveu e o que ainda quer viver." },
                { num: "02", title: "Proposta à medida", desc: "Desenhamos um itinerário personalizado com selecção de alojamentos, experiências e logística completa." },
                { num: "03", title: "Afinação e detalhe", desc: "Refinamos juntos cada pormenor até a viagem estar exactamente como imaginou." },
                { num: "04", title: "Acompanhamento total", desc: "Durante a viagem, estamos disponíveis 24/7 para qualquer necessidade." },
              ].map(({ num, title, desc }) => (
                <div key={num} className="flex gap-5">
                  <span className="font-display text-[13px] tracking-widest pt-0.5 shrink-0" style={{ color: "var(--gold)" }}>{num}</span>
                  <div>
                    <div className="font-medium text-[15px] tracking-tight mb-1">{title}</div>
                    <p className="text-[14px] text-[var(--muted)] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden aspect-[4/5]">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=85"
              alt="Paisagem de viagem"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* CTA */}
        <section
          className="flex items-center min-h-[280px] md:min-h-[400px] py-14 px-6 sm:py-16 sm:px-10 md:py-[90px] md:px-[8vw]"
          style={{
            color: "white",
            background: `
              linear-gradient(90deg, rgba(0,0,0,.86) 0%, rgba(0,0,0,.67) 38%, rgba(0,0,0,.10) 100%),
              url('https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=2400&q=90') center/cover no-repeat
            `,
          }}
        >
          <div>
            <h2 className="font-display text-[26px] sm:text-[32px] md:text-[42px] leading-[1.05]" style={{ margin: "0 0 18px" }}>
              Pronto para começar<br />a sua próxima aventura?
            </h2>
            <p className="text-[15px] sm:text-[17px] leading-relaxed max-w-md" style={{ color: "rgba(255,255,255,.88)", margin: "0 0 28px" }}>
              Fale com a nossa equipa e desenhe a viagem que sempre imaginou.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contacto"
                className="inline-flex items-center gap-3 transition-all hover:gap-5 text-[14px] sm:text-[16px] font-bold"
                style={{
                  padding: "14px 22px",
                  border: "1.5px solid var(--gold2)",
                  color: "var(--gold2)",
                  borderRadius: 999,
                  textDecoration: "none",
                }}
              >
                Contactar-nos <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/viagens"
                className="inline-flex items-center gap-3 transition-all hover:gap-5 text-[14px] sm:text-[16px] font-medium"
                style={{
                  padding: "14px 22px",
                  border: "1.5px solid rgba(255,255,255,.35)",
                  color: "rgba(255,255,255,.85)",
                  borderRadius: 999,
                  textDecoration: "none",
                }}
              >
                Ver viagens <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
