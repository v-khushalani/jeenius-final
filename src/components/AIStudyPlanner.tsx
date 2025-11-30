/**
 * AI Study Planner - Main Component
 * Clean, modular architecture with hybrid AI approach
 */

import { useStudyPlanner } from '@/hooks/useStudyPlanner';
import { PlannerHeader } from './study-planner/PlannerHeader';
import { StatsCards } from './study-planner/StatsCards';
import { WeeklySchedule } from './study-planner/WeeklySchedule';
import { SWOTCard } from './study-planner/SWOTCard';
import { StudySettings } from './study-planner/StudySettings';
import { NotEnoughData } from './study-planner/NotEnoughData';
import { AIInsightsCard } from './study-planner/AIInsightsCard';

const MIN_QUESTIONS = 10;

export default function AIStudyPlanner() {
  const { data, aiLoading, loadData, fetchAIInsights, updateSettings } = useStudyPlanner();

  // Loading state
  if (data.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="relative">
            <div className="w-20 h-20 bg-[#013062]/10 rounded-full blur-xl absolute inset-0" />
            <div className="w-14 h-14 border-4 border-slate-200 border-t-[#013062] rounded-full animate-spin mx-auto relative" />
          </div>
          <p className="text-slate-600 font-medium">Generating your plan...</p>
          <p className="text-xs text-slate-400">Algorithm processing &lt;50ms</p>
        </div>
      </div>
    );
  }

  // Not enough data
  if (!data.hasEnoughData) {
    return (
      <NotEnoughData
        totalQuestions={data.totalQuestions}
        minRequired={MIN_QUESTIONS}
        onRefresh={loadData}
      />
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header with stats */}
      <PlannerHeader
        targetExam={data.targetExam}
        examDate={data.examDate}
        daysToExam={data.daysToExam}
        avgAccuracy={data.avgAccuracy}
        currentRank={data.rankPrediction.currentRank}
        motivation={data.motivation}
        aiInsights={data.aiInsights}
        onRefresh={loadData}
        onFetchAI={fetchAIInsights}
        aiLoading={aiLoading}
      />

      {/* Stats cards */}
      <StatsCards
        weakTopics={data.weakTopics}
        strongTopics={data.strongTopics}
        daysToExam={data.daysToExam}
        rankPrediction={data.rankPrediction}
      />

      {/* AI Insights (if loaded) */}
      {data.aiInsights && <AIInsightsCard insights={data.aiInsights} />}

      {/* Settings */}
      <StudySettings
        dailyStudyHours={data.dailyStudyHours}
        targetExam={data.targetExam}
        timeAllocation={data.timeAllocation}
        onUpdate={updateSettings}
      />

      {/* Weekly Schedule */}
      <WeeklySchedule weeklyPlan={data.weeklyPlan} />

      {/* SWOT Analysis */}
      <SWOTCard swotAnalysis={data.swotAnalysis} />
    </div>
  );
}
