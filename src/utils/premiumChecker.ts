import { supabase } from '@/integrations/supabase/client';

export const checkIsPremium = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ No user logged in');
      return false;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, subscription_end_date')
      .eq('id', user.id)
      .single();

    const isPremiumActive = profile?.is_premium && 
      profile?.subscription_end_date &&
      new Date(profile.subscription_end_date) > new Date();

    console.log('🔍 Premium Check:', {
      isPremium: profile?.is_premium,
      endDate: profile?.subscription_end_date,
      isActive: isPremiumActive ? '✅ PREMIUM' : '❌ FREE'
    });

    return !!isPremiumActive;
  } catch (error) {
    console.error('❌ Premium check error:', error);
    return false;
  }
};
