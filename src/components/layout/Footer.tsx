import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SlideUp, StaggerContainer, StaggerItem } from "@/components/animations";

const columns = [
  {
    title: "Explorar",
    links: ["Todas as viagens", "Destinos", "Cruzeiros", "Lua de mel", "Grupos privados"],
  },
  {
    title: "Organização",
    links: ["Filosofia", "Organizadores", "Editorial", "Parceiros", "Sustentabilidade"],
  },
  {
    title: "Contacto",
    links: ["Lisboa · Porto", "+351 213 000 000", "hello@mntravel.pt", "Imprensa", "Carreiras"],
  },
];

export function Footer({ className = "" }: { className?: string }) {
  return (
    <footer style={{ background: "var(--dark)" }} className={`text-white pt-12 pb-8 mt-16 md:pt-24 md:pb-10 md:mt-32 ${className}`}>
      <div className="max-w-[1380px] mx-auto px-5 md:px-8 lg:px-14">

        {/* Top grid */}
        <div className="grid lg:grid-cols-12 gap-8 pb-12 lg:gap-12 lg:pb-20 border-b border-white/10">
          {/* CTA column */}
          <SlideUp delay={0.05} className="lg:col-span-5">
            {/* Gold line */}
            <div className="w-12 h-[2px] bg-[var(--gold2)] mb-7" />
            <h2 className="font-display text-[30px] sm:text-[38px] md:text-[44px] lg:text-[54px] leading-[1.02] tracking-tight text-balance">
              Pronto para a próxima{" "}
              <span className="italic font-normal">história</span>?
            </h2>
            <p className="mt-6 text-white/55 max-w-md text-[15px] leading-relaxed">
              Falamos consigo sobre o que procura. Depois desenhamos a viagem de raiz —
              porque nenhuma viagem premium se desenha por catálogo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/contacto"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--gold2)] text-[var(--gold2)] px-7 py-3.5 text-[15px] font-medium tracking-tight hover:bg-[var(--gold2)] hover:text-[var(--dark)] transition-all duration-300"
              >
                Iniciar consulta <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="tel:+351213000000"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 text-white/70 px-7 py-3.5 text-[15px] tracking-tight hover:border-white/50 hover:text-white transition-colors"
              >
                Atendimento personalizado
              </a>
            </div>
          </SlideUp>

          {/* Link columns */}
          <StaggerContainer
            className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10 text-[13.5px]"
            staggerDelay={0.08} initialDelay={0.1}
          >
            {columns.map((col) => (
              <StaggerItem key={col.title}>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]/70 mb-5">
                    {col.title}
                  </div>
                  <ul className="space-y-3">
                    {col.links.map((item) => (
                      <li key={item}>
                        <a href="#" className="text-white/65 hover:text-white transition-colors link-underline">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* Bottom bar */}
        <SlideUp delay={0.15} className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-white/40">
            {["IG", "FB", "YT"].map((s) => (
              <a key={s} href="#" className="text-[11px] font-semibold tracking-widest hover:text-[var(--gold2)] transition-colors cursor-pointer">
                {s}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-5 text-[12px] text-white/35 tracking-tight">
            <span>© 2026 MN Travel · RNAVT 13459 · Lisboa, Portugal</span>
            <Link href="/admin" className="hover:text-white/60 transition-colors">Admin</Link>
          </div>
        </SlideUp>

      </div>
    </footer>
  );
}
