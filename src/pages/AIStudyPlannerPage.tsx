import React from 'react';
import Header from '@/components/Header';
import AIStudyPlanner from '@/components/AIStudyPlanner';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const AIStudyPlannerPage = () => {
  const { isPremium } = useAuth();
  const navigate = useNavigate();
  
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="container mx-auto px-3 sm:px-4 max-w-4xl pt-20 sm:pt-24 md:pt-32 text-center">
          <div className="bg-white p-6 sm:p-8 md:p-12 rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-200">
            <Lock className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto text-purple-600 mb-4 sm:mb-6" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">Pro Feature 🔒</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Upgrade to unlock AI Study Planner!</p>
            <Button onClick={() => navigate('/subscription-plans')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base">
              Upgrade to Pro - ₹49/month
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 max-w-7xl pt-20 sm:pt-24 pb-6 sm:pb-12">
        <AIStudyPlanner />
      </div>
    </div>
  );
};

export default AIStudyPlannerPage;
