import { Quote } from "lucide-react";
import { testimonials } from "@/lib/data";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function TestimonialsSection() {
  return (
    <section className="max-w-[1320px] mx-auto px-6 lg:px-10 mt-32">
      <div className="grid lg:grid-cols-12 gap-16 items-start">
        {/* Left */}
        <div className="lg:col-span-4">
          <SectionLabel>O que dizem</SectionLabel>
          <h2 className="mt-5 font-display text-[44px] md:text-[52px] leading-[1.02] tracking-tight text-balance">
            Viagens que{" "}
            <span className="italic font-light">ficam</span>{" "}
            para sempre.
          </h2>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {testimonials.map((t) => (
                <img
                  key={t.name}
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[var(--cream)]"
                />
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
                4.97 · 556 viajantes
              </div>
            </div>
          </div>
        </div>

        {/* Right: cards */}
        <div className="lg:col-span-8 grid md:grid-cols-2 gap-6">
          {testimonials.slice(0, 2).map((t, i) => (
            <div
              key={t.name}
              className={`p-8 rounded-2xl bg-[var(--cream-2)] ${i === 1 ? "md:mt-12" : ""}`}
            >
              <Quote className="w-8 h-8 text-[var(--clay)] mb-6" strokeWidth={1.5} />
              <p className="font-display text-[22px] leading-[1.3] tracking-tight text-balance">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-8 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-[14px] font-medium tracking-tight">{t.name}</div>
                  <div className="text-[12px] text-[var(--muted)] tracking-tight">{t.where}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}