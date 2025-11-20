import React, { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import AIDoubtSolver from './AIDoubtSolver';
import { useAuth } from '@/contexts/AuthContext';

const FloatingAIButton = () => {
  const [showAI, setShowAI] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated, isPremium, isLoading } = useAuth();

  
  // Dummy question for general doubts (outside practice mode)
  const generalQuestion = {
    question: "I have a doubt...",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "",
    explanation: ""
  };

  // Completely disabled - never show
  return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setShowAI(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-6 right-6 z-40 group"
        aria-label="AI Doubt Solver"
      >
        {/* Animated Background Circles */}
        <div className="absolute inset-0 animate-ping">
          <div className="w-16 h-16 rounded-full bg-purple-400 opacity-30"></div>
        </div>
        <div className="absolute inset-0 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-40"></div>
        </div>

        {/* Main Button */}
        <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:shadow-purple-500/50">
          {/* Sparkle Effect */}
          <div className="absolute -top-1 -right-1 animate-bounce">
            <Sparkles className="w-4 h-4 text-yellow-300" fill="currentColor" />
          </div>
          
          {/* Bot Icon */}
          <Bot className="w-8 h-8 text-white animate-pulse" />
        </div>

        {/* Tooltip on Hover */}
        {isHovered && (
          <div className="absolute bottom-full right-0 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap">
              <p className="text-sm font-semibold">🤖 Ask AI Anything!</p>
              <p className="text-xs opacity-90">
                JEEnie - Premium AI Tutor 💎
              </p>
            </div>
            {/* Arrow */}
            <div className="absolute top-full right-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-purple-600"></div>
          </div>
        )}
      </button>

      {/* AI Modal */}
      <AIDoubtSolver 
        question={generalQuestion}
        isOpen={showAI}
        onClose={() => setShowAI(false)}
      />
    </>
  );
};

export default FloatingAIButton;
