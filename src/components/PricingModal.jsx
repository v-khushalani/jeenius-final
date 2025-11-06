// src/components/PricingModal.jsx
import React, { useEffect, useState } from 'react';
import { X, Crown, Check, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/utils/supabaseClient';

const PricingModal = ({ isOpen, onClose, limitType = 'daily_limit', userId }) => {
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch real user stats from Supabase
  useEffect(() => {
    if (isOpen && userId) {
      const fetchStats = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_stats')
          .select('questions_completed, tests_completed, current_streak')
          .eq('user_id', userId)
          .single();

        if (!error && data) setUserStats(data);
        setLoading(false);
      };
      fetchStats();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => (document.body.style.overflow = 'unset');
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const limitMessages = {
    daily_limit: {
      title: 'Daily Limit Reached 🎯',
      message: 'You’ve solved all your free questions today! Unlock unlimited learning with Pro.',
      icon: '📘',
      urgency: 'medium',
    },
    monthly_limit: {
      title: 'Monthly Limit Reached 📊',
      message: 'You’ve completed your monthly quota! Continue your streak without limits.',
      icon: '📈',
      urgency: 'high',
    },
    test_limit: {
      title: 'Test Limit Reached 🧪',
      message: 'You’ve taken your free tests. Go unlimited with Pro!',
      icon: '🧠',
      urgency: 'high',
    },
    jeenie_blocked: {
      title: 'Jeenie AI - Pro Feature 🤖',
      message: 'Instant AI-powered doubt solving, 24/7 — only for Pro users.',
      icon: '🤖',
      urgency: 'medium',
    },
    study_planner_blocked: {
      title: 'AI Study Planner - Pro Feature 📅',
      message: 'Get a study plan that adapts to your exam and progress.',
      icon: '📅',
      urgency: 'medium',
    },
  };

  const message = limitMessages[limitType];

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-sm sm:max-w-md shadow-2xl animate-zoomIn duration-200 overflow-hidden"
      >
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 sm:p-6 border-b relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="text-5xl mb-2 animate-bounce">{message.icon}</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{message.title}</h2>
          </div>
        </div>

        <div className="p-5 sm:p-6 text-center">
          <p className="text-gray-600 text-sm sm:text-base mb-4">{message.message}</p>

          {loading ? (
            <Loader2 className="w-6 h-6 mx-auto text-green-600 animate-spin" />
          ) : (
            userStats && (
              <div className="bg-blue-50 rounded-xl p-3 sm:p-4 mb-4">
                <p className="text-xs sm:text-sm text-blue-900">
                  🎯 {userStats.questions_completed} questions solved •{' '}
                  {userStats.tests_completed} tests • {userStats.current_streak}-day streak
                </p>
              </div>
            )
          )}

          {message.urgency === 'high' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-orange-900">
                <strong>500+ students</strong> upgraded this week to unlock Pro features 🚀
              </p>
            </div>
          )}

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 mb-4 border border-green-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">Pro Benefits</span>
            </div>
            <ul className="text-xs sm:text-sm text-gray-700 space-y-2 text-left">
              <li><Check className="inline-block w-4 h-4 text-green-600 mr-1" /> Unlimited questions & tests</li>
              <li><Check className="inline-block w-4 h-4 text-green-600 mr-1" /> 24/7 Jeenie AI assistant</li>
              <li><Check className="inline-block w-4 h-4 text-green-600 mr-1" /> AI study planner</li>
              <li><Check className="inline-block w-4 h-4 text-green-600 mr-1" /> Advanced analytics dashboard</li>
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="text-3xl font-bold text-green-600">₹499<span className="text-base text-gray-600">/year</span></h3>
            <p className="text-xs text-gray-500 line-through">₹588 • Save ₹89</p>
            <p className="text-xs text-green-700 font-semibold">☕ Less than a samosa per day!</p>
          </div>

          <Button
            onClick={handleUpgrade}
            className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg"
          >
            <Crown className="w-4 h-4 mr-2" /> Upgrade to Pro
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full mt-3 border-2 border-gray-300 text-gray-700 py-3 rounded-lg"
          >
            Maybe Later
          </Button>

          <p className="text-center text-xs text-gray-500 mt-3">
            💯 30-day refund • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
