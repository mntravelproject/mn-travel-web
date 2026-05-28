import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

export function CTASection() {
  return (
    <section className="bg-[var(--surface-dark)] pt-4 pb-0">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 pb-0">
        <div className="relative overflow-hidden rounded-[28px]">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=2000&q=85"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--surface-dark)]/85 via-[var(--surface-dark)]/50 to-transparent" />

          <div className="relative px-10 py-24 lg:px-20 lg:py-32 max-w-2xl">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass mb-8 text-[12px] tracking-[0.14em] uppercase text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--clay-soft)]" />
              Curadoria exclusiva
            </div>
            <h2 className="font-display text-[44px] md:text-[58px] leading-[1.02] tracking-tight text-white text-balance">
              A próxima história{" "}
              <span className="italic font-light text-[var(--clay-soft)]">começa aqui.</span>
            </h2>
            <p className="mt-6 text-white/55 text-[15px] leading-relaxed max-w-sm">
              Conte-nos o que sonha e desenhamos a viagem da sua vida. Sem catálogos. Sem compromisso.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/viagens"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--clay)] hover:bg-[var(--clay-dark)] text-white px-7 py-3.5 text-[14px] font-medium tracking-tight transition-colors"
              >
                Explorar viagens <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:+351210000000"
                className="inline-flex items-center gap-2 rounded-full glass border-white/20 hover:bg-white/15 text-white px-7 py-3.5 text-[14px] tracking-tight transition-all"
              >
                <Phone className="w-4 h-4" /> +351 210 000 000
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}