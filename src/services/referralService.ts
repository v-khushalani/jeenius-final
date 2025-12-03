// src/services/referralService.ts
import { supabase } from '@/integrations/supabase/client';
const REFERRAL_MAX_REWARDS = 4; // Max 4 referrals = 1 month free
import UserLimitsService from './userLimitsService';

export class ReferralService {
  
  // Generate referral code (using user ID as code for simplicity)
  static generateReferralCode(userId: string): string {
    return `JEE${userId.slice(0, 8).toUpperCase()}`;
  }

  // Get referral link
  static getReferralLink(userId: string): string {
    const code = this.generateReferralCode(userId);
    return `${window.location.origin}/login?ref=${code}`;
  }

  // Create a referral entry when user shares
  static async createReferral(referrerId: string, referredEmail: string): Promise<boolean> {
    try {
      // Check if referral already exists
      const { data: existing } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', referrerId)
        .eq('referred_email', referredEmail)
        .single();

      if (existing) {
        console.log('Referral already exists');
        return false;
      }

      await supabase.from('referrals').insert({
        referrer_id: referrerId,
        referred_email: referredEmail,
        status: 'pending',
        reward_granted: false
      });

      return true;
    } catch (error) {
      console.error('Error creating referral:', error);
      return false;
    }
  }

  // Complete referral when referred user signs up
  static async completeReferral(referredUserId: string, referredEmail: string): Promise<boolean> {
    try {
      // Find pending referral
      const { data: referral } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_email', referredEmail)
        .eq('status', 'pending')
        .single();

      if (!referral) {
        console.log('No pending referral found');
        return false;
      }

      // Update referral status
      await supabase
        .from('referrals')
        .update({
          referred_user_id: referredUserId,
          status: 'completed'
        })
        .eq('id', referral.id);

      // Grant reward to referrer (1 week free Pro)
      await this.grantReferralReward(referral.referrer_id, referral.id);

      return true;
    } catch (error) {
      console.error('Error completing referral:', error);
      return false;
    }
  }

  // Grant referral reward
  static async grantReferralReward(referrerId: string, referralId: string): Promise<boolean> {
    try {
      // Check if max rewards reached
      const { count } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', referrerId)
        .eq('reward_granted', true);

      if (count && count >= REFERRAL_MAX_REWARDS) {
        console.log('Max referral rewards reached');
        return false;
      }

      // Add 1 week Pro to referrer
      const success = await UserLimitsService.addReferralReward(referrerId);

      if (success) {
        // Mark reward as granted
        await supabase
          .from('referrals')
          .update({ reward_granted: true })
          .eq('id', referralId);
      }

      return success;
    } catch (error) {
      console.error('Error granting referral reward:', error);
      return false;
    }
  }

  // Get user's referral stats
  static async getReferralStats(userId: string): Promise<{
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    rewardsEarned: number;
    weeksEarned: number;
    referralCode: string;
    referralLink: string;
  }> {
    const { data: referrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId);

    const completed = referrals?.filter(r => r.status === 'completed') || [];
    const pending = referrals?.filter(r => r.status === 'pending') || [];
    const rewarded = referrals?.filter(r => r.reward_granted) || [];

    return {
      totalReferrals: referrals?.length || 0,
      completedReferrals: completed.length,
      pendingReferrals: pending.length,
      rewardsEarned: rewarded.length,
      weeksEarned: rewarded.length, // 1 week per referral
      referralCode: this.generateReferralCode(userId),
      referralLink: this.getReferralLink(userId)
    };
  }

  // Check if email was referred
  static async checkReferral(email: string): Promise<string | null> {
    const { data } = await supabase
      .from('referrals')
      .select('referrer_id')
      .eq('referred_email', email)
      .eq('status', 'pending')
      .single();

    return data?.referrer_id || null;
  }
}

export default ReferralService;
