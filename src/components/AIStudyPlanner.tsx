/* ----------------------------------------------
   JEEnius AI Study Planner – Premium Redesign
   PART 1 — Imports + Page Wrapper + Global Theme
---------------------------------------------- */

import React, { useState, useEffect } from "react";
import {
  Brain,
  Flame,
  Target,
  Calendar,
  Trophy,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Clock,
  Award,
  Zap,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function EnhancedAIStudyPlanner() {
  /* -------------------------------
     STATE MANAGEMENT (unchanged)
  -------------------------------- */
  const [loading, setLoading] = useState(true);

  const [selectedExam, setSelectedExam] = useState("JEE_MAINS");
  const [examDate, setExamDate] = useState("2026-01-24");
  const [aiRecommendedHours, setAiRecommendedHours] = useState(6);
  const [userHours, setUserHours] = useState(6);

  const [userPoints, setUserPoints] = useState(0);
  const [recentPoints, setRecentPoints] = useState(0);
  const [badges, setBadges] = useState([]);

  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({
    todayProgress: 0,
    weeklyStreak: 0,
    totalStudyTime: 0,
    targetHours: 6,
  });

  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [subjectAnalysis, setSubjectAnalysis] = useState([]);
  const [chapterAnalysis, setChapterAnalysis] = useState([]);
  const [topicAnalysis, setTopicAnalysis] = useState([]);
  const [studyPlan, setStudyPlan] = useState([]);
  const [predictedRank, setPredictedRank] = useState(null);
  const [strengthsWeaknesses, setStrengthsWeaknesses] = useState(null);
  const [expandedSection, setExpandedSection] = useState("subjects");
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyTrend, setWeeklyTrend] = useState([]);

  /* ----------------------------------------
     JEEnius brand-theme global CSS injection
  ----------------------------------------- */

  const JEENIUS_THEME = `
    :root {
      --primary: #013062;
      --primary-light: #E6EEFF;
      --surface: #FFFFFF;
      --surface-soft: #F7F9FF;
      --border-light: #E6EEFF;
      --text-dark: #062143;
      --text-medium: #5B6375;
      --text-light: #8C94A6;
      --radius-xl: 22px;
      --shadow-soft: 0 4px 14px rgba(1, 48, 98, 0.06);
      --shadow-medium: 0 8px 24px rgba(1, 48, 98, 0.09);
    }

    .j-card {
      background: var(--surface);
      border-radius: var(--radius-xl);
      border: 1px solid var(--border-light);
      box-shadow: var(--shadow-soft);
      padding: 28px;
    }

    .j-section-title {
      font-size: 22px;
      color: var(--primary);
      font-weight: 800;
      margin-bottom: 12px;
    }

    .j-sub {
      color: var(--text-medium);
      font-size: 14px;
    }

    .j-progress-bg {
      height: 7px;
      background: #D9E6FF;
      border-radius: 8px;
    }

    .j-progress-fill {
      height: 7px;
      background: var(--primary);
      border-radius: 8px;
    }

    .j-pill {
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
    }
  `;

  /* ------------------------------------------
     Start Layout Rendering
  ------------------------------------------- */

  return (
    <div className="w-full min-h-screen bg-[#F4F7FF] px-4 sm:px-6 md:px-10 lg:px-16 py-6">
      {/* Inject JEEnius UI Theme */}
      <style>{JEENIUS_THEME}</style>

      {/* MAIN SPACED LAYOUT */}

      <div className="max-w-7xl mx-auto space-y-10">
{/* ---------------------------------------------------
     PART 2 — HERO SECTION + TOP OVERVIEW
---------------------------------------------------- */}

{/* Exam Selector + Countdown */}
<div className="j-card flex flex-col md:flex-row items-center justify-between gap-8">

  {/* Left: Exam Selector */}
  <div className="space-y-2">
    <p className="text-sm text-[var(--text-light)] font-semibold">Your Target Exam</p>

    <select
      value={selectedExam}
      onChange={(e) => setSelectedExam(e.target.value)}
      className="px-5 py-3 rounded-xl bg-[var(--primary-light)] border border-[var(--border-light)] 
                 text-[var(--primary)] font-bold text-lg shadow-sm outline-none cursor-pointer"
    >
      <option value="JEE_MAINS">JEE Mains 2026</option>
      <option value="JEE_ADVANCED">JEE Advanced 2026</option>
      <option value="NEET">NEET 2026</option>
      <option value="BITSAT">BITSAT 2026</option>
    </select>
  </div>

  {/* Right: Countdown */}
  <div className="text-right space-y-1">
    <p className="text-sm text-[var(--text-light)] font-semibold">Days Remaining</p>
    <p className="text-[54px] font-black text-[var(--primary)] leading-none">{Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000*60*60*24))}</p>
    <p className="text-[var(--text-medium)] text-sm font-medium">Stay consistent. You got this 🚀</p>
  </div>
</div>



{/* ---------------------------------------------------
     OVERVIEW ROW (4 CARDS SIMILAR TO DASHBOARD STYLE)
---------------------------------------------------- */}

<div className="grid grid-cols-1 md:grid-cols-4 gap-6">

  {/* Today's Progress */}
  <div className="j-card">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-[#E6EEFF]">
          <Target className="text-[var(--primary)]" size={22} />
        </div>
        <p className="text-[var(--text-medium)] font-semibold text-sm">Today's Progress</p>
      </div>
      <Badge className="bg-[#013062] text-white px-2 py-1">{stats.todayProgress}%</Badge>
    </div>

    <div className="j-progress-bg">
      <div className="j-progress-fill" style={{ width: `${stats.todayProgress}%` }} />
    </div>
  </div>

  {/* Study Streak */}
  <div className="j-card">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-[#FFEED9]">
          <Flame className="text-[#FF6A00]" size={22} />
        </div>
        <p className="text-[var(--text-medium)] font-semibold text-sm">Study Streak</p>
      </div>
      <Badge className="bg-[#FF6A00] text-white px-2 py-1">{stats.weeklyStreak} days</Badge>
    </div>
  </div>

  {/* Study Time */}
  <div className="j-card">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-[#E5F6FF]">
          <Clock className="text-[#0090C5]" size={22} />
        </div>
        <p className="text-[var(--text-medium)] font-semibold text-sm">Study Time Today</p>
      </div>
      <Badge className="bg-[#0090C5] text-white px-2 py-1">{stats.totalStudyTime}h</Badge>
    </div>
  </div>

  {/* Daily Hour Target */}
  <div className="j-card">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-[#E2FFE8]">
          <Zap className="text-[#29A746]" size={22} />
        </div>
        <p className="text-[var(--text-medium)] font-semibold text-sm">Daily Target</p>
      </div>
      <Badge className="bg-[#29A746] text-white px-2 py-1">{stats.targetHours}h</Badge>
    </div>
  </div>

</div>
{/* ---------------------------------------------------
     PART 3 — PERFORMANCE OVERVIEW (4 CARDS)
---------------------------------------------------- */}

<div className="grid grid-cols-1 md:grid-cols-4 gap-6">

  {/* Overall Accuracy */}
  <div className="j-card">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-[#E6EEFF]">
          <Target className="text-[var(--primary)]" size={24} />
        </div>
        <p className="text-[var(--text-medium)] font-semibold text-sm">
          Accuracy
        </p>
      </div>

      <Badge className="bg-[#013062] text-white text-lg px-3 py-1">
        {Math.round((correctAnswers / Math.max(totalAttempts, 1)) * 100)}%
      </Badge>
    </div>

    <p className="text-4xl font-extrabold text-[var(--primary)]">
      {correctAnswers}
    </p>
    <p className="j-sub mt-1">Correct out of {totalAttempts}</p>

    <div className="j-progress-bg mt-4">
      <div
        className="j-progress-fill"
        style={{
          width: `${Math.round(
            (correctAnswers / Math.max(totalAttempts, 1)) * 100
          )}%`,
        }}
      />
    </div>
  </div>



  {/* Subjects Analyzed */}
  <div className="j-card">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-[#EAF6FF]">
          <BookOpen className="text-[#0084D1]" size={24} />
        </div>
        <p className="text-[var(--text-medium)] font-semibold text-sm">
          Subjects Analyzed
        </p>
      </div>

      <Badge className="bg-[#0084D1] text-white text-lg px-3 py-1">
        {subjectAnalysis.length}
      </Badge>
    </div>

    <p className="text-4xl font-extrabold text-[#0084D1]">
      {subjectAnalysis.length}
    </p>
    <p className="j-sub mt-1">Based on attempt data</p>
  </div>



  {/* Weak Topics */}
  <div className="j-card">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-[#FFE8E2]">
          <AlertTriangle className="text-[#E63900]" size={24} />
        </div>
        <p className="text-[var(--text-medium)] font-semibold text-sm">
          Weak Topics
        </p>
      </div>

      <Badge className="bg-[#E63900] text-white text-lg px-3 py-1">
        {topicAnalysis.length}
      </Badge>
    </div>

    <p className="text-4xl font-extrabold text-[#E63900]">
      {topicAnalysis.length}
    </p>
    <p className="j-sub mt-1">Needing improvement</p>
  </div>



  {/* Hours Slider (AI Recommendation) */}
  <div className="j-card">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-[#F5E6FF]">
          <Clock className="text-[#7B2CBF]" size={24} />
        </div>
        <p className="text-[var(--text-medium)] font-semibold text-sm">
          Daily Study Hours
        </p>
      </div>

      <Badge className="bg-[#7B2CBF] text-white text-lg px-3 py-1">
        AI: {aiRecommendedHours}h
      </Badge>
    </div>

    <p className="text-4xl font-extrabold text-[#7B2CBF]">
      {userHours}h
    </p>

    <input
      type="range"
      min={2}
      max={14}
      value={userHours}
      onChange={(e) => setUserHours(parseInt(e.target.value))}
      className="w-full mt-5 accent-[#7B2CBF]"
    />
  </div>

</div>
{/* ---------------------------------------------------
     PART 4 — BADGES SHOWCASE (CLEAN + PREMIUM)
---------------------------------------------------- */}

{badges.length > 0 && (
  <div className="j-card">
    <h2 className="j-section-title flex items-center gap-3">
      <Trophy className="text-[var(--primary)]" size={26} />
      Your Achievements
    </h2>

    <p className="j-sub mb-6">
      Keep collecting badges as you improve your accuracy and consistency.
    </p>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 pt-2">

      {badges.slice(0, 10).map((badge) => {
        const progress = Math.min(
          100,
          (userPoints / badge.points_required) * 100
        );

        return (
          <div
            key={badge.id}
            className="relative flex flex-col items-center text-center p-5 rounded-3xl border 
                       border-[var(--border-light)] shadow-sm bg-[var(--surface-soft)]"
          >
            {/* Icon */}
            <div
              className={`text-4xl mb-3 ${
                badge.earned ? "opacity-100" : "opacity-40"
              }`}
            >
              {badge.icon}
            </div>

            {/* Name */}
            <p
              className={`font-semibold ${
                badge.earned
                  ? "text-[var(--primary)]"
                  : "text-[var(--text-medium)]"
              }`}
            >
              {badge.name}
            </p>

            {/* Progress or Earned */}
            {!badge.earned ? (
              <>
                <div className="j-progress-bg w-full mt-3">
                  <div
                    className="j-progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] mt-1 text-[var(--text-light)]">
                  {badge.points_required} pts
                </p>

                {/* Lock overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/60 backdrop-blur-md rounded-3xl px-4 py-2">
                    <Award className="text-[var(--text-medium)]" size={18} />
                  </div>
                </div>
              </>
            ) : (
              <Badge className="mt-3 bg-[var(--primary)] text-white px-3 py-1 text-xs">
                Earned
              </Badge>
            )}
          </div>
        );
      })}

    </div>
  </div>
)}
{/* ---------------------------------------------------
     PART 5 — AI RECOMMENDATIONS (TOPICS TO FOCUS)
---------------------------------------------------- */}

{recommendations.length > 0 && (
  <div className="j-card">
    <h2 className="j-section-title flex items-center gap-3">
      <Brain className="text-[var(--primary)]" size={26} />
      AI Recommendations
    </h2>
    <p className="j-sub mb-6">
      Based on your weak & medium accuracy topics. Improve these to boost your rank fast.
    </p>

    <div className="space-y-5">

      {recommendations.map((rec, idx) => {
        const isHigh = rec.priority === "high";
        const isMed = rec.priority === "medium";

        return (
          <div
            key={idx}
            className="p-5 rounded-3xl border border-[var(--border-light)] shadow-sm bg-[var(--surface-soft)]"
          >
            <div className="flex items-start justify-between">

              {/* Left side: Topic Details */}
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-3 mb-2">

                  {/* Priority Pill */}
                  <span
                    className={`j-pill ${
                      isHigh
                        ? "bg-[#FFE5E5] text-[#D62525]"
                        : isMed
                        ? "bg-[#FFF3D9] text-[#D68A00]"
                        : "bg-[#E2FFE8] text-[#29A746]"
                    }`}
                  >
                    {rec.priority.toUpperCase()}
                  </span>

                  <p className="text-xs text-[var(--text-light)]">
                    {rec.subject} • {rec.chapter}
                  </p>
                </div>

                <p className="font-bold text-[var(--primary)] text-lg mb-1">
                  {rec.topic}
                </p>

                <div className="flex items-center gap-5 text-[var(--text-medium)] text-sm mt-1">
                  <span className="flex items-center gap-1">
                    <Clock size={16} className="opacity-70" />
                    {rec.estimatedTime} mins
                  </span>

                  <span className="flex items-center gap-1">
                    <Target size={16} className="opacity-70" />
                    {rec.accuracy}% accuracy
                  </span>
                </div>

                <p
                  className={`mt-3 text-sm ${
                    isHigh
                      ? "text-[#D62525]"
                      : isMed
                      ? "text-[#D68A00]"
                      : "text-[#29A746]"
                  } flex items-center gap-1`}
                >
                  {isHigh ? <AlertTriangle size={16} /> : <TrendingUp size={16} />}
                  {rec.reason}
                </p>
              </div>

              {/* Right side: CTA Button */}
              <Button
                onClick={() => (window.location.href = "/study-now")}
                className="bg-[var(--primary)] hover:bg-[#00294F] text-white px-5 py-2 rounded-xl font-semibold"
              >
                Practice
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        );
      })}

    </div>
  </div>
)}
{/* ---------------------------------------------------
     PART 6 — RANK PREDICTOR (JEEnius Style)
---------------------------------------------------- */}

{predictedRank && predictedRank.totalAttempts >= 10 && (
  <div className="j-card bg-[#FFF8E5] border-[#FFE4A8]">
    <div className="flex items-center gap-6">
      <Trophy size={60} className="text-[#D99800]" />
      <div className="flex-1">
        <p className="text-sm text-[#B88600] font-semibold mb-1">Predicted JEE Rank</p>
        <p className="text-5xl font-black text-[#A66900]">#{predictedRank.rank.toLocaleString()}</p>
        <p className="text-sm text-[#8C6A19] mt-1">
          Based on projected score: <b>{predictedRank.score}%</b> • Confidence: 
          <span className="font-bold ml-1">{predictedRank.confidence}</span>
        </p>
        <p className="text-xs text-[#8C6A19] mt-1">
          From {predictedRank.totalAttempts} attempts
        </p>
      </div>
    </div>
  </div>
)}

{(!predictedRank || predictedRank.totalAttempts < 10) && totalAttempts > 0 && (
  <div className="j-card bg-[#EAF3FF] border-[#C7DFFF]">
    <div className="flex items-center gap-6">
      <BarChart3 size={50} className="text-[#1A64C7]" />
      <div>
        <p className="text-xl font-bold text-[#1A64C7]">Rank Predictor Loading...</p>
        <p className="text-sm text-[#3C6EA8] mt-1">
          Solve <b>{10 - totalAttempts}</b> more questions for accurate prediction.
        </p>
      </div>
    </div>
  </div>
)}
{/* ---------------------------------------------------
     PART 7 — STRENGTHS & WEAKNESSES
---------------------------------------------------- */}

{strengthsWeaknesses && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    {/* Strengths */}
    <div className="j-card bg-[#E8FFF0] border-[#C8F5D6]">
      <h2 className="j-section-title flex items-center gap-2">
        <CheckCircle2 className="text-[#2BAA55]" size={22} />
        Your Strengths
      </h2>

      <div className="space-y-4 mt-4">
        {strengthsWeaknesses.strengths.map((str, i) => (
          <div key={i} className="p-4 bg-white rounded-xl border border-[#D9F5E5] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-[#2BAA55]">{str.subject}</p>
              <Badge className="bg-[#2BAA55] text-white">{str.accuracy}%</Badge>
            </div>
            <div className="j-progress-bg">
              <div className="j-progress-fill" style={{ width: `${str.accuracy}%` }} />
            </div>
            <p className="text-xs text-[#3A7F57] mt-2">{str.attempted} questions attempted</p>
          </div>
        ))}
      </div>
    </div>

    {/* Weaknesses */}
    <div className="j-card bg-[#FFF0F0] border-[#FFD7D7]">
      <h2 className="j-section-title flex items-center gap-2">
        <XCircle className="text-[#D62525]" size={22} />
        Priority Weaknesses
      </h2>

      <div className="space-y-4 mt-4">
        {strengthsWeaknesses.weaknesses.map((weak, i) => (
          <div key={i} className="p-4 bg-white rounded-xl border border-[#FFD1D1] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-[#D62525]">{weak.subject}</p>
              <Badge className="bg-[#D62525] text-white">{weak.accuracy}%</Badge>
            </div>
            <div className="j-progress-bg">
              <div className="j-progress-fill" style={{ width: `${weak.accuracy}%` }} />
            </div>
            <p className="text-xs text-[#A63F3F] mt-2">Needs Immediate Attention</p>
          </div>
        ))}
      </div>
    </div>

  </div>
)}
{/* ---------------------------------------------------
     PART 8 — AI DAILY STUDY PLAN
---------------------------------------------------- */}

{studyPlan.length > 0 && (
  <div className="j-card">
    <h2 className="j-section-title flex items-center gap-2">
      <Brain className="text-[var(--primary)]" size={22} />
      Daily Study Plan (AI Generated)
    </h2>
    <p className="j-sub mb-6">{totalAttempts} attempts analyzed • {Math.round(correctAnswers/Math.max(totalAttempts,1)*100)}% accuracy</p>

    <div className="space-y-5">
      {studyPlan.map((p, i) => (
        <div key={i} className="p-5 bg-[var(--surface-soft)] border border-[var(--border-light)] rounded-3xl shadow-sm">
          <div className="flex justify-between items-start">

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <p className="text-xl font-bold text-[var(--primary)]">{p.subject}</p>
                <Badge className="bg-[var(--primary)] text-white">{p.priority}</Badge>
              </div>
              <p className="j-sub mb-2">{p.strategy}</p>

              <div className="flex gap-5 text-sm text-[var(--text-medium)]">
                <span className="flex items-center gap-1"><Target size={16} />{p.accuracy}% accuracy</span>
                <span className="flex items-center gap-1"><Clock size={16} />{p.attempted} solved</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-5xl font-black text-[var(--primary)]">{p.recommendedTime}h</p>
              <p className="j-sub text-right">per day</p>
            </div>

          </div>
        </div>
      ))}
    </div>

    <Button
      onClick={() => (window.location.href = "/study-now")}
      className="w-full mt-6 bg-[var(--primary)] hover:bg-[#002A55] text-white py-4 rounded-xl text-lg font-bold"
    >
      Start Studying
    </Button>
  </div>
)}
{/* ---------------------------------------------------
     PART 9 — WEEKLY PERFORMANCE TREND
---------------------------------------------------- */}

{weeklyTrend.length > 0 && (
  <div className="j-card">
    <h2 className="j-section-title flex items-center gap-2">
      <TrendingUp className="text-[var(--primary)]" size={22} />
      7-Day Performance Trend
    </h2>

    <div className="grid grid-cols-7 gap-4 mt-4">
      {weeklyTrend.map((d, i) => (
        <div
          key={i}
          className={`p-4 rounded-2xl text-center border shadow-sm ${
            d.questions === 0
              ? "bg-[#F3F6FB] border-[#D5DBE7]"
              : d.accuracy >= 70
              ? "bg-[#E8FFF0] border-[#CCF5DD]"
              : d.accuracy >= 50
              ? "bg-[#FFF7DB] border-[#FFE9AC]"
              : "bg-[#FFECEC] border-[#FFD1D1]"
          }`}
        >
          <p className="text-xs text-[var(--text-light)] mb-1">{d.day}</p>
          <p className="text-2xl font-bold text-[var(--primary)]">{d.questions}</p>
          <p className="text-xs text-[var(--text-light)]">questions</p>
          {d.questions > 0 && (
            <Badge
              className={`mt-2 text-xs ${
                d.accuracy >= 70
                  ? "bg-[#29A746]"
                  : d.accuracy >= 50
                  ? "bg-[#C9A200]"
                  : "bg-[#D62525]"
              } text-white`}
            >
              {d.accuracy}%
            </Badge>
          )}
        </div>
      ))}
    </div>
  </div>
)}
{/* ---------------------------------------------------
     PART 10 — DETAILED BREAKDOWN
---------------------------------------------------- */}

<div className="j-card">
  <h2 className="j-section-title flex items-center gap-2">
    <BookOpen className="text-[var(--primary)]" size={22} />
    Detailed Performance Breakdown
  </h2>

  <div className="flex gap-3 my-5">
    <Button variant={expandedSection==="subjects"?"default":"outline"}
      onClick={()=>setExpandedSection("subjects")}
      className={`${expandedSection==="subjects"?"bg-[var(--primary)] text-white":"border-[var(--border-light)]"}`}>
      Subjects
    </Button>

    <Button variant={expandedSection==="chapters"?"default":"outline"}
      onClick={()=>setExpandedSection("chapters")}
      className={`${expandedSection==="chapters"?"bg-[var(--primary)] text-white":"border-[var(--border-light)]"}`}>
      Chapters
    </Button>

    <Button variant={expandedSection==="topics"?"default":"outline"}
      onClick={()=>setExpandedSection("topics")}
      className={`${expandedSection==="topics"?"bg-[var(--primary)] text-white":"border-[var(--border-light)]"}`}>
      Topics
    </Button>
  </div>

  {/* SUBJECTS */}
  {expandedSection === "subjects" && (
    <div className="space-y-4">
      {subjectAnalysis.map((s, i)=>(
        <div key={i} className="p-5 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border-light)] shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl font-bold text-[var(--primary)]">{s.subject}</p>
              <p className="j-sub">{s.attempted} attempts • avg {s.avgTime}s</p>
            </div>
            <Badge className="bg-[var(--primary)] text-white text-lg">{s.accuracy}%</Badge>
          </div>

          <div className="j-progress-bg mt-3">
            <div className="j-progress-fill" style={{width:`${s.accuracy}%`}} />
          </div>
        </div>
      ))}
    </div>
  )}

  {/* CHAPTERS */}
  {expandedSection === "chapters" && (
    <div className="space-y-4">
      {chapterAnalysis.map((c, i)=>(
        <div key={i} className="p-5 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border-light)] shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-bold text-[var(--primary)]">{c.chapter}</p>
              <p className="j-sub">{c.subject} • {c.total} attempts</p>
            </div>
            <Badge className="bg-[#D68A00] text-white text-lg">{c.accuracy}%</Badge>
          </div>

          <div className="j-progress-bg mt-3">
            <div className="j-progress-fill" style={{width:`${c.accuracy}%`}} />
          </div>
        </div>
      ))}
    </div>
  )}

  {/* TOPICS */}
  {expandedSection === "topics" && (
    <div className="space-y-4">
      {topicAnalysis.map((t, i)=>(
        <div key={i} className="p-4 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border-light)] shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <p className="font-bold text-[var(--primary)]">{t.topic}</p>
            <Badge className="bg-[#D62525] text-white">{t.accuracy}%</Badge>
          </div>
          <p className="j-sub text-xs mb-2">{t.subject} • {t.chapter} • {t.total} attempts</p>

          <div className="j-progress-bg">
            <div className="j-progress-fill" style={{width:`${t.accuracy}%`}} />
          </div>
        </div>
      ))}
    </div>
  )}
</div>
{/* ---------------------------------------------------
     PART 11 — STREAK + FINAL CTA + FOOTER
---------------------------------------------------- */}

{/* Streak */}
<div className="j-card bg-[#FFF4D6] border-[#FFE3A8]">
  <div className="flex items-center gap-6">
    <Flame size={60} className="text-[#FF8A00]" />
    <div>
      <p className="text-sm text-[#BF7A00] font-semibold">Current Streak</p>
      <p className="text-6xl font-black text-[#A66A00]">{currentStreak}</p>
      <p className="text-sm text-[#8C6A19] mt-2">
        {currentStreak >= 7 ? "🔥 Keep going!" : "📈 Build consistency!"}
      </p>
    </div>
  </div>
</div>

{/* ACTION BUTTON */}
<div className="j-card bg-[var(--primary)] text-white text-center">
  <Brain size={50} className="mx-auto mb-3" />
  <h2 className="text-2xl font-black mb-2">Your AI Study Partner is Ready</h2>
  <p className="text-white/80 text-sm mb-5">
    Keep solving questions to improve accuracy & predictions.
  </p>

  <div className="flex gap-4 justify-center">
    <Button onClick={()=>window.location.href="/study-now"} className="bg-white text-[var(--primary)] hover:bg-[#F2F6FF] font-bold px-6 py-3 rounded-xl">
      Continue Studying
    </Button>

    <Button onClick={()=>window.location.href="/test"} className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl">
      Take Mock Test
    </Button>
  </div>
</div>

{/* FOOTER */}
<div className="j-card text-left bg-[#F4F7FF] border-[#E6EEFF]">
  <div className="flex items-start gap-3">
    <Brain size={20} className="text-[var(--primary)] mt-1" />
    <div>
      <p className="font-bold text-[var(--primary)] mb-1">AI Intelligence Active</p>
      <p className="text-xs text-[var(--text-light)]">
        Analysis updates live as you practice. Predictions get more accurate with more data.
      </p>
    </div>
  </div>
</div>
