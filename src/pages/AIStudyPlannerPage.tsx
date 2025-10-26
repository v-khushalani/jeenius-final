import React from 'react';
import Header from '@/components/Header';
import AIStudyPlanner from '@/components/AIStudyPlanner';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePremium } from '@/hooks/usePremium';

const AIStudyPlannerPage = () => {
  const { isPremium } = usePremium();
  const navigate = useNavigate();
  
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="container mx-auto px-4 max-w-4xl pt-32 text-center">
          <div className="bg-white p-12 rounded-2xl shadow-xl border-2 border-purple-200">
            <Lock className="w-20 h-20 mx-auto text-purple-600 mb-6" />
            <h2 className="text-3xl font-bold mb-4">Pro Feature 🔒</h2>
            <p className="text-gray-600 mb-6">Upgrade to unlock AI Study Planner!</p>
            <Button onClick={() => navigate('/subscription-plans')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3">
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-30 pb-12">
        <AIStudyPlanner />
      </div>
    </div>
  );
};

export default AIStudyPlannerPage;
