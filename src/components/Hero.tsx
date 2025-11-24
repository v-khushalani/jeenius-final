import React from 'react';
import { ArrowRight, Sparkles, Brain, Zap, Trophy, Rocket, Star, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const handleStartLearning = () => {
    navigate('/signup');
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
      
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Main content */}
          <div className="text-center space-y-8 mb-16 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">
                India's #1 AI-Powered JEE Platform
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </div>

            {/* Hero headline */}
            <div className="space-y-6 max-w-5xl mx-auto">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1]">
                <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                  Crack JEE with
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent animate-gradient">
                  Your AI Study Partner
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
                Personalized learning that adapts to you. Master Physics, Chemistry & Maths with AI that understands your journey.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                size="lg"
                className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-7 text-lg font-bold rounded-2xl shadow-[0_20px_50px_-15px_hsl(var(--primary))] hover:shadow-[0_25px_60px_-15px_hsl(var(--primary))] transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                onClick={handleStartLearning}
              >
                Start Learning Free
                <Rocket className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="px-8 py-7 text-lg font-semibold rounded-2xl border-2 hover:bg-accent/10 transition-all duration-300"
                onClick={() => navigate('/features')}
              >
                See How It Works
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-8 pt-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background" />
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-foreground">50,000+ students</div>
                  <div className="text-muted-foreground">learning daily</div>
                </div>
              </div>
              <div className="w-px h-12 bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-foreground">4.9/5 rating</div>
                  <div className="text-muted-foreground">from 10k+ reviews</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature showcase cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
            {/* Card 1 - AI Personalization */}
            <div className="group relative bg-gradient-to-br from-background to-primary/5 backdrop-blur-sm border border-border rounded-3xl p-8 hover:shadow-[0_20px_50px_-15px_hsl(var(--primary)/0.3)] transition-all duration-500 hover:-translate-y-2">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Brain className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">AI That Gets You</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Personalized study plans that adapt to your learning style, pace, and weak areas in real-time.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Smart recommendations</span>
                </div>
              </div>
            </div>

            {/* Card 2 - Instant Doubt Solving */}
            <div className="group relative bg-gradient-to-br from-background to-accent/5 backdrop-blur-sm border border-border rounded-3xl p-8 hover:shadow-[0_20px_50px_-15px_hsl(var(--accent)/0.3)] transition-all duration-500 hover:-translate-y-2">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-colors" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-accent-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">24/7 Doubt Solver</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Get instant, detailed explanations for any question. No waiting, no limits - just clarity.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-accent">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Unlimited queries</span>
                </div>
              </div>
            </div>

            {/* Card 3 - Track Progress */}
            <div className="group relative bg-gradient-to-br from-background to-primary/5 backdrop-blur-sm border border-border rounded-3xl p-8 hover:shadow-[0_20px_50px_-15px_hsl(var(--primary)/0.3)] transition-all duration-500 hover:-translate-y-2">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Trophy className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Track & Compete</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Monitor your progress, compete with peers, and celebrate milestones on your JEE journey.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Detailed analytics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-8 mt-16 flex-wrap text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>DPDP Compliant</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Works Offline</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span>12 Indian Languages</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span>No Credit Card Required</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
