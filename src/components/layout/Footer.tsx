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
    <footer className="bg-[var(--ink)] text-[var(--cream)] pt-24 pb-10 mt-32">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
        {/* Top grid */}
        <div className="grid lg:grid-cols-12 gap-12 pb-20 border-b border-white/10">
          {/* CTA column */}
          <div className="lg:col-span-5">
            <h2 className="font-display text-[44px] md:text-[56px] leading-[1.02] tracking-tight text-balance">
              Pronto para a próxima{" "}
              <span className="italic font-light">história</span>?
            </h2>
            <p className="mt-6 text-white/60 max-w-md text-[15px] leading-relaxed">
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
                className="text-white hover:bg-white/10"
              >
                Falar com curador
              </Button>
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10 text-[13.5px]">
            {columns.map((col) => (
              <div key={col.title}>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/45 mb-5">
                  {col.title}
                </div>
                <ul className="space-y-3">
                  {col.links.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-white/80 hover:text-white transition link-underline"
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
          <div className="flex items-center gap-5 text-white/50">
            {["IG", "FB", "TW"].map((s) => (
              <a
                key={s}
                href="#"
                className="text-[11px] font-semibold tracking-widest hover:text-white transition cursor-pointer"
              >
                {s}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-5 text-[12px] text-white/40 tracking-tight">
            <span>© 2026 MN Travel · RNAVT 9999 · Lisboa, Portugal</span>
            <Link href="/admin" className="hover:text-white/70 transition">Admin</Link>
          </div>
        </div>

        {/* Watermark */}
        <div className="mt-12 -mb-10 overflow-hidden">
          <div className="font-display italic text-[18vw] leading-none text-white/[0.04] tracking-tighter select-none whitespace-nowrap">
            mn travel
          </div>
        </div>
      </div>
    </footer>
  );
}