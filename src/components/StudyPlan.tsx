import { useEffect, useState } from 'react';
import { studyPlanService } from '@/services/studyPlanService';
import { useToast } from '@/hooks/use-toast';

export default function StudyPlan() {
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStudyPlan();
  }, []);

  const loadStudyPlan = async () => {
    try {
      setLoading(true);
      const result = await studyPlanService.getCurrentPlan();
      setStudyPlan(result.studyPlan);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load study plan',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const result = await studyPlanService.refreshPlan();
      setStudyPlan(result.studyPlan);
      toast({
        title: 'Success',
        description: 'Study plan refreshed!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh plan',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Your UI here */}
      <button onClick={handleRefresh}>Refresh Plan</button>
      
      {studyPlan && (
        <div>
          <h2>Your Study Plan</h2>
          {/* Render plan */}
        </div>
      )}
    </div>
  );
}
