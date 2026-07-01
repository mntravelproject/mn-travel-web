export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsBar } from "@/components/sections/StatsBar";
import { CollectionsSection } from "@/components/sections/CollectionsSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { getFeaturedTrips } from "@/lib/services/trips";
import { getAllCategories } from "@/lib/services/categories";
import { getHeroImages } from "@/lib/services/heroImages";

export default async function HomePage() {
  const [trips, categories, heroImages] = await Promise.all([
    getFeaturedTrips(8).catch(() => []),
    getAllCategories().catch(() => []),
    getHeroImages().catch(() => []),
  ]);

  return (
    <>
      <Header />
      <main>
        <HeroSection images={heroImages} />
        <StatsBar />
        <CollectionsSection trips={trips} categories={categories} />
        <FinalCTASection />
      </main>
      <Footer className="!mt-0" />
    </>
  );
}
