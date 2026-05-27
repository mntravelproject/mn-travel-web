import { Quote } from "lucide-react";
import type { Testimonial } from "@/types/database";

interface Props {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: Props) {
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-[var(--cream)] pt-28 pb-32">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Left */}
          <div className="lg:col-span-4">
            <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[var(--muted)] mb-6">
              <span className="h-px w-8 bg-[var(--clay)]/40" />
              O que dizem
            </div>
            <h2 className="font-display text-[42px] md:text-[50px] leading-[1.02] tracking-tight text-balance text-[var(--ink)]">
              Viagens que{" "}
              <span className="italic font-light">ficam</span>{" "}
              para sempre.
            </h2>

            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                {testimonials.slice(0, 4).map((t) => (
                  t.author_avatar && (
                    <img
                      key={t.id}
                      src={t.author_avatar}
                      alt={t.author_name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[var(--cream)]"
                    />
                  )
                ))}
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
                  4.97 · {testimonials.length}+ viajantes
                </div>
              </div>
            </div>
          </div>

          {/* Right: cards */}
          <div className="lg:col-span-8 grid md:grid-cols-2 gap-5">
            {testimonials.slice(0, 2).map((t, i) => (
              <div
                key={t.id}
                className={`p-8 rounded-[24px] bg-[var(--surface-mid)] border border-white/[0.06] ${i === 1 ? "md:mt-10" : ""}`}
              >
                <Quote className="w-8 h-8 text-[var(--clay)] mb-6" strokeWidth={1.5} />
                <p className="font-display text-[20px] leading-[1.35] tracking-tight text-balance text-white">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-8 flex items-center gap-3">
                  {t.author_avatar && (
                    <img
                      src={t.author_avatar}
                      alt={t.author_name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                    />
                  )}
                  <div>
                    <div className="text-[14px] font-medium tracking-tight text-white">{t.author_name}</div>
                    {t.destination && (
                      <div className="text-[12px] text-white/40 tracking-tight">{t.destination}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}