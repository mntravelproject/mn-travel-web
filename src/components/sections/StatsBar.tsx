const STATS = [
  { value: "200+",    label: "Destinos Curados" },
  { value: "15",      label: "Anos de Experiência" },
  { value: "4.9",     label: "Avaliação Média" },
  { value: "2 000+",  label: "Clientes Satisfeitos" },
];

export function StatsBar() {
  return (
    <div
      className="flex flex-wrap justify-center items-stretch"
      style={{ background: "var(--dark-mid)" }}
    >
      {STATS.map((s, i) => (
        <div
          key={i}
          className="text-center px-10 sm:px-14 py-5 sm:py-6"
          style={{
            borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,.07)" : "none",
          }}
        >
          <div
            className="font-display text-[26px] sm:text-[28px] leading-none"
            style={{ color: "var(--gold2)", fontWeight: 400 }}
          >
            {s.value}
          </div>
          <div
            className="text-[10.5px] uppercase tracking-[.13em] mt-[5px]"
            style={{ color: "rgba(255,255,255,.42)" }}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
