"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

interface AnimatedCounterProps {
  value: string;
  duration?: number;
  className?: string;
}

function parseNumber(val: string): { prefix: string; num: number; suffix: string } {
  const match = val.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return { prefix: "", num: 0, suffix: val };
  return { prefix: match[1], num: parseFloat(match[2]), suffix: match[3] };
}

export function AnimatedCounter({ value, duration = 1.8, className }: AnimatedCounterProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [displayed, setDisplayed] = useState("0");
  const { prefix, num, suffix } = parseNumber(value);
  const isDecimal = num % 1 !== 0;

  useEffect(() => {
    if (!inView) return;
    if (reduced) { setDisplayed(String(num)); return; }

    const start = performance.now();
    const end = start + duration * 1000;

    function tick(now: number) {
      const progress = Math.min((now - start) / (end - start), 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = num * eased;
      setDisplayed(isDecimal ? current.toFixed(1) : Math.round(current).toString());
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [inView, num, duration, reduced, isDecimal]);

  return (
    <span ref={ref} className={className}>
      {prefix}{displayed}{suffix}
    </span>
  );
}
