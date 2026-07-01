"use client";

import { SlideIn, AnimatedCounter } from "@/components/animations";
import { ParallaxSection } from "@/components/animations/ParallaxSection";

const stats = [
  { n: "17", l: "anos de organização" },
  { n: "62", l: "destinos curados" },
  { n: "98%", l: "voltam a viajar" },
];

const images = [
  {
    src: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&q=85",
    className: "aspect-[3/4] rounded-2xl overflow-hidden",
  },
  {
    src: "https://images.unsplash.com/photo-1518509562904-e7ef99cddc85?w=900&q=85",
    className: "aspect-[4/5] rounded-2xl overflow-hidden",
  },
  {
    src: "https://images.unsplash.com/photo-1565689157206-0fddef7589a2?w=900&q=85",
    className: "aspect-square rounded-2xl overflow-hidden",
  },
];

export function PhilosophySection() {
  return (
    <section className="mt-16 md:mt-36 relative overflow-hidden" style={{ background: "var(--dark)" }}>
      {/* Subtle grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="max-w-[1380px] mx-auto px-5 md:px-8 lg:px-14 py-14 sm:py-24 lg:py-44 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left: text */}
        <SlideIn direction="left" className="lg:col-span-5" delay={0.05}>
          {/* Gold eyebrow */}
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] mb-7" style={{ color: "var(--gold)" }}>
            <span className="h-px w-8" style={{ background: "var(--gold)" }} />
            A filosofia MN
          </div>

          <h3 className="font-display text-[26px] sm:text-[34px] md:text-[44px] lg:text-[58px] leading-[1.04] tracking-tight text-white">
            Não vendemos
            <br />
            destinos. Desenhamos{" "}
            <span className="italic font-normal">tempo bem vivido.</span>
          </h3>

          {/* Gold divider */}
          <div className="mt-8 mb-8 w-12 h-[2px]" style={{ background: "var(--gold2)" }} />

          <p className="text-white/60 text-[16px] leading-relaxed max-w-md">
            Trabalhamos sem catálogos. Sem grupos. Sem pressa. Cada viagem nasce
            de uma conversa — e termina onde a memória começa.
          </p>

          {/* Stats — gold accent */}
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            {stats.map((s) => (
              <div key={s.l}>
                <div className="font-display text-[28px] md:text-[38px] leading-none" style={{ color: "var(--gold2)" }}>
                  <AnimatedCounter value={s.n} duration={1.6} />
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.15em] text-white/45">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </SlideIn>

        {/* Right: image grid */}
        <SlideIn direction="right" className="lg:col-span-7 grid grid-cols-2 gap-4" delay={0.15}>
          <ParallaxSection speed={0.06} className={images[0].className}>
            <img
              src={images[0].src}
              alt=""
              className="w-full h-full object-cover scale-105"
              loading="lazy"
            />
          </ParallaxSection>
          <div className="space-y-4 mt-12">
            <ParallaxSection speed={0.04} className={images[1].className}>
              <img src={images[1].src} alt="" className="w-full h-full object-cover scale-105" loading="lazy" />
            </ParallaxSection>
            <ParallaxSection speed={0.08} className={images[2].className}>
              <img src={images[2].src} alt="" className="w-full h-full object-cover scale-105" loading="lazy" />
            </ParallaxSection>
          </div>
        </SlideIn>
      </div>
    </section>
  );
}
