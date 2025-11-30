import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from '@/components/Header';
import { Brain, Target, BookOpen, TrendingUp, Users, Zap, Clock, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeaturesPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Get personalized study plans and instant doubt resolution with our advanced AI tutor",
      color: "bg-blue-500",
      benefits: ["24/7 AI Support", "Personalized Recommendations", "Instant Problem Solving"]
    },
    {
      icon: Target,
      title: "Smart Test Series",
      description: "Practice with JEE Main & Advanced pattern tests with detailed analytics",
      color: "bg-green-500", 
      benefits: ["Real Exam Patterns", "Performance Analytics", "Rank Prediction"]
    },
    {
      icon: BookOpen,
      title: "Interactive Lessons",
      description: "Learn concepts through engaging interactive content and animations",
      color: "bg-purple-500",
      benefits: ["Visual Learning", "Step-by-step Solutions", "Concept Maps"]
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your improvement with detailed progress reports and insights",
      color: "bg-orange-500",
      benefits: ["Strength Analysis", "Weakness Identification", "Growth Metrics"]
    },
    {
      icon: Users,
      title: "Peer Learning",
      description: "Connect with fellow JEE aspirants and learn together",
      color: "bg-indigo-500",
      benefits: ["Study Groups", "Doubt Sharing", "Competitive Environment"]
    },
    {
      icon: Zap,
      title: "Quick Revision",
      description: "Smart revision techniques with spaced repetition algorithms",
      color: "bg-yellow-500",
      benefits: ["Formula Sheets", "Quick Notes", "Memory Techniques"]
    }
  ];

  const premiumFeatures = [
    {
      icon: Award,
      title: "All India Rank Prediction",
      description: "Get accurate rank predictions based on your performance"
    },
    {
      icon: Clock,
      title: "Unlimited Practice",
      description: "Access to unlimited tests and practice sessions"
    },
    {
      icon: Brain,
      title: "Advanced AI Tutor",
      description: "Premium AI features with detailed explanations"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <div className="pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8">
          
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Powerful Features for <span className="text-primary">JEE Success</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover all the tools and features that make JEEnius the best platform for JEE preparation
            </p>
          </div>

          {/* Main Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${feature.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4`}>
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{feature.description}</p>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-xs sm:text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Premium Features */}
          <div className="bg-gradient-to-r from-primary/10 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-12">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Premium Features</h2>
              <p className="text-sm sm:text-base text-gray-600">Unlock advanced features with our premium plans</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <feature.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/pricing')}
                className="bg-primary hover:bg-primary/90"
              >
                View Pricing Plans
              </Button>
            </div>
          </div>

          {/* Feature Comparison */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900">Feature Comparison</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Features</th>
                      <th className="text-center py-3 px-4">Free</th>
                      <th className="text-center py-3 px-4">Premium</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b">
                      <td className="py-3 px-4">Practice Questions</td>
                      <td className="text-center py-3 px-4">100/month</td>
                      <td className="text-center py-3 px-4">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Mock Tests</td>
                      <td className="text-center py-3 px-4">2/month</td>
                      <td className="text-center py-3 px-4">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">AI Tutor</td>
                      <td className="text-center py-3 px-4">Basic</td>
                      <td className="text-center py-3 px-4">Advanced</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Rank Prediction</td>
                      <td className="text-center py-3 px-4">✗</td>
                      <td className="text-center py-3 px-4">✓</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Detailed Analytics</td>
                      <td className="text-center py-3 px-4">Basic</td>
                      <td className="text-center py-3 px-4">Comprehensive</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to boost your JEE preparation?
            </h2>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate('/signup')}
              >
                Get Started Free
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/study-now')}
              >
                Try Features
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
