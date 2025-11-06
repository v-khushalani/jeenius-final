import React from 'react';
import { X, Crown, Zap, Bot, Calendar, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PricingModal = ({ isOpen, onClose, limitType = 'daily_limit' }) => {
  const navigate = useNavigate();

  const limitMessages = {
    daily_limit: {
      title: "Daily Limit Reached! 🎯",
      message: "You've used all 25 questions today. Come back tomorrow or upgrade to Pro for unlimited access!",
      icon: "📚"
    },
    monthly_limit: {
      title: "Monthly Cap Reached! 📊",
      message: "You've completed 150 questions this month. Upgrade to Pro for unlimited questions!",
      icon: "📈"
    },
    test_limit: {
      title: "Test Limit Reached! 📝",
      message: "You've taken 2 tests this month. Upgrade to Pro for unlimited mock tests!",
      icon: "🧪"
    },
    jeenie_blocked: {
      title: "Jeenie AI - Pro Feature 🤖",
      message: "Jeenie AI assistant is available only for Pro users. Get instant doubt solving 24/7!",
      icon: "🤖"
    },
    study_planner_blocked: {
      title: "AI Study Planner - Pro Feature 📅",
      message: "Get a dynamic study plan that adapts to your progress and exam date!",
      icon: "📅"
    }
  };

  const message = limitMessages[limitType] || limitMessages.daily_limit;

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="text-5xl mb-3">{message.icon}</div>
            <h2 className="text-2xl font-bold text-gray-900">{message.title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 text-center mb-6">
            {message.message}
          </p>

          {/* Pro Features Preview */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-green-600" />
              <span className="font-bold text-green-900">Upgrade to Pro & Get:</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Unlimited questions & tests</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Jeenie AI assistant 24/7</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>AI-powered study planner</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Advanced analytics</span>
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-4xl font-bold text-green-600">₹499</span>
              <span className="text-gray-500">/year</span>
            </div>
            <p className="text-sm text-gray-600">
              Less than ₹2/day • Save ₹89 annually!
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 text-lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to Pro Now
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-2 border-gray-300"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
