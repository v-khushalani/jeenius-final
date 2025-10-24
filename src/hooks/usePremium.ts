// src/hooks/usePremium.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FREE_LIMITS } from '@/config/subscriptionPlans';

interface SubscriptionInfo {
  isPremium: boolean;
  planId: string | null;
  endDate: Date | null;
  daysRemaining: number;
  isLoading: boolean;
}

interface UsageLimits {
  questionsPerDay: number;
  chaptersAccess: number;
  testAttempts: number;
  battleMode: boolean;
  aiDoubtSolver: boolean;
  downloadNotes: boolean;
}

export const usePremium = () => {
  const { user } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    isPremium: false,
    planId: null,
    endDate: null,
    daysRemaining: 0,
    isLoading: true
  });

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
    } else {
      setSubscriptionInfo({
        isPremium: false,
        planId: null,
        endDate: null,
        daysRemaining: 0,
        isLoading: false
      });
    }
  }, [user]);

  const checkPremiumStatus = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium, premium_until')
        .eq('id', user?.id)
        .single();

      if (profile?.is_premium && profile?.premium_until) {
        const endDate = new Date(profile.premium_until);
        const now = new Date();
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Check if premium expired
        if (daysRemaining <= 0) {
          await supabase
            .from('profiles')
            .update({ is_premium: false })
            .eq('id', user?.id);

          setSubscriptionInfo({
            isPremium: false,
            planId: null,
            endDate: null,
            daysRemaining: 0,
            isLoading: false
          });
          return;
        }

        // Get subscription details
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan_id')
          .eq('user_id', user?.id)
          .single();

        setSubscriptionInfo({
          isPremium: true,
          planId: subscription?.plan_id || null,
          endDate,
          daysRemaining,
          isLoading: false
        });
      } else {
        setSubscriptionInfo({
          isPremium: false,
          planId: null,
          endDate: null,
          daysRemaining: 0,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
      setSubscriptionInfo({
        isPremium: false,
        planId: null,
        endDate: null,
        daysRemaining: 0,
        isLoading: false
      });
    }
  };

  const getLimits = (): UsageLimits => {
    if (subscriptionInfo.isPremium) {
      return {
        questionsPerDay: -1, // unlimited
        chaptersAccess: -1,
        testAttempts: -1,
        battleMode: true,
        aiDoubtSolver: true,
        downloadNotes: true
      };
    }
    return {
      questionsPerDay: FREE_LIMITS.dailyQuestions,
      chaptersAccess: FREE_LIMITS.chapters,
      testAttempts: 5,
      battleMode: false,
      aiDoubtSolver: false,
      downloadNotes: false
    };
  };

  const canAccessFeature = (feature: keyof UsageLimits): boolean => {
    if (subscriptionInfo.isPremium) return true;
    
    const limits = FREE_LIMITS;
    const featureLimit = limits[feature];
    
    if (typeof featureLimit === 'boolean') {
      return featureLimit;
    }
    
    return false; // Require premium for numeric limits
  };

  const checkDailyQuestionLimit = async (): Promise<boolean> => {
    if (subscriptionInfo.isPremium) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: attempts } = await supabase
      .from('question_attempts')
      .select('id')
      .eq('user_id', user?.id)
      .gte('created_at', today.toISOString());

    return (attempts?.length || 0) < FREE_LIMITS.dailyQuestions;
  };

  return {
    ...subscriptionInfo,
    limits: getLimits(),
    canAccessFeature,
    checkDailyQuestionLimit,
    refreshStatus: checkPremiumStatus
  };
};
