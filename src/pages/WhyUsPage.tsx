import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Flame, Target, Zap, TrendingUp, Trophy, Star, ArrowRight, Sparkles, BookOpen, Clock, Award, Users, Lightbulb, Heart, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';

const WhyUsPage = () => {
  const [activeCard, setActiveCard] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 4);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const heroFeatures = [
    {
      icon: Brain,
      title: "AI That Actually Gets You",
      desc: "Not just adaptive - it understands your struggles, your strengths, your style"
    },
    {
      icon: Flame,
      title: "Built by JEE Survivors",
      desc: "We've walked your path. Every feature is designed from real pain points"
    },
    {
      icon: Target,
      title: "Results, Not Just Practice",
      desc: "Every question you solve is strategically chosen to maximize your growth"
    },
    {
      icon: Zap,
      title: "Instant Clarity",
      desc: "No more waiting. Get explanations that click the moment you need them"
    }
  ];

  const stats = [
    { num: "50K+", label: "Active Students", icon: Users },
    { num: "98%", label: "See Improvement", icon: TrendingUp },
    { num: "40K+", label: "Questions", icon: BookOpen },
    { num: "24/7", label: "AI Mentor", icon: Clock }
  ];

  const differenceCards = [
    {
      icon: Sparkles,
      title: "Personalization That Feels Magic",
      points: [
        "AI tracks your weak concepts in real-time",
        "Practice sessions adapt to your energy",
        "Smart scheduling based on retention patterns"
      ]
    },
    {
      icon: Heart,
      title: "Mental Health Matters",
      points: [
        "Stress-free learning with achievable goals",
        "Positive reinforcement, not just corrections",
        "Progress tracking that celebrates small wins"
      ]
    },
    {
      icon: Trophy,
      title: "Gamification Done Right",
      points: [
        "Compete with peers at your exact level",
        "Earn badges that actually mean something",
        "Leaderboards that motivate, not intimidate"
      ]
    },
    {
      icon: Lightbulb,
      title: "Conceptual Clarity First",
      points: [
        "Not just formulas - understand the 'why'",
        "Visual learning for complex concepts",
        "Connect topics across Physics, Chemistry, Maths"
      ]
    }
  ];

  const testimonials = [
    { name: "Arjun K.", rank: "AIR 287", text: "JEEnius made studying feel like a game, not torture. The daily streak kept me consistent!" },
    { name: "Priya S.", rank: "AIR 512", text: "Finally, an app that understood my weak areas better than my teachers. Game changer." },
    { name: "Rohan M.", rank: "AIR 1024", text: "The AI mentor felt like having a personal tutor 24/7. Worth every second." }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#e6eeff] rounded-full translate-x-1/3 opacity-40" />
        <div className="absolute bottom-40 left-0 w-[400px] h-[400px] bg-[#e6eeff] rounded-full -translate-x-1/3 opacity-30" />
      </div>

      <div className="relative z-10 pt-20 sm:pt-24 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Badge */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <Badge className="bg-[#013062] text-white px-4 py-2 text-xs sm:text-sm font-semibold rounded-full">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2 inline" />
              Built by JEE Warriors, For JEE Warriors
            </Badge>
          </div>

          {/* Main Headline */}
          <div className="text-center mb-10 sm:mb-14 space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#013062] leading-tight">
              We're Not Just <br className="hidden sm:block" />
              <span className="text-[#013062]/70">Another App</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[#013062]/60 max-w-2xl mx-auto leading-relaxed">
              We're <span className="font-bold text-[#013062]">JEE survivors</span> who built the platform we wish we had. 
              Just <span className="font-bold text-[#013062]">smart, caring AI</span> that helps you dominate.
            </p>
          </div>

          {/* Rotating Feature Cards */}
          <div className="max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="relative h-auto min-h-[200px] sm:min-h-[180px]">
              {heroFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-all duration-700 ${
                    activeCard === idx 
                      ? 'opacity-100 transform translate-y-0 scale-100' 
                      : 'opacity-0 transform translate-y-8 scale-95 pointer-events-none'
                  }`}
                >
                  <Card className="bg-[#013062] border-0 shadow-xl">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                        <div className="p-3 sm:p-4 bg-white/10 rounded-2xl flex-shrink-0">
                          <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                            {feature.desc}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            
            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {heroFeatures.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCard(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeCard === idx ? 'w-8 bg-[#013062]' : 'w-2 bg-[#e9e9e9] hover:bg-[#013062]/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-14 sm:mb-20">
            {stats.map((stat, idx) => (
              <Card key={idx} className="bg-white border border-[#e9e9e9] hover:border-[#013062]/20 hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="inline-flex p-2 sm:p-3 rounded-xl bg-[#e6eeff] mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#013062]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#013062] mb-0.5">
                    {stat.num}
                  </div>
                  <div className="text-xs sm:text-sm text-[#013062]/60">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Why Different Section */}
          <div className="mb-14 sm:mb-20">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="bg-[#e6eeff] text-[#013062] px-4 py-2 text-xs sm:text-sm font-semibold mb-4 rounded-full">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-2 inline" />
                What Makes Us Different
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#013062]">
                Not Your Average <span className="text-[#013062]/70">Study App</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {differenceCards.map((card, idx) => (
                <Card key={idx} className="bg-white border border-[#e9e9e9] hover:border-[#013062]/20 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-[#e6eeff] group-hover:scale-110 transition-transform flex-shrink-0">
                        <card.icon className="w-6 h-6 text-[#013062]" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-[#013062] mt-1">
                        {card.title}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {card.points.map((point, i) => (
                        <div key={i} className="flex items-start gap-2 sm:gap-3">
                          <CheckCircle className="w-4 h-4 text-[#013062] mt-0.5 flex-shrink-0" />
                          <p className="text-xs sm:text-sm text-[#013062]/70 leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-14 sm:mb-20">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="bg-[#e6eeff] text-[#013062] px-4 py-2 text-xs sm:text-sm font-semibold mb-4 rounded-full">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-2 inline" />
                Success Stories
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#013062]">
                Real Students. Real <span className="text-[#013062]/70">Results</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {testimonials.map((test, idx) => (
                <Card key={idx} className="bg-white border border-[#e9e9e9] hover:border-[#013062]/20 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#013062] flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                        {test.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-sm sm:text-base text-[#013062]">{test.name}</div>
                        <Badge className="bg-[#e6eeff] text-[#013062] text-xs">
                          {test.rank}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-[#013062]/70 italic leading-relaxed">
                      "{test.text}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-[#013062] border-0 shadow-xl">
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                  Ready to Transform Your Journey?
                </h2>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                  Join thousands of students who chose smart preparation over endless grinding.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
                  <Button 
                    onClick={() => navigate('/signup')}
                    className="bg-white hover:bg-[#e6eeff] text-[#013062] font-bold text-sm sm:text-base px-6 sm:px-8 py-4 sm:py-5 rounded-full shadow-lg hover:scale-105 transition-all group"
                  >
                    Start Learning Free
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:rotate-12 transition-transform" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/login')}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-bold text-sm sm:text-base px-6 sm:px-8 py-4 sm:py-5 rounded-full"
                  >
                    Sign In
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WhyUsPage;
