export function PhilosophySection() {
  return (
    <section className="relative bg-[var(--surface-mid)] overflow-hidden">
      {/* Subtle teal glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[var(--clay)]/10 blur-[120px] pointer-events-none" />

      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 py-28 lg:py-40 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left: text */}
        <div className="lg:col-span-5">
          <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[var(--clay-soft)]/60 mb-7">
            <span className="h-px w-8 bg-[var(--clay)]/50" />
            A filosofia MN
          </div>
          <h3 className="font-display text-[40px] md:text-[54px] leading-[1.05] tracking-tight text-white">
            Não vendemos
            <br />
            destinos. Desenhamos{" "}
            <span className="italic font-light text-[var(--clay-soft)]">tempo bem vivido.</span>
          </h3>
          <p className="mt-8 text-white/50 text-[15px] leading-relaxed max-w-md">
            Trabalhamos sem catálogos. Sem grupos. Sem pressa. Cada viagem nasce
            de uma conversa — e termina onde a memória começa.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            {[
              { n: "17", l: "anos de curadoria" },
              { n: "62", l: "destinos curados" },
              { n: "98%", l: "voltam a viajar" },
            ].map((s) => (
              <div key={s.l} className="border-t border-white/10 pt-5">
                <div className="font-display text-[38px] leading-none text-white">{s.n}</div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.15em] text-white/40">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: editorial image grid */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&q=85"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-4 mt-12">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1518509562904-e7ef99cddc85?w=900&q=85"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1565689157206-0fddef7589a2?w=900&q=85"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}