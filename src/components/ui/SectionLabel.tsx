interface SectionLabelProps {
  children: React.ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
      <span className="h-px w-8 bg-[var(--line-2)]" />
      {children}
    </div>
  );
}