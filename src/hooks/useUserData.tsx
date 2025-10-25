// src/hooks/useUserData.tsx - Now using Supabase instead of localStorage

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserData = () => {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subjectProgress, setSubjectProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setStats({
            totalPoints: 0,
            streak: 0,
            totalQuestions: 0,
            accuracy: 0,
            problemsSolved: 0,
            currentRank: 0,
            totalUsers: 10000,
            rankCategory: 'Beginner',
            percentile: 0,
            totalTimeSpent: 0
          });
          setSubjectProgress([]);
          setProfile({ full_name: null });
          setLoading(false);
          return;
        }

        // Fetch all question attempts
        const { data: attempts, error: attemptsError } = await supabase
          .from('question_attempts')
          .select('*, questions(subject)')
          .eq('user_id', user.id);

        if (attemptsError) throw attemptsError;

        // Calculate overall stats
        const totalQuestions = attempts?.length || 0;
        const totalCorrect = attempts?.filter(a => a.is_correct).length || 0;
        const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
        const totalTimeSpent = attempts?.reduce((sum, a) => sum + (a.time_taken || 0), 0) || 0;

        // Calculate subject-wise progress
        const subjectStats = {};
        attempts?.forEach(attempt => {
          const subject = attempt.questions?.subject;
          if (!subject) return;

          if (!subjectStats[subject]) {
            subjectStats[subject] = { attempted: 0, correct: 0 };
          }
          subjectStats[subject].attempted += 1;
          if (attempt.is_correct) {
            subjectStats[subject].correct += 1;
          }
        });

        const subjectProgressData = Object.keys(subjectStats).map(subject => ({
          subject,
          accuracy: Math.round((subjectStats[subject].correct / subjectStats[subject].attempted) * 100)
        }));

        // Calculate streak (simplified - you can enhance this)
        const streak = 0; // TODO: Calculate from consecutive study days

        // Calculate rank based on performance
        const performanceScore = accuracy * 4 + Math.min(totalQuestions / 10, 100) * 3;
        let rank, rankCategory, percentile;
        
        if (performanceScore >= 800) {
          rank = Math.floor(Math.random() * 100) + 1;
          rankCategory = "Elite JEEnius";
          percentile = 99;
        } else if (performanceScore >= 600) {
          rank = Math.floor(Math.random() * 500) + 100;
          rankCategory = "Advanced";
          percentile = 95;
        } else if (performanceScore >= 400) {
          rank = Math.floor(Math.random() * 1000) + 500;
          rankCategory = "Intermediate";
          percentile = 85;
        } else {
          rank = Math.floor(Math.random() * 5000) + 1500;
          rankCategory = "Beginner";
          percentile = 50;
        }

        setStats({
          totalPoints: totalCorrect * 10,
          streak,
          totalQuestions,
          accuracy,
          problemsSolved: totalCorrect,
          currentRank: rank,
          totalUsers: 50000,
          rankCategory,
          percentile,
          totalTimeSpent
        });
        setSubjectProgress(subjectProgressData);
        
        // Load profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(profileData || { full_name: null });
        
        console.log('📊 Dashboard updated from Supabase:', {
          totalQuestions,
          totalCorrect,
          accuracy,
          subjects: subjectProgressData
        });
        
      } catch (error) {
        console.error('Error loading user data:', error);
        
        setStats({
          totalPoints: 0,
          streak: 0,
          totalQuestions: 0,
          accuracy: 0,
          problemsSolved: 0,
          currentRank: 0,
          totalUsers: 10000,
          rankCategory: 'Beginner',
          percentile: 0,
          totalTimeSpent: 0
        });
        setSubjectProgress([]);
        setProfile({ full_name: null });
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Refresh data every 5 seconds
    const interval = setInterval(loadData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return { stats, profile, subjectProgress, loading };
};
