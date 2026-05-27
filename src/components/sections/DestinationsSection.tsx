import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { destinations } from "@/lib/data";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function DestinationsSection() {
  return (
    <section className="max-w-[1320px] mx-auto px-6 lg:px-10 mt-32">
      <div className="flex items-end justify-between mb-14">
        <div>
          <SectionLabel>Destinos populares</SectionLabel>
          <h2 className="mt-5 font-display text-[44px] md:text-[56px] leading-[1.02] tracking-tight text-balance">
            Onde os nossos
            <br />
            viajantes regressam.
          </h2>
        </div>
        <Link
          href="/viagens"
          className="hidden sm:inline-flex items-center gap-2 text-[14px] tracking-tight link-underline"
        >
          Ver tudo <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5">
        {destinations.map((d, i) => (
          <Link
            key={d.name}
            href={`/viagens?q=${encodeURIComponent(d.name)}`}
            className={`group cursor-pointer ${i === 0 ? "col-span-2 lg:col-span-2 row-span-2" : ""}`}
          >
            <div
              className={`relative overflow-hidden rounded-2xl img-zoom ${
                i === 0 ? "aspect-[4/5] lg:aspect-auto lg:h-full" : "aspect-[4/5]"
              }`}
            >
              <img
                src={d.img}
                alt={d.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="font-display text-[24px] leading-tight">{d.name}</div>
                <div className="text-[12px] text-white/75 tracking-tight">{d.count} viagens</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}