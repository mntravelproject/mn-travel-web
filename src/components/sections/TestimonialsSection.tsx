import { Quote } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SlideUp, SlideIn, StaggerContainer, StaggerItem } from "@/components/animations";
import type { Testimonial } from "@/types/database";

interface Props {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: Props) {
  if (testimonials.length === 0) return null;

  return (
    <section className="max-w-[1320px] mx-auto px-6 lg:px-10 mt-32">
      <div className="grid lg:grid-cols-12 gap-16 items-start">
        {/* Left */}
        <SlideIn direction="left" className="lg:col-span-4" delay={0.05}>
          <SectionLabel>O que dizem</SectionLabel>
          <h2 className="mt-5 font-display text-[44px] md:text-[52px] leading-[1.02] tracking-tight text-balance">
            Viagens que{" "}
            <span className="italic font-light">ficam</span>{" "}
            para sempre.
          </h2>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {testimonials.slice(0, 4).map((t) =>
                t.author_avatar ? (
                  <img
                    key={t.id}
                    src={t.author_avatar}
                    alt={t.author_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[var(--cream)]"
                  />
                ) : (
                  <div
                    key={t.id}
                    className="w-10 h-10 rounded-full bg-[var(--cream-2)] border-2 border-[var(--cream)] flex items-center justify-center font-display text-[14px] text-[var(--ink)]"
                  >
                    {t.author_name.charAt(0)}
                  </div>
                )
              )}
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 fill-[var(--clay)]" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <div className="mt-1 text-[12px] text-[var(--muted)] tracking-tight">
                4.97 · {testimonials.length * 40}+ viajantes
              </div>
            </div>
          </div>
        </SlideIn>

        {/* Right: cards — stagger */}
        <StaggerContainer
          className="lg:col-span-8 grid md:grid-cols-2 gap-6"
          staggerDelay={0.12}
          initialDelay={0.1}
        >
          {testimonials.slice(0, 2).map((t, i) => (
            <StaggerItem key={t.id}>
              <div className={`p-8 rounded-2xl bg-[var(--cream-2)] h-full ${i === 1 ? "md:mt-12" : ""}`}>
                <Quote className="w-8 h-8 text-[var(--clay)] mb-6" strokeWidth={1.5} />
                <p className="font-display text-[22px] leading-[1.3] tracking-tight text-balance">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-8 flex items-center gap-3">
                  {t.author_avatar ? (
                    <img
                      src={t.author_avatar}
                      alt={t.author_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--line)] flex items-center justify-center font-display text-[14px] text-[var(--ink)]">
                      {t.author_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="text-[14px] font-medium tracking-tight">{t.author_name}</div>
                    {t.destination && (
                      <div className="text-[12px] text-[var(--muted)] tracking-tight">{t.destination}</div>
                    )}
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
