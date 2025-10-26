import React, { useState, useEffect } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AIDoubtSolver from './AIDoubtSolver';
import { useNavigate } from 'react-router-dom';
import { usePremium } from '@/hooks/usePremium';

const FloatingAIButton = () => {
  const [showAI, setShowAI] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { isPremium } = usePremium();
  
  // ✅ Improved Authentication Logic
  useEffect(() => {
    let mounted = true;
  
    const updateAuthState = (session: any) => {
      if (!mounted) return;
      const isLoggedIn = !!(session && session.user);
      setIsAuthenticated(isLoggedIn);
      if (!isLoggedIn) setShowAI(false);
      console.log('🔐 Auth state updated:', isLoggedIn ? '✅ LOGGED IN' : '❌ LOGGED OUT');
    };
  
    // 1️⃣ Check initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error('❌ Auth error:', error);
      console.log('🔍 Initial session check:', session);
      updateAuthState(session);
    });
  
    // 2️⃣ Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 Auth state changed:', _event, session);
      updateAuthState(session);
    });
  
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  
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

  // CRITICAL: Don't render anything until auth check is complete
  // null = still loading, false = not authenticated, true = authenticated
  if (isAuthenticated === null) {
    console.log('⏳ Auth still loading...');
    return null;
  }

  if (isAuthenticated === false) {
    console.log('🚫 Not authenticated - hiding button');
    return null;
  }

  console.log('✅ Authenticated - showing button');

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
                {isPremium ? 'Unlimited AI' : '5 free queries/day'}
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
