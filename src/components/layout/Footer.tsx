import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

const columns = [
  {
    title: "Explorar",
    links: ["Todas as viagens", "Destinos", "Cruzeiros", "Lua de mel", "Grupos privados"],
  },
  {
    title: "Curadoria",
    links: ["Filosofia", "Curadores", "Editorial", "Parceiros", "Sustentabilidade"],
  },
  {
    title: "Contacto",
    links: ["Lisboa · Porto", "+351 213 000 000", "hello@mntravel.pt", "Imprensa", "Carreiras"],
  },
];

export function Footer() {
  return (
    <footer className="bg-[var(--surface-dark)] text-[var(--cream)] pt-24 pb-10">
      {/* Top teal line */}
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
        <div className="h-px bg-gradient-to-r from-[var(--clay)]/60 via-[var(--clay)]/20 to-transparent mb-20" />

        {/* Top grid */}
        <div className="grid lg:grid-cols-12 gap-12 pb-20 border-b border-white/[0.06]">
          {/* CTA column */}
          <div className="lg:col-span-5">
            <div className="font-display text-[26px] tracking-tight mb-2 text-white">
              MN<span className="italic font-light text-[var(--clay-soft)]"> travel</span>
            </div>
            <h2 className="mt-6 font-display text-[42px] md:text-[52px] leading-[1.04] tracking-tight text-balance text-white">
              Pronto para a próxima{" "}
              <span className="italic font-light text-[var(--clay-soft)]">história</span>?
            </h2>
            <p className="mt-6 text-white/45 max-w-md text-[15px] leading-relaxed">
              Falamos consigo sobre o que procura. Depois desenhamos a viagem de
              raiz — porque nenhuma viagem premium se desenha por catálogo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="clay" size="lg">
                Iniciar consulta privada <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-white/70 hover:text-white hover:bg-white/[0.08]"
              >
                Falar com curador
              </Button>
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10 text-[13.5px]">
            {columns.map((col) => (
              <div key={col.title}>
                <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--clay-soft)]/50 mb-6">
                  {col.title}
                </div>
                <ul className="space-y-3.5">
                  {col.links.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-white/55 hover:text-white transition-colors link-underline"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-white/40">
            {["IG", "FB", "TW"].map((s) => (
              <a
                key={s}
                href="#"
                className="text-[11px] font-semibold tracking-widest hover:text-white/80 transition-colors cursor-pointer"
              >
                {s}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-5 text-[12px] text-white/30 tracking-tight">
            <span>© 2026 MN Travel · RNAVT 9999 · Lisboa, Portugal</span>
            <Link href="/admin" className="hover:text-white/60 transition-colors">Admin</Link>
          </div>
        </div>

        {/* Watermark */}
        <div className="mt-12 -mb-10 overflow-hidden">
          <div className="font-display italic text-[18vw] leading-none text-white/[0.025] tracking-tighter select-none whitespace-nowrap">
            mn travel
          </div>
        </div>
      </div>
    </footer>
  );
}
