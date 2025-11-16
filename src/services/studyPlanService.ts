import { supabase } from '@/integrations/supabase/client';

export const studyPlanService = {
  // Generate or get current study plan
  async getCurrentPlan() {
    try {
      const { data, error } = await supabase.functions.invoke('generate-study-plan', {
        method: 'POST'
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting study plan:', error);
      throw error;
    }
  },

  // Force refresh study plan
  async refreshPlan() {
    try {
      // Delete existing plans
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase
        .from('study_plans')
        .delete()
        .eq('user_id', user.id);

      // Generate new plan
      return await this.getCurrentPlan();
    } catch (error) {
      console.error('Error refreshing study plan:', error);
      throw error;
    }
  },

  // Update completion status
  async updateCompletion(planId: string, completionStatus: number) {
    try {
      const { error } = await supabase
        .from('study_plans')
        .update({ completion_status: completionStatus })
        .eq('id', planId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating completion:', error);
      throw error;
    }
  },

  // Get study plan history
  async getPlanHistory(limit = 10) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting plan history:', error);
      throw error;
    }
  }
};
