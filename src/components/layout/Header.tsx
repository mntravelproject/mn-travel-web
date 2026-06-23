"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Globe, Menu, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { BookingModal } from "@/components/BookingModal";

const navLinks = [
  { href: "/",         label: "Início" },
  { href: "/viagens",  label: "Viagens" },
  { href: "/viagens",  label: "Destinos" },
  { href: "/viagens",  label: "Editorial" },
  { href: "/sobre",    label: "Sobre" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled,    setScrolled]    = useState(false);
  const [open,        setOpen]        = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const isHero  = pathname === "/" || (pathname.startsWith("/viagens/") && pathname !== "/viagens");
  const onLight = !isHero || scrolled || open;

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: reduced ? 0 : -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0.01 : 0.55, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          onLight
            ? "bg-[var(--cream)]/92 backdrop-blur-md hairline"
            : "bg-transparent"
        )}
      >
        <div className="max-w-[1380px] mx-auto px-5 md:px-8 lg:px-14 h-[68px] md:h-[88px] lg:h-[108px] flex items-center justify-between lg:grid lg:grid-cols-[180px_1fr_220px]">

          {/* Logo */}
          <Link
            href="/"
            className={cn(
              "font-display text-[20px] tracking-tight leading-none transition-colors",
              onLight ? "text-[var(--ink)]" : "text-white"
            )}
          >
            MN<span className="italic font-normal"> travel</span>
          </Link>

          {/* Desktop nav — centrado */}
          <nav className="hidden lg:flex items-center justify-center gap-[42px]">
            {navLinks.map((link, i) => {
              const isActive = pathname === link.href && i === 0;
              return (
                <Link
                  key={i}
                  href={link.href}
                  className={cn(
                    "relative text-[15px] font-medium transition-colors pb-1",
                    isActive ? "gold-underline" : "",
                    onLight
                      ? "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                      : "text-white/90 hover:text-white"
                  )}
                >
                  {link.label}
                  {!isActive && (
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-300 ease-out bg-current opacity-0 hover:opacity-100" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center justify-end gap-5">
            <button
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 text-[14px] font-medium tracking-tight transition-colors",
                onLight ? "text-[var(--ink-soft)] hover:text-[var(--ink)]" : "text-white/85 hover:text-white"
              )}
            >
              <Globe className="w-4 h-4" /> PT
            </button>

            <motion.button
              whileHover={{ scale: reduced ? 1 : 1.03 }}
              whileTap={{ scale: reduced ? 1 : 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              onClick={() => setBookingOpen(true)}
              className={cn(
                "hidden sm:inline-flex items-center rounded-full px-[30px] py-[13px] text-[15px] font-medium tracking-tight transition-all duration-300",
                onLight
                  ? "border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--cream)]"
                  : "border border-white/80 text-white hover:bg-white hover:text-[var(--ink)]"
              )}
            >
              Reservar
            </motion.button>

            {/* Mobile toggle */}
            <motion.button
              whileTap={{ scale: reduced ? 1 : 0.88 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={() => setOpen(!open)}
              className={cn("lg:hidden p-2 -mr-2", onLight ? "text-[var(--ink)]" : "text-white")}
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-[var(--dark)]/40 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: reduced ? 0.01 : 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-[300px] bg-[var(--dark)] shadow-2xl flex flex-col px-6 pt-20 pb-10 lg:hidden"
            >
              <motion.ul
                initial="hidden" animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : 0.07, delayChildren: 0.08 } } }}
                className="space-y-1"
              >
                {navLinks.map((link, i) => (
                  <motion.li
                    key={i}
                    variants={{ hidden: { opacity: 0, x: reduced ? 0 : 24 }, visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block py-2.5 font-display text-[28px] tracking-tight text-white hover:text-[var(--gold2)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
                className="mt-auto"
              >
                <button
                  onClick={() => { setOpen(false); setBookingOpen(true); }}
                  className="block w-full text-center border border-[var(--gold2)] text-[var(--gold2)] rounded-full py-3.5 text-[15px] font-medium tracking-tight hover:bg-[var(--gold2)] hover:text-[var(--dark)] transition-all"
                >
                  Reservar
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
