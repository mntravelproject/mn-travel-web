"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Globe, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/",        label: "Início" },
  { href: "/viagens", label: "Viagens" },
  { href: "/viagens", label: "Destinos" },
  { href: "/viagens", label: "Editorial" },
  { href: "/sobre",   label: "Sobre" },
];

export function Header() {
  const pathname  = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome   = pathname === "/" || (pathname.startsWith("/viagens/") && pathname !== "/viagens");
  const onLight  = !isHome || scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        onLight
          ? "bg-[var(--cream)]/85 backdrop-blur-md hairline"
          : "bg-transparent"
      )}
    >
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className={cn(
            "font-display text-[22px] tracking-tight leading-none transition-colors",
            onLight ? "text-[var(--ink)]" : "text-white"
          )}
        >
          MN<span className="italic font-light"> travel</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-9">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className={cn(
                "link-underline text-[13.5px] tracking-tight transition-colors",
                onLight
                  ? "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  : "text-white/85 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            className={cn(
              "hidden sm:inline-flex items-center gap-1.5 text-[13px] tracking-tight",
              onLight ? "text-[var(--ink-soft)]" : "text-white/85"
            )}
          >
            <Globe className="w-4 h-4" /> PT
          </button>
          <Link
            href="/viagens"
            className={cn(
              "hidden sm:inline-flex rounded-full px-4 py-2 text-[13px] tracking-tight transition-all",
              onLight
                ? "bg-[var(--ink)] text-[var(--cream)] hover:bg-[var(--ink-soft)]"
                : "bg-white text-[var(--ink)] hover:bg-white/90"
            )}
          >
            Reservar
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              "lg:hidden p-2 -mr-2",
              onLight ? "text-[var(--ink)]" : "text-white"
            )}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[var(--cream)] border-t border-[var(--line)] anim-in">
          <div className="px-6 py-6 space-y-4">
            {navLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block w-full text-left font-display text-2xl text-[var(--ink)]"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-[var(--line)]">
              <Link
                href="/viagens"
                className="block w-full text-center bg-[var(--ink)] text-[var(--cream)] rounded-full px-5 py-3 text-[14px] font-medium tracking-tight"
              >
                Reservar consulta
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}