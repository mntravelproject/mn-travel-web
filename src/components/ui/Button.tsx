"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "clay" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-all duration-300 focus-ring rounded-full cursor-pointer";

    const variants = {
      primary:   "bg-[var(--ink)] text-[var(--cream)] hover:bg-[var(--ink-soft)]",
      secondary: "bg-[var(--cream-2)] text-[var(--ink)] hover:bg-[var(--line)]",
      clay:      "bg-[var(--clay)] text-white hover:bg-[var(--clay-dark)]",
      ghost:     "text-[var(--ink)] hover:bg-[var(--cream-2)]",
      outline:   "border border-[var(--line-2)] text-[var(--ink)] hover:border-[var(--ink)]",
    };

    const sizes = {
      sm: "px-4 py-2 text-[13px]",
      md: "px-5 py-3 text-[14px]",
      lg: "px-7 py-4 text-[15px]",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };