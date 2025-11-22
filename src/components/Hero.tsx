import React from 'react';
import { ArrowRight, Play, Users, BookOpen, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const handleStartLearning = () => {
    navigate('/signup');
  };

  const handleDownloadApp = () => {
    window.open('https://play.google.com/store/apps/details?id=com.jeenius.app', '_blank');
  };

  return (
    <>
      <section className="relative pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 lg:pb-20 min-h-screen flex items-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-blue-50 to-white"></div>
        {/* Animated background elements - Hidden on mobile for performance */}
        <div className="hidden sm:block absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-float"></div>
        <div className="hidden sm:block absolute top-40 right-20 w-16 h-16 bg-blue-200/50 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="hidden sm:block absolute bottom-40 left-20 w-12 h-12 bg-primary/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium text-primary">
                AI-Powered JEE Preparation
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-gray-900">
                Where{' '}
                <span className="text-primary">AI</span>{' '}
                Learns{' '}
                <span className="text-primary">You</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg">
                India's first truly personalized JEE learning platform that adapts to your unique learning style and pace.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-md">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">50K+</div>
                <div className="text-xs sm:text-sm text-gray-600">Students</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">1M+</div>
                <div className="text-xs sm:text-sm text-gray-600">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">98%</div>
                <div className="text-xs sm:text-sm text-gray-600">Success</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto"
                onClick={handleStartLearning}
              >
                Start Learning Free
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-primary text-primary hover:bg-primary/5 px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
                onClick={handleDownloadApp}
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Download Free
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
              <span>✓ DPDP Compliant</span>
              <span>✓ Offline Mode</span>
              <span>✓ 12 Languages</span>
            </div>
          </div>

          {/* Interactive Demo - Optimized for mobile */}
          <div className="relative animate-scale-in mt-4 lg:mt-0">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 border border-gray-100">
              {/* AI Tutor Chat Demo */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800">JEEnius AI Tutor</h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
                
                {/* Chat Messages - Reduced height on mobile */}
                <div className="space-y-2 sm:space-y-3 h-48 sm:h-56 lg:h-64 overflow-y-auto">
                  <div className="flex justify-start">
                    <div className="bg-primary/10 rounded-lg p-2.5 sm:p-3 max-w-[85%] sm:max-w-xs">
                      <p className="text-xs sm:text-sm text-gray-800">Hi! I noticed you're struggling with quadratic equations. Let me help you with a personalized approach.</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-primary rounded-lg p-2.5 sm:p-3 max-w-[85%] sm:max-w-xs">
                      <p className="text-xs sm:text-sm text-white">Yes, I find it confusing!</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-primary/10 rounded-lg p-2.5 sm:p-3 max-w-[85%] sm:max-w-xs">
                      <p className="text-xs sm:text-sm text-gray-800">Perfect! Based on your learning style, I'll use visual diagrams. Here's your first question...</p>
                    </div>
                  </div>
                </div>

                {/* Input Area */}
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    placeholder="Ask me anything..."
                    className="flex-1 px-2.5 py-2 sm:px-3 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm"
                    disabled
                  />
                  <Button size="sm" className="bg-primary hover:bg-primary/90 px-3 py-2">
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Floating Elements - Smaller on mobile */}
            <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center animate-float">
              <span className="text-primary font-bold text-xs sm:text-base">AI</span>
            </div>
          </div>
        </div>
      </div>
      </section>
    </>
  );
};

export default Hero;
