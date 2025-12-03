import React from 'react';
import { ArrowRight, Zap, BookOpen, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const handleStartLearning = () => {
    navigate('/signup');
  };

  return (
    <section className="relative min-h-screen flex items-center bg-white pt-20 pb-12 md:pt-0 md:pb-0 overflow-hidden">
      {/* Subtle geometric background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#e6eeff] rounded-full -translate-y-1/2 translate-x-1/3 opacity-60" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#e6eeff] rounded-full translate-y-1/2 -translate-x-1/3 opacity-40" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main headline */}
          <div className="space-y-6 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              <span className="text-[#013062]">Where AI</span>
              <span className="block text-[#013062]/70 mt-2">adapts you</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#013062]/60 max-w-2xl mx-auto leading-relaxed">
              The smartest way to prepare for JEE & NEET. Personalized learning that evolves with you.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="bg-[#013062] hover:bg-[#013062]/90 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              onClick={handleStartLearning}
            >
              Start Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-[#013062]/20 text-[#013062] px-8 py-6 text-lg font-semibold rounded-full hover:bg-[#e6eeff] transition-all duration-300"
              onClick={() => navigate('/why-us')}
            >
              Learn More
            </Button>
          </div>

          {/* Feature cards */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
            <div className="bg-white border border-[#e9e9e9] rounded-2xl p-6 hover:border-[#013062]/20 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#e6eeff] flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-[#013062]" />
              </div>
              <h3 className="text-[#013062] font-semibold text-lg mb-2">Adaptive Learning</h3>
              <p className="text-[#013062]/50 text-sm">AI adjusts difficulty based on your performance</p>
            </div>
            
            <div className="bg-white border border-[#e9e9e9] rounded-2xl p-6 hover:border-[#013062]/20 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#e6eeff] flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-[#013062]" />
              </div>
              <h3 className="text-[#013062] font-semibold text-lg mb-2">40K+ Questions</h3>
              <p className="text-[#013062]/50 text-sm">Comprehensive question bank from top sources</p>
            </div>
            
            <div className="bg-white border border-[#e9e9e9] rounded-2xl p-6 hover:border-[#013062]/20 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#e6eeff] flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-[#013062]" />
              </div>
              <h3 className="text-[#013062] font-semibold text-lg mb-2">Track Progress</h3>
              <p className="text-[#013062]/50 text-sm">Real-time analytics and rank predictions</p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 flex items-center justify-center gap-8 md:gap-16 py-8 border-t border-b border-[#e9e9e9]">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#013062]">50K+</div>
              <div className="text-xs md:text-sm text-[#013062]/50 mt-1">Students</div>
            </div>
            <div className="w-px h-10 bg-[#e9e9e9]" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#013062]">98%</div>
              <div className="text-xs md:text-sm text-[#013062]/50 mt-1">Success Rate</div>
            </div>
            <div className="w-px h-10 bg-[#e9e9e9]" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#013062]">₹99</div>
              <div className="text-xs md:text-sm text-[#013062]/50 mt-1">Per Month</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
