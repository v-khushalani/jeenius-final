import AppBanner from "@/components/AppBanner";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppBanner />
      <div className="pt-12">
        <Navbar />
      </div>
      <HeroSection />
    </div>
  );
};

export default Index;
