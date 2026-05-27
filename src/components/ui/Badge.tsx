import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "success" | "muted";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-[#F0EFEC] text-[#0D0D0D]": variant === "default",
          "bg-[#C4955A]/10 text-[#C4955A]": variant === "accent",
          "bg-emerald-50 text-emerald-700": variant === "success",
          "bg-[#F0EFEC] text-[#6B6B6B]": variant === "muted",
        },
        className
      )}
    >
      {children}
    </span>
  );
}