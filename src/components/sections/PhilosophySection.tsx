"use client";

import { SlideIn, AnimatedCounter } from "@/components/animations";
import { ParallaxSection } from "@/components/animations/ParallaxSection";

const stats = [
  { n: "17", l: "anos de curadoria" },
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
    <section className="mt-32 relative bg-[var(--ink)] text-[var(--cream)] overflow-hidden">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 py-28 lg:py-40 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left: text — slides in from left */}
        <SlideIn direction="left" className="lg:col-span-5" delay={0.05}>
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/45 flex items-center gap-3">
            <span className="h-px w-8 bg-white/30" /> A filosofia MN
          </div>
          <h3 className="mt-6 font-display text-[40px] md:text-[56px] leading-[1.05] tracking-tight">
            Não vendemos
            <br />
            destinos. Desenhamos{" "}
            <span className="italic font-light">tempo bem vivido.</span>
          </h3>
          <p className="mt-8 text-white/65 text-[15px] leading-relaxed max-w-md">
            Trabalhamos sem catálogos. Sem grupos. Sem pressa. Cada viagem nasce
            de uma conversa — e termina onde a memória começa.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
            {stats.map((s) => (
              <div key={s.l}>
                <div className="font-display text-[36px] leading-none">
                  <AnimatedCounter value={s.n} duration={1.6} />
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.15em] text-white/50">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </SlideIn>

        {/* Right: image grid — slides in from right */}
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
