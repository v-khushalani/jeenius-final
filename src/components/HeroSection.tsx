import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Check } from "lucide-react";
import AIChatPreview from "./AIChatPreview";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      {/* Background circles */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-20 w-48 h-48 bg-info/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-success/10 rounded-full blur-2xl" />
      
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-sm font-medium text-foreground">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                AI-Powered JEE Preparation
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Where <span className="text-transparent bg-clip-text bg-gradient-hero">AI Learns</span> You
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              India's first truly personalized JEE learning platform that adapts to your unique learning style and pace.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 py-6">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground">50K+</h3>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground">1M+</h3>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground">98%</h3>
                <p className="text-sm text-muted-foreground">Success</p>
              </div>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group">
                Start Learning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg">
                <Download className="w-5 h-5" />
                Download Free
              </Button>
            </div>
            
            {/* Features */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-success" />
                DPDP Compliant
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-success" />
                Offline Mode
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-success" />
                12 Languages
              </div>
            </div>
          </div>
          
          {/* Right content - AI Chat Preview */}
          <div className="relative">
            <AIChatPreview />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
