import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Flame, Target, Zap, TrendingUp, Trophy, Star, ArrowRight, Sparkles, BookOpen, Clock, Award, Users, Lightbulb, Heart, CheckCircle } from 'lucide-react';

const WhyUsPage = () => {
  const [activeCard, setActiveCard] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      desc: "Not just adaptive - it understands your struggles, your strengths, your style",
      gradient: "from-blue-500 to-indigo-600",
      glow: "shadow-blue-500/50"
    },
    {
      icon: Flame,
      title: "Built by JEE Survivors",
      desc: "We've walked your path. Every feature is designed from real pain points",
      gradient: "from-orange-500 to-red-600",
      glow: "shadow-orange-500/50"
    },
    {
      icon: Target,
      title: "Results, Not Just Practice",
      desc: "Every question you solve is strategically chosen to maximize your growth",
      gradient: "from-green-500 to-emerald-600",
      glow: "shadow-green-500/50"
    },
    {
      icon: Zap,
      title: "Instant Clarity",
      desc: "No more waiting. Get explanations that click the moment you need them",
      gradient: "from-yellow-500 to-amber-600",
      glow: "shadow-yellow-500/50"
    }
  ];

  const stats = [
    { num: "10K+", label: "Active JEEniors", icon: Users, color: "blue" },
    { num: "92%", label: "See Improvement", icon: TrendingUp, color: "green" },
    { num: "5M+", label: "Questions Solved", icon: BookOpen, color: "indigo" },
    { num: "24/7", label: "AI Mentor", icon: Clock, color: "orange" }
  ];

  const differenceCards = [
    {
      icon: Sparkles,
      title: "Personalization That Feels Magic",
      points: [
        "AI tracks your weak concepts in real-time",
        "Practice sessions adapt to your mood & energy",
        "Smart scheduling based on your retention patterns"
      ],
      gradient: "from-purple-500 to-pink-600",
      bg: "from-purple-50 to-pink-50"
    },
    {
      icon: Heart,
      title: "Mental Health Matters",
      points: [
        "Stress-free learning with achievable daily goals",
        "Positive reinforcement, not just corrections",
        "Progress tracking that celebrates small wins"
      ],
      gradient: "from-red-500 to-orange-600",
      bg: "from-red-50 to-orange-50"
    },
    {
      icon: Trophy,
      title: "Gamification Done Right",
      points: [
        "Compete with peers at your exact level",
        "Earn badges that actually mean something",
        "Leaderboards that motivate, not intimidate"
      ],
      gradient: "from-blue-500 to-indigo-600",
      bg: "from-blue-50 to-indigo-50"
    },
    {
      icon: Lightbulb,
      title: "Conceptual Clarity First",
      points: [
        "Not just formulas - understand the 'why'",
        "Visual learning for complex concepts",
        "Connect topics across Physics, Chemistry, Maths"
      ],
      gradient: "from-green-500 to-emerald-600",
      bg: "from-green-50 to-emerald-50"
    }
  ];

  const testimonials = [
    { name: "Arjun K.", rank: "AIR 287", text: "JEEnius made studying feel like a game, not torture. The daily streak kept me consistent!" },
    { name: "Priya S.", rank: "AIR 512", text: "Finally, an app that understood my weak areas better than my teachers. Game changer." },
    { name: "Rohan M.", rank: "AIR 1024", text: "The AI mentor felt like having a personal tutor 24/7. Worth every second." }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      
      {/* Floating Math Symbols */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-blue-500/10 text-6xl animate-bounce" style={{animationDuration: '3s'}}>∫</div>
        <div className="absolute top-32 right-20 text-indigo-500/10 text-5xl animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>π</div>
        <div className="absolute bottom-40 left-20 text-green-500/10 text-7xl animate-bounce" style={{animationDuration: '5s', animationDelay: '2s'}}>Σ</div>
        <div className="absolute bottom-32 right-16 text-orange-500/10 text-5xl animate-bounce" style={{animationDuration: '3.5s', animationDelay: '0.5s'}}>√</div>
        <div className="absolute top-1/2 right-1/3 text-purple-500/10 text-4xl animate-bounce" style={{animationDuration: '4.5s', animationDelay: '1.5s'}}>∆</div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 text-sm font-semibold">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Built by JEE Warriors, For JEE Warriors
            </Badge>
          </div>

          {/* Main Headline */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight">
              We're Not Just <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient">
                Another App
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We're <span className="font-bold text-slate-900">JEE survivors</span> who built the platform we wish we had. 
              No BS. No shortcuts. Just <span className="font-bold text-blue-600">smart, caring AI</span> that helps you dominate.
            </p>
          </div>

          {/* Rotating Feature Cards */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="relative h-64 md:h-48">
              {heroFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-all duration-700 ${
                    activeCard === idx 
                      ? 'opacity-100 transform translate-y-0 scale-100' 
                      : 'opacity-0 transform translate-y-8 scale-95 pointer-events-none'
                  }`}
                >
                  <Card className={`bg-gradient-to-br ${feature.gradient} border-0 shadow-2xl ${feature.glow} hover:shadow-3xl transition-all duration-300`}>
                    <CardContent className="p-8 md:p-10">
                      <div className="flex items-start gap-6">
                        <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                          <feature.icon className="w-10 h-10 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                            {feature.title}
                          </h3>
                          <p className="text-lg text-white/90 leading-relaxed">
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
                    activeCard === idx ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
            {stats.map((stat, idx) => {
              const colorMap = {
                blue: { gradient: 'from-blue-500 to-indigo-600', bg: 'from-blue-50 to-indigo-50', text: 'text-blue-700' },
                green: { gradient: 'from-green-500 to-emerald-600', bg: 'from-green-50 to-emerald-50', text: 'text-green-700' },
                indigo: { gradient: 'from-indigo-500 to-purple-600', bg: 'from-indigo-50 to-purple-50', text: 'text-indigo-700' },
                orange: { gradient: 'from-orange-500 to-red-600', bg: 'from-orange-50 to-red-50', text: 'text-orange-700' }
              };
              const colors = colorMap[stat.color];
              
              return (
                <Card key={idx} className={`bg-gradient-to-br ${colors.bg} border-2 border-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group`}>
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colors.gradient} mb-3 group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`text-3xl md:text-4xl font-black ${colors.text} mb-1`}>
                      {stat.num}
                    </div>
                    <div className="text-sm font-semibold text-slate-600">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Why Different Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 text-sm font-semibold mb-4">
                <Star className="w-4 h-4 mr-2 inline" />
                What Makes Us Different
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900">
                Not Your Average <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Study App</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {differenceCards.map((card, idx) => (
                <Card key={idx} className={`bg-gradient-to-br ${card.bg} border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group`}>
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`p-4 rounded-xl bg-gradient-to-br ${card.gradient} group-hover:scale-110 transition-transform`}>
                        <card.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mt-2">
                        {card.title}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {card.points.map((point, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-slate-700 leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 text-sm font-semibold mb-4">
                <Award className="w-4 h-4 mr-2 inline" />
                Success Stories
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900">
                Real Students. Real <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Results</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((test, idx) => (
                <Card key={idx} className="bg-white border-2 border-slate-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        {test.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{test.name}</div>
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          {test.rank}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-slate-600 italic leading-relaxed">
                      "{test.text}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-0 shadow-2xl">
            <CardContent className="p-12 text-center">
              <div className="max-w-3xl mx-auto space-y-6">
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  Ready to Transform Your JEE Journey?
                </h2>
                <p className="text-xl text-slate-300 leading-relaxed">
                  Join thousands of students who chose smart preparation over endless grinding. 
                  Your rank 1 story starts here.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-green-500/50 hover:shadow-xl hover:scale-105 transition-all group">
                    Start Learning Free
                    <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                  </Button>
                  <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-bold text-lg px-8 py-6 rounded-xl backdrop-blur-sm">
                    Watch Demo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
                <p className="text-sm text-slate-400 mt-4">
                  No credit card required • 7-day free trial • Cancel anytime
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WhyUsPage;
