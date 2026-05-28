import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Fraunces } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "MN Travel — Experiências Premium de Viagem",
  description:
    "Desenhamos viagens à medida para quem entende que viajar bem é, antes de mais, viajar de outra forma.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt" className={`${geist.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-[var(--cream)] text-[var(--ink)]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}