// src/utils/contentAccess.ts

import { supabase } from '@/integrations/supabase/client';

interface AccessResult {
  allowed: boolean;
  reason: string;
  message?: string;
  remaining?: number;
}

interface UsageStats {
  chaptersAccessed: number;
  chaptersLimit: number;
  questionsToday: number;
  questionsDailyLimit: number;
  aiQueriesToday: number;
  aiDailyLimit: number;
}

/**
 * Check if user can access a specific chapter
 */
export const canAccessChapter = async (
  userId: string,
  subject: string,
  chapterName: string
): Promise<AccessResult> => {
  try {
    // 1. Get chapter info - Cast to avoid deep type inference
    const { data: chapter } = await supabase
      .from('chapters')
      .select('id, is_free')
      .eq('subject', subject)
      .eq('chapter_name', chapterName)
      .maybeSingle() as { data: { id: string; is_free: boolean } | null };

    if (!chapter) {
      return {
        allowed: false,
        reason: 'chapter_not_found',
        message: 'Chapter not found'
      };
    }

    // 2. Check if chapter is marked as free
    if (chapter.is_free) {
      return { allowed: true, reason: 'free_content' };
    }

    // 3. Check if user has active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .single();

    if (subscription) {
      return { allowed: true, reason: 'premium_subscriber' };
    }

    // 4. Check free tier usage limit
    const { data: freeLimit } = await supabase
      .from('free_content_limits')
      .select('limit_value')
      .eq('limit_type', 'chapters')
      .single();

    // Get all chapters user has accessed
    const accessedResult = (await supabase
      .from('user_content_access')
      .select('content_identifier, subject')
      .eq('user_id', userId)
      .eq('content_type', 'chapter')) as any;
    
    const accessedChapters = accessedResult.data || [];

    // Count unique chapters accessed across all subjects
    const uniqueChapters = new Set(
      accessedChapters?.map(a => `${a.subject}-${a.content_identifier}`) || []
    );

    const limitValue = freeLimit?.limit_value || 5;

    // Check if this chapter is already accessed
    const alreadyAccessed = uniqueChapters.has(`${subject}-${chapterName}`);

    if (alreadyAccessed || uniqueChapters.size < limitValue) {
      // Track this access if not already tracked
      if (!alreadyAccessed) {
        await supabase.from('user_content_access').insert([{
          user_id: userId,
          content_type: 'chapter',
          content_identifier: chapterName,
          subject: subject
        }]);
      }

      return {
        allowed: true,
        reason: 'free_tier',
        remaining: Math.max(0, limitValue - uniqueChapters.size - (alreadyAccessed ? 0 : 1))
      };
    }

    // 5. Limit exceeded
    return {
      allowed: false,
      reason: 'limit_exceeded',
      message: `You've used all ${limitValue} free chapters. Upgrade to Premium for unlimited access! 🚀`
    };

  } catch (error) {
    console.error('Error checking chapter access:', error);
    return {
      allowed: false,
      reason: 'error',
      message: 'Unable to verify access. Please try again.'
    };
  }
};

/**
 * Check if user can attempt questions today
 */
export const canAttemptQuestion = async (userId: string): Promise<AccessResult> => {
  try {
    // 1. Check if user has active subscription (unlimited questions)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .single();

    if (subscription) {
      return { allowed: true, reason: 'premium_subscriber' };
    }

    // 2. Check daily question limit for free users
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attemptsQuery = supabase
      .from('user_content_access')
      .select('id')
      .eq('user_id', userId)
      .eq('content_type', 'question')
      .gte('accessed_at', today.toISOString());
    const attemptsResult: any = await attemptsQuery;
    
    const todayAttempts = attemptsResult.data || [];

    const { data: limit } = await supabase
      .from('free_content_limits')
      .select('limit_value')
      .eq('limit_type', 'questions_per_day')
      .single();

    const questionsAttempted = todayAttempts?.length || 0;
    const dailyLimit = limit?.limit_value || 50;

    if (questionsAttempted < dailyLimit) {
      return {
        allowed: true,
        reason: 'within_limit',
        remaining: dailyLimit - questionsAttempted
      };
    }

    return {
      allowed: false,
      reason: 'daily_limit_exceeded',
      message: `Daily limit of ${dailyLimit} questions reached! Upgrade to Premium for unlimited practice. 📚`
    };

  } catch (error) {
    console.error('Error checking question access:', error);
    return {
      allowed: false,
      reason: 'error',
      message: 'Unable to verify access. Please try again.'
    };
  }
};

/**
 * Track question attempt
 */
export const trackQuestionAttempt = async (
  userId: string,
  questionId: string
): Promise<void> => {
  try {
    await supabase.from('user_content_access').insert([{
      user_id: userId,
      content_type: 'question',
      content_identifier: questionId,
      subject: ''
    }]);
  } catch (error) {
    console.error('Error tracking question attempt:', error);
  }
};

/**
 * Check if user can use AI features
 */
export const canUseAI = async (userId: string): Promise<AccessResult> => {
  try {
    // 1. Check subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .single();

    if (subscription) {
      return { allowed: true, reason: 'premium_subscriber' };
    }

    // 2. Check daily AI query limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queriesQuery: any = supabase
      .from('user_content_access')
      .select('id')
      .eq('user_id', userId)
      .eq('content_type', 'ai_query')
      .gte('accessed_at', today.toISOString());
    const queriesResult = await queriesQuery;
    
    const todayQueries = queriesResult.data || [];

    const { data: limit } = await supabase
      .from('free_content_limits')
      .select('limit_value')
      .eq('limit_type', 'ai_queries_per_day')
      .single();

    const queriesUsed = todayQueries?.length || 0;
    const dailyLimit = limit?.limit_value || 20;

    if (queriesUsed < dailyLimit) {
      return {
        allowed: true,
        reason: 'within_limit',
        remaining: dailyLimit - queriesUsed
      };
    }

    return {
      allowed: false,
      reason: 'daily_limit_exceeded',
      message: `Daily AI limit of ${dailyLimit} queries reached! Upgrade for unlimited AI assistance. 🤖`
    };

  } catch (error) {
    console.error('Error checking AI access:', error);
    return {
      allowed: false,
      reason: 'error',
      message: 'Unable to verify AI access. Please try again.'
    };
  }
};

/**
 * Track AI query usage
 */
export const trackAIQuery = async (userId: string): Promise<void> => {
  try {
    await supabase.from('user_content_access').insert([{
      user_id: userId,
      content_type: 'ai_query',
      content_identifier: 'ai_query',
      subject: ''
    }]);
  } catch (error) {
    console.error('Error tracking AI query:', error);
  }
};

/**
 * Get user's current subscription status
 */
export const getUserSubscription = async (userId: string) => {
  try {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .order('end_date', { ascending: false })
      .limit(1)
      .single();

    return subscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
};

/**
 * Check if user is premium subscriber
 */
export const isPremiumUser = async (userId: string): Promise<boolean> => {
  const subscription = await getUserSubscription(userId);
  return !!subscription;
};

/**
 * Get user's usage statistics
 */
export const getUserUsageStats = async (userId: string): Promise<UsageStats> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all limits
    const { data: limits } = await supabase
      .from('free_content_limits')
      .select('*');

    const limitsMap = limits?.reduce((acc, l) => {
      acc[l.limit_type] = l.limit_value;
      return acc;
    }, {} as Record<string, number>) || {};

    // Chapters accessed (all time, unique) - Simplify type
    const chaptersResult = await supabase
      .from('user_content_access')
      .select('content_identifier, subject')
      .eq('user_id', userId)
      .eq('content_type', 'chapter') as { data: Array<{ content_identifier: string; subject: string }> | null; error: any };
    
    const chaptersAccessed = chaptersResult.data || [];

    const uniqueChapters = new Set(
      chaptersAccessed?.map(c => `${c.subject}-${c.content_identifier}`) || []
    );

    // Questions attempted today - Simplify type
    const questionsTodayResult = await supabase
      .from('user_content_access')
      .select('id')
      .eq('user_id', userId)
      .eq('content_type', 'question')
      .gte('accessed_at', today.toISOString()) as { data: Array<{ id: string }> | null; error: any };
    
    const questionsToday = questionsTodayResult.data || [];

    // AI queries today - Cast to avoid deep type inference
    const { data: aiQueriesData } = await supabase
      .from('user_content_access')
      .select('id')
      .eq('user_id', userId)
      .eq('content_type', 'ai_query')
      .gte('accessed_at', today.toISOString()) as { data: Array<{ id: string }> | null };
    
    const aiQueriesToday = aiQueriesData || [];

    return {
      chaptersAccessed: uniqueChapters.size,
      chaptersLimit: limitsMap.chapters || 5,
      questionsToday: questionsToday?.length || 0,
      questionsDailyLimit: limitsMap.questions_per_day || 50,
      aiQueriesToday: aiQueriesToday?.length || 0,
      aiDailyLimit: limitsMap.ai_queries_per_day || 20
    };

  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return {
      chaptersAccessed: 0,
      chaptersLimit: 5,
      questionsToday: 0,
      questionsDailyLimit: 50,
      aiQueriesToday: 0,
      aiDailyLimit: 20
    };
  }
};

/**
 * Get list of accessible chapters for user
 */
export const getAccessibleChapters = async (
  userId: string,
  subject?: string
) => {
  try {
    // Get user subscription status
    const isPremium = await isPremiumUser(userId);

    if (isPremium) {
      // Premium users get all chapters
      const query = supabase
        .from('chapters')
        .select('*')
        .order('chapter_number');

      if (subject) {
        query.eq('subject', subject);
      }

      const { data } = await query;
      return data?.map(chapter => ({ ...chapter, locked: false })) || [];
    }

    // Free users
    const query = supabase
      .from('chapters')
      .select('*')
      .order('chapter_number');

    if (subject) {
      query.eq('subject', subject);
    }

    const { data: allChapters } = (await query) as any;

    // Get accessed chapters
    const accessedChaptersResult = (await supabase
      .from('user_content_access')
      .select('content_identifier, subject')
      .eq('user_id', userId)
      .eq('content_type', 'chapter')) as any;
    
    const accessedChapters = accessedChaptersResult.data || [];

    const accessedSet = new Set(
      accessedChapters?.map(a => `${a.subject}-${a.content_identifier}`) || []
    );

    // Get free limit
    const { data: freeLimit } = await supabase
      .from('free_content_limits')
      .select('limit_value')
      .eq('limit_type', 'chapters')
      .single();

    const limitValue = freeLimit?.limit_value || 5;

    return allChapters?.map(chapter => {
      const key = `${chapter.subject}-${chapter.chapter_name}`;
      const alreadyAccessed = accessedSet.has(key);
      const canAccess = chapter.is_free || alreadyAccessed || accessedSet.size < limitValue;

      return {
        ...chapter,
        locked: !canAccess
      };
    }) || [];

  } catch (error) {
    console.error('Error fetching accessible chapters:', error);
    return [];
  }
};

/**
 * Format remaining count message
 */
export const formatRemainingMessage = (
  type: 'chapters' | 'questions' | 'ai',
  remaining: number
): string => {
  if (remaining === 0) {
    return `No free ${type} remaining today`;
  }
  if (remaining === 1) {
    return `${remaining} free ${type.slice(0, -1)} remaining`;
  }
  return `${remaining} free ${type} remaining`;
};
