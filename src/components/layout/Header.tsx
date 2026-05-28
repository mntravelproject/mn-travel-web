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

  const isHome  = pathname === "/" || (pathname.startsWith("/viagens/") && pathname !== "/viagens");
  const onLight = !isHome || scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        onLight
          ? "bg-[var(--surface-dark)]/90 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="font-display text-[22px] tracking-tight leading-none text-white transition-opacity hover:opacity-80"
        >
          MN<span className="italic font-light text-[var(--clay-soft)]"> travel</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="link-underline text-[13px] tracking-tight text-white/70 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <button className="hidden sm:inline-flex items-center gap-1.5 text-[13px] text-white/60 tracking-tight hover:text-white/90 transition-colors">
            <Globe className="w-4 h-4" /> PT
          </button>
          <Link
            href="/viagens"
            className="hidden sm:inline-flex rounded-full px-5 py-2 text-[13px] tracking-tight font-medium transition-all bg-[var(--clay)] text-white hover:bg-[var(--clay-dark)]"
          >
            Reservar
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 -mr-2 text-white"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[var(--surface-dark)] border-t border-white/[0.07] anim-in">
          <div className="px-6 py-8 space-y-5">
            {navLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block w-full text-left font-display text-2xl text-white/90 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10">
              <Link
                href="/viagens"
                className="block w-full text-center bg-[var(--clay)] text-white rounded-full px-5 py-3 text-[14px] font-medium tracking-tight hover:bg-[var(--clay-dark)] transition-colors"
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