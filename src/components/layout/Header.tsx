"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Globe, Menu, X, ChevronDown, User, Users } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { BookingModal } from "@/components/BookingModal";

const navLinks = [
  { href: "/",         label: "Início" },
  {
    href: "/viagens",
    label: "Destinos",
    children: [
      {
        href: "/viagens?tipo=individual",
        label: "Individual",
        description: "Viagens personalizadas e exclusivas para si",
        icon: <User className="w-5 h-5 shrink-0" />,
      },
      {
        href: "/viagens?tipo=grupo",
        label: "Grupo",
        description: "Experiências únicas partilhadas em grupo",
        icon: <Users className="w-5 h-5 shrink-0" />,
      },
    ],
  },
  { href: "/sobre",    label: "Sobre" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled,    setScrolled]    = useState(false);
  const [open,        setOpen]        = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [destOpen,    setDestOpen]    = useState(false);
  const [destMobile,  setDestMobile]  = useState(false);
  const reduced = useReducedMotion();
  const destTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); setDestMobile(false); }, [pathname]);

  const isHero    = pathname === "/";
  const isViagens = pathname.startsWith("/viagens");
  // nav is dark when scrolled, menu open, or on any non-home page
  const isDark = (!isHero) || scrolled || open;

  const openDest  = () => { if (destTimer.current) clearTimeout(destTimer.current); setDestOpen(true); };
  const closeDest = () => { destTimer.current = setTimeout(() => setDestOpen(false), 300); };

  return (
    <>
      <motion.header
        initial={{ opacity: isViagens ? 1 : 0, y: reduced || isViagens ? 0 : -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced || isViagens ? 0.01 : 0.55, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          isDark
            ? isHero
              ? "bg-[rgba(14,25,38,0.96)] backdrop-blur-[20px] shadow-[0_2px_28px_rgba(0,0,0,.28)]"
              : "bg-[var(--dark)]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-[1380px] mx-auto px-5 md:px-8 lg:px-14 h-[68px] md:h-[88px] lg:h-[108px] flex items-center justify-between lg:grid lg:grid-cols-[200px_1fr_220px]">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="/logo_branco.png"
              alt="MN Travel"
              className="h-24 lg:h-32 w-auto transition-opacity duration-300"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center justify-center gap-1">
            {navLinks.map((link, i) => {
              const isActive = pathname === link.href && i === 0;

              if (link.children) {
                return (
                  <div
                    key={i}
                    className="relative"
                    onMouseEnter={openDest}
                    onMouseLeave={closeDest}
                  >
                    <button
                      className={cn(
                        "inline-flex h-9 items-center gap-1 rounded-md px-4 text-[14px] font-medium transition-all",
                        destOpen
                          ? "bg-white/10 text-white"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {link.label}
                      <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", destOpen && "rotate-180")} />
                    </button>

                    {/* Dropdown */}
                    <div
                      className="absolute top-full left-1/2 pt-2 z-50 w-[300px]"
                      style={{
                        opacity: destOpen ? 1 : 0,
                        transform: destOpen
                          ? "translateX(-50%) translateY(0px) scale(1)"
                          : "translateX(-50%) translateY(-6px) scale(0.97)",
                        transition: "opacity 150ms ease, transform 150ms ease",
                        pointerEvents: destOpen ? "auto" : "none",
                      }}
                    >
                      <div className="rounded-xl shadow-xl border overflow-hidden p-1.5 bg-white border-[var(--line)]">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-start gap-4 rounded-lg px-4 py-3.5 transition-colors text-[var(--ink-soft)] hover:bg-[var(--cream-2)] hover:text-[var(--ink)]"
                          >
                            <span className="mt-0.5 text-[var(--gold)]">
                              {child.icon}
                            </span>
                            <div>
                              <div className="text-[14px] font-semibold mb-0.5 text-[var(--ink)]">
                                {child.label}
                              </div>
                              <div className="text-[13px] leading-snug opacity-70">
                                {child.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={i}
                  href={link.href}
                  className={cn(
                    "inline-flex h-9 items-center rounded-md px-4 text-[14px] font-medium transition-colors",
                    isActive
                      ? "text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center justify-end gap-4">
            <button className="hidden sm:inline-flex items-center gap-1.5 text-[14px] font-medium tracking-tight transition-colors text-white/50 hover:text-white">
              <Globe className="w-4 h-4" /> PT
            </button>

            <motion.button
              whileHover={{ scale: reduced ? 1 : 1.03 }}
              whileTap={{ scale: reduced ? 1 : 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              onClick={() => setBookingOpen(true)}
              className="hidden sm:inline-flex items-center rounded-full px-[26px] py-[11px] text-[14px] font-medium tracking-tight transition-all duration-300 border border-white/60 text-white hover:bg-white hover:text-[var(--dark)]"
            >
              Reservar
            </motion.button>

            {/* Mobile toggle */}
            <motion.button
              whileTap={{ scale: reduced ? 1 : 0.88 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 -mr-2 text-white"
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
              className="fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-[300px] bg-[var(--dark)] shadow-2xl flex flex-col px-6 pt-6 pb-10 lg:hidden overflow-y-auto"
            >
              <img src="/logo_branco.png" alt="MN Travel" className="h-20 w-auto mb-6 self-start" />

              <div className="flex flex-col gap-1">
                {navLinks.map((link, i) => {
                  if (link.children) {
                    return (
                      <div key={i}>
                        <button
                          onClick={() => setDestMobile(v => !v)}
                          className="w-full flex items-center justify-between py-2.5 font-display text-[28px] tracking-tight text-white hover:text-[var(--gold2)] transition-colors"
                        >
                          {link.label}
                          <ChevronDown className={cn("w-5 h-5 mt-1 transition-transform duration-200", destMobile && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                          {destMobile && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.22 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col gap-0.5 pl-2 pb-3 pt-1">
                                {link.children.map((child) => (
                                  <Link
                                    key={child.href}
                                    href={child.href}
                                    onClick={() => setOpen(false)}
                                    className="flex items-start gap-3 rounded-lg px-3 py-3 hover:bg-white/8 transition-colors"
                                  >
                                    <span className="text-[var(--gold2)] mt-0.5">{child.icon}</span>
                                    <div>
                                      <div className="text-[16px] font-semibold text-white">{child.label}</div>
                                      <div className="text-[13px] text-white/50 leading-snug mt-0.5">{child.description}</div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={i}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block py-2.5 font-display text-[28px] tracking-tight text-white hover:text-[var(--gold2)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-auto pt-6">
                <button
                  onClick={() => { setOpen(false); setBookingOpen(true); }}
                  className="block w-full text-center border border-[var(--gold2)] text-[var(--gold2)] rounded-full py-3.5 text-[15px] font-medium tracking-tight hover:bg-[var(--gold2)] hover:text-[var(--dark)] transition-all"
                >
                  Reservar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
