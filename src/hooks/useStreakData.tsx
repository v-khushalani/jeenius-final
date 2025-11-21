// src/hooks/useStreakData.tsx
// Centralized hook for streak data across the app

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useStreakData = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    loadStreak();

    // Real-time subscription
    const streakSubscription = supabase
      .channel('streak-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        () => {
          loadStreak();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(streakSubscription);
    };
  }, [user?.id]);

  const loadStreak = async () => {
    if (!user?.id) return;

    try {
    const { data } = await supabase
        .from('profiles')
        .select('current_streak')
        .eq('id', user.id)
        .single();

      setStreak(data?.current_streak || 0);
    } catch (error) {
      console.error('Error loading streak:', error);
      setStreak(0);
    } finally {
      setLoading(false);
    }
  };

  return { streak, loading, refresh: loadStreak };
};
