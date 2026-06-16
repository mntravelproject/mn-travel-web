import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedTrips } from "@/components/sections/FeaturedTrips";
import { PhilosophySection } from "@/components/sections/PhilosophySection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CTASection } from "@/components/sections/CTASection";
import { getFeaturedTrips } from "@/lib/services/trips";
import { getAllCategories } from "@/lib/services/categories";
import { getFeaturedTestimonials } from "@/lib/services/testimonials";

export default async function HomePage() {
  const [trips, categories, testimonials] = await Promise.all([
    getFeaturedTrips(6).catch(() => []),
    getAllCategories().catch(() => []),
    getFeaturedTestimonials(4).catch(() => []),
  ]);

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturedTrips trips={trips} />
        <PhilosophySection />
        <CategoriesSection categories={categories} />
        <TestimonialsSection testimonials={testimonials} />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
