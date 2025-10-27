import React from 'react';
import Header from '@/components/Header';
import { checkIsPremium } from '@/utils/premiumChecker';
import AIStudyPlanner from '@/components/AIStudyPlanner';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AIStudyPlannerPage = () => {
  const [isPro, setIsPro] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkPremium = async () => {
      const isPremium = await checkIsPremium();
      setIsPro(isPremium);
    };
    checkPremium();
  }, []);
  
  if (!isPro) {
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
  
  useEffect(() => {
    checkPro();
  }, []);
  
  const checkPro = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user?.id)
      .eq('is_active', true)
      .single();
    
    const isProUser = subscription && 
      new Date(subscription.expires_at) > new Date();
    setIsPro(isProUser);
  };
  
  if (!isPro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="container mx-auto px-4 max-w-4xl pt-32 text-center">
          <div className="bg-white p-12 rounded-2xl shadow-xl border-2 border-purple-200">
            <Lock className="w-20 h-20 mx-auto text-purple-600 mb-6" />
            <h2 className="text-3xl font-bold mb-4">AI Study Planner is a Pro Feature</h2>
            <p className="text-gray-600 mb-6">
              Upgrade to Pro to unlock personalized AI-powered study plans!
            </p>
            <Button
              onClick={() => navigate('/subscription-plans')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3"
            >
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
