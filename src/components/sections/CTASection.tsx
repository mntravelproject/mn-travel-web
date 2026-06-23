import Link from "next/link";
import { ArrowRight, Phone, Star, Clock, Shield, Headphones } from "lucide-react";
import { ScaleIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/animations";

const benefits = [
  { icon: Star,        label: "Curadoria exclusiva",         sub: "Itinerários únicos" },
  { icon: Clock,       label: "Atenção 24/7",                sub: "Durante toda a viagem" },
  { icon: Shield,      label: "Garantia de qualidade",       sub: "Total tranquilidade" },
  { icon: Headphones,  label: "Apoio personalizado",         sub: "Do planeamento ao regresso" },
];

export function CTASection() {
  return (
    <div className="max-w-[1380px] mx-auto px-5 md:px-8 lg:px-14 mt-16 md:mt-36 mb-0 space-y-6">
      {/* Bespoke banner */}
      <ScaleIn from={0.96} duration={0.75}>
        <div className="relative overflow-hidden rounded-[28px] min-h-[480px]">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=2000&q=85"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(110deg, rgba(7,17,27,.88) 0%, rgba(7,17,27,.54) 55%, rgba(7,17,27,.22) 100%),
                linear-gradient(180deg, rgba(7,17,27,.18) 0%, rgba(7,17,27,.04) 50%)
              `,
            }}
          />

          <div className="relative px-6 py-10 sm:px-10 sm:py-16 lg:px-20 lg:py-28 max-w-[660px]">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] font-semibold mb-7" style={{ color: "var(--gold2)" }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "var(--gold2)" }} />
              Curadoria exclusiva · Por encomenda
            </div>

            <h2 className="font-display text-[26px] sm:text-[36px] md:text-[46px] lg:text-[64px] leading-[1.0] tracking-tight text-white text-balance mb-6">
              A próxima história{" "}
              <span className="italic font-normal">começa aqui.</span>
            </h2>

            <p className="text-white/65 text-[16px] leading-relaxed max-w-[420px] mb-10">
              Conte-nos o que sonha e desenhamos a viagem da sua vida. Sem catálogos. Sem compromisso.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/viagens"
                className="inline-flex items-center gap-2 rounded-full text-[var(--dark)] px-8 py-4 text-[15px] font-semibold tracking-tight transition-all hover:brightness-110"
                style={{ background: "var(--gold2)" }}
              >
                Explorar viagens <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:+351210000000"
                className="inline-flex items-center gap-2 rounded-full border border-white/35 hover:border-white text-white/85 hover:text-white px-8 py-4 text-[15px] tracking-tight transition-colors"
              >
                <Phone className="w-4 h-4" /> +351 210 000 000
              </a>
            </div>
          </div>
        </div>
      </ScaleIn>

      {/* Benefits row */}
      <SlideUp delay={0.1}>
        <div className="rounded-[20px] border border-[var(--line)] bg-[var(--cream-2)]">
          <StaggerContainer
            className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x-0 lg:divide-x divide-[var(--line)]"
            staggerDelay={0.07}
          >
            {benefits.map(({ icon: Icon, label, sub }) => (
              <StaggerItem key={label}>
                <div className="flex items-center gap-3 sm:gap-4 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--gold-soft)" }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: "var(--gold)" }} strokeWidth={1.5} />
                  </span>
                  <div>
                    <div className="text-[14px] font-semibold tracking-tight text-[var(--ink)]">{label}</div>
                    <div className="text-[12px] text-[var(--muted)] tracking-tight">{sub}</div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </SlideUp>
    </div>
  );
}
