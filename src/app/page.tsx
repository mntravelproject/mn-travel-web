export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { CollectionsSection } from "@/components/sections/CollectionsSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { getFeaturedTrips } from "@/lib/services/trips";
import { getAllCategories } from "@/lib/services/categories";

export default async function HomePage() {
  const [trips, categories] = await Promise.all([
    getFeaturedTrips(8).catch(() => []),
    getAllCategories().catch(() => []),
  ]);

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <CollectionsSection trips={trips} categories={categories} />
        <FinalCTASection />
      </main>
      <Footer />
    </>
  );
}
