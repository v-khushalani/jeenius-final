import React, { useEffect } from 'react';
import { X, Crown, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PricingModal = ({ 
  isOpen, 
  onClose, 
  limitType = 'daily_limit',
  userStats = {}
}) => {
  const navigate = useNavigate();

  const limitMessages = {
    daily_limit: {
      title: "Daily Limit Reached! 🎯",
      message: "You've used all 25 questions today. Come back tomorrow or upgrade to Pro for unlimited access!",
      icon: "📚",
      urgency: "medium"
    },
    monthly_limit: {
      title: "Monthly Cap Reached! 📊",
      message: "You've completed 150 questions this month. Upgrade to Pro for unlimited questions!",
      icon: "📈",
      urgency: "high"
    },
    test_limit: {
      title: "Test Limit Reached! 📝",
      message: "You've taken 2 tests this month. Upgrade to Pro for unlimited mock tests!",
      icon: "🧪",
      urgency: "high"
    },
    jeenie_blocked: {
      title: "Jeenie AI - Pro Feature 🤖",
      message: "Get instant doubt solving with Jeenie AI assistant available 24/7!",
      icon: "🤖",
      urgency: "medium"
    },
    study_planner_blocked: {
      title: "AI Study Planner - Pro Feature 📅",
      message: "Get a dynamic study plan that adapts to your progress and exam date!",
      icon: "📅",
      urgency: "medium"
    },
    almost_there: {
      title: "Almost at Your Limit! ⚡",
      message: "Just 5 questions left today. Want unlimited practice? Upgrade now!",
      icon: "⚡",
      urgency: "low"
    }
  };

  const message = limitMessages[limitType] || limitMessages.daily_limit;

  useEffect(() => {
    if (isOpen) {
      // Track modal shown (integrate with your analytics)
      console.log('Modal shown:', limitType);
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, limitType]);

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 border-b border-gray-200 relative z-10">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-white/50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center pr-8">
            <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 animate-bounce">{message.icon}</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {message.title}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6">
          <p className="text-gray-600 text-center mb-4 sm:mb-6 text-sm sm:text-base">
            {message.message}
          </p>

          {/* Social Proof - High urgency only */}
          {message.urgency === 'high' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-orange-900">
                <strong>500+ students</strong> upgraded this week to unlock unlimited practice!
              </p>
            </div>
          )}

          {/* User Stats */}
          {userStats.questionsCompleted && userStats.questionsCompleted > 50 && (
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-4">
              <p className="text-xs sm:text-sm text-blue-900 text-center">
                🎯 You've completed <strong>{userStats.questionsCompleted} questions</strong>!
                <br className="hidden sm:block" />
                <span className="block sm:inline"> Imagine what you could do with unlimited access...</span>
              </p>
            </div>
          )}

          {/* Pro Features Preview */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <span className="font-bold text-green-900 text-sm sm:text-base">Upgrade to Pro & Get:</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-start gap-2 text-gray-700">
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Unlimited</strong> questions & mock tests</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Jeenie AI assistant 24/7</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>AI-powered study planner</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Advanced performance analytics</span>
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-3xl sm:text-4xl font-bold text-green-600">₹499</span>
              <span className="text-gray-500 text-sm sm:text-base">/year</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">
              <span className="line-through text-gray-400">₹588</span> • Save ₹89 annually!
            </p>
            <p className="text-xs text-green-600 font-semibold">
              ☕ Less than a samosa per day!
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 sm:py-3.5 rounded-lg text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            >
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Upgrade to Pro Now
            </button>
            <button
              onClick={onClose}
              className="w-full border-2 border-gray-300 hover:border-gray-400 py-3 sm:py-3.5 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              Maybe Later
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-3 sm:mt-4">
            💯 30-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
