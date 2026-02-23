import { HeroSection } from "@/components/home/HeroSection";
import { SearchForm } from "@/components/home/SearchForm";
import { FeatureCards } from "@/components/home/FeatureCards";
import { VendorCTA } from "@/components/home/VendorCTA";
import { Footer } from "@/components/home/Footer";

const Index = () => {
  return (
    <div className="relative flex flex-col min-h-screen bg-background">
      {/* Subtle grain texture overlay */}
      <div className="fixed inset-0 grain pointer-events-none" />

      {/* Main content */}
      <main className="flex-1 relative z-10">
        <HeroSection />
        <SearchForm />
        <FeatureCards />
        <VendorCTA />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
