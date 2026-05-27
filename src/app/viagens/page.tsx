import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ViagensContent } from "./ViagensContent";

export default function ViagensPage() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<div className="pt-36 max-w-[1320px] mx-auto px-6 lg:px-10 pb-32 animate-pulse">
          <div className="h-4 w-32 bg-[var(--line)] rounded mb-5" />
          <div className="h-14 w-96 bg-[var(--line)] rounded mb-10" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[4/5] bg-[var(--cream-2)] rounded-2xl mb-4" />
                <div className="h-5 w-2/3 bg-[var(--cream-2)] rounded mb-2" />
                <div className="h-4 w-1/3 bg-[var(--cream-2)] rounded" />
              </div>
            ))}
          </div>
        </div>}>
          <ViagensContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}