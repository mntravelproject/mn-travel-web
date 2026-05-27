import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Pill } from "@/components/ui/Pill";

export function CTASection() {
  return (
    <section className="max-w-[1320px] mx-auto px-6 lg:px-10 mt-32 mb-32">
      <div className="relative overflow-hidden rounded-[32px]">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=2000&q=85"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 to-black/30" />

        <div className="relative px-10 py-24 lg:px-20 lg:py-32 max-w-2xl">
          <Pill className="!bg-white/15 !border-white/30 !text-white">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" />
            Curadoria exclusiva
          </Pill>
          <h2 className="mt-6 font-display text-[44px] md:text-[60px] leading-[1.02] tracking-tight text-white text-balance">
            A próxima história{" "}
            <span className="italic font-light">começa aqui.</span>
          </h2>
          <p className="mt-6 text-white/70 text-[15px] leading-relaxed max-w-sm">
            Conte-nos o que sonha e desenhamos a viagem da sua vida. Sem catálogos. Sem compromisso.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/viagens"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--clay)] hover:bg-[var(--clay-dark)] text-white px-7 py-3.5 text-[14px] font-medium tracking-tight transition"
            >
              Explorar viagens <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="tel:+351210000000"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 hover:border-white text-white px-7 py-3.5 text-[14px] tracking-tight transition"
            >
              <Phone className="w-4 h-4" /> +351 210 000 000
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}