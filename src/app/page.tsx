import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedTrips } from "@/components/sections/FeaturedTrips";
import { PhilosophySection } from "@/components/sections/PhilosophySection";
import { DestinationsSection } from "@/components/sections/DestinationsSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CTASection } from "@/components/sections/CTASection";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturedTrips />
        <PhilosophySection />
        <DestinationsSection />
        <CategoriesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}