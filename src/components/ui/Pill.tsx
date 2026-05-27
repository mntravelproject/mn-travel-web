import { cn } from "@/lib/utils";

interface PillProps {
  children: React.ReactNode;
  className?: string;
}

export function Pill({ children, className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--line-2)] bg-[var(--cream)]/70 backdrop-blur px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[var(--ink-soft)]",
        className
      )}
    >
      {children}
    </span>
  );
}