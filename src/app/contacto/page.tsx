import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ContactForm } from "./ContactForm";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const metadata = {
  title: "Contacto — MN Travel",
  description: "Entre em contacto com a nossa equipa de organizadores de viagem.",
};

const INFO = [
  { icon: Mail,   label: "E-mail",   value: "geral@mntravel.pt",   href: "mailto:geral@mntravel.pt" },
  { icon: Phone,  label: "Telefone", value: "+351 21 000 0000",    href: "tel:+351210000000" },
  { icon: MapPin, label: "Morada",   value: "Lisboa, Portugal",    href: null },
  { icon: Clock,  label: "Horário",  value: "Seg–Sex, 9h–18h",     href: null },
];

export default function ContactoPage() {
  return (
    <>
      <Header />
      <main className="pt-[72px]">
        {/* Hero */}
        <section className="max-w-[1320px] mx-auto px-6 lg:px-10 pt-10 pb-10 md:pt-20 md:pb-16 border-b border-[var(--line)]">
          <SectionLabel>Contacto</SectionLabel>
          <h1 className="mt-5 font-display text-[32px] sm:text-[44px] md:text-[58px] lg:text-[72px] leading-[1.02] tracking-tight max-w-2xl">
            Fale connosco.<br />
            <span className="italic font-light">Estamos aqui.</span>
          </h1>
          <p className="mt-6 text-[16px] text-[var(--muted)] leading-relaxed max-w-lg">
            Seja para planear a viagem da sua vida ou para esclarecer uma dúvida, a nossa equipa responde com atenção e rapidez.
          </p>
        </section>

        {/* Main grid */}
        <section className="max-w-[1320px] mx-auto px-6 lg:px-10 py-10 md:py-20">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">

            {/* Form column */}
            <div className="lg:col-span-7">
              <h2 className="font-display text-[28px] tracking-tight mb-8">Enviar mensagem</h2>
              <ContactForm />
            </div>

            {/* Info + map column */}
            <div className="lg:col-span-5 space-y-10">
              {/* Contact info */}
              <div>
                <h2 className="font-display text-[28px] tracking-tight mb-7">Informações</h2>
                <ul className="space-y-5">
                  {INFO.map(({ icon: Icon, label, value, href }) => (
                    <li key={label} className="flex items-start gap-4">
                      <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--gold-soft)" }}>
                        <Icon className="w-4 h-4" style={{ color: "var(--gold)" }} strokeWidth={1.5} />
                      </span>
                      <div>
                        <p className="text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)] mb-0.5">{label}</p>
                        {href ? (
                          <a href={href} className="text-[15px] text-[var(--ink)] transition tracking-tight hover:text-[var(--gold)]">
                            {value}
                          </a>
                        ) : (
                          <p className="text-[15px] text-[var(--ink)] tracking-tight">{value}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Map */}
              <div>
                <h2 className="font-display text-[22px] tracking-tight mb-4">Localização</h2>
                <div className="rounded-2xl overflow-hidden border border-[var(--line)] aspect-[4/3]">
                  <iframe
                    title="Localização MN Travel"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=-9.1600%2C38.7000%2C-9.1200%2C38.7300&layer=mapnik&marker=38.7169%2C-9.1399"
                    className="w-full h-full"
                    loading="lazy"
                    style={{ border: 0 }}
                  />
                </div>
                <p className="mt-2 text-[12px] text-[var(--muted)] text-right">
                  © <a href="https://www.openstreetmap.org/copyright" className="hover:underline" target="_blank" rel="noopener">OpenStreetMap</a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
