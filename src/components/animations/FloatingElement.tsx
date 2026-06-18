"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface FloatingElementProps {
  children: ReactNode;
  amplitude?: number;
  duration?: number;
  className?: string;
}

export function FloatingElement({ children, amplitude = 10, duration = 5, className }: FloatingElementProps) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      animate={{ y: [0, -amplitude, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
