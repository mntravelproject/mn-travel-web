export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ViagensContent } from "./ViagensContent";
import { getAllTrips } from "@/lib/services/trips";
import { getAllCategories } from "@/lib/services/categories";

export default async function ViagensPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const params = await searchParams;
  const tipo = (params.tipo === "individual" || params.tipo === "grupo") ? params.tipo : null;

  const [trips, categories] = await Promise.all([
    getAllTrips({ tipo: tipo ?? undefined }).catch(() => []),
    getAllCategories().catch(() => []),
  ]);

  return (
    <>
      <Header />
      <main>
        <Suspense key={tipo ?? "all"} fallback={
          <div className="pt-[72px]">
            <div className="pt-16 pb-12 border-b border-[var(--line)] max-w-[1320px] mx-auto px-6 lg:px-10 animate-pulse">
              <div className="h-4 w-32 bg-[var(--line)] rounded mb-5" />
              <div className="h-14 w-96 bg-[var(--line)] rounded mb-10" />
            </div>
            <div className="max-w-[1320px] mx-auto px-6 lg:px-10 py-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-[var(--cream-2)] rounded-[20px] mb-4" />
                  <div className="h-5 w-2/3 bg-[var(--cream-2)] rounded mb-2" />
                  <div className="h-4 w-1/3 bg-[var(--cream-2)] rounded" />
                </div>
              ))}
            </div>
          </div>
        }>
          <ViagensContent key={tipo ?? "all"} trips={trips} categories={categories} tipo={tipo} />
        </Suspense>
      </main>
      <Footer className="!mt-0" />
    </>
  );
}