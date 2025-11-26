-- Fresh start: Delete all user data but keep system data (chapters, topics, questions, badges, configs)

-- Delete user-related data in correct order (respecting foreign keys)
DELETE FROM public.user_notifications;
DELETE FROM public.user_challenge_progress;
DELETE FROM public.user_badges;
DELETE FROM public.user_rewards;
DELETE FROM public.user_subscriptions;
DELETE FROM public.user_content_access;
DELETE FROM public.user_energy_logs;
DELETE FROM public.user_rankings;
DELETE FROM public.user_levels;
DELETE FROM public.user_roles WHERE role != 'admin'; -- Keep admin roles

-- Delete activity/progress data
DELETE FROM public.question_attempts;
DELETE FROM public.test_sessions;
DELETE FROM public.points_log;
DELETE FROM public.daily_progress;
DELETE FROM public.daily_progress_log;
DELETE FROM public.daily_usage;
DELETE FROM public.daily_performance;
DELETE FROM public.daily_challenges;

-- Delete study planner data
DELETE FROM public.study_plans;
DELETE FROM public.study_schedule;
DELETE FROM public.study_plan_metadata;
DELETE FROM public.revision_queue;
DELETE FROM public.revision_schedule;

-- Delete analytics/tracking data
DELETE FROM public.topic_mastery;
DELETE FROM public.topic_priorities;
DELETE FROM public.weakness_analysis;
DELETE FROM public.performance_patterns;
DELETE FROM public.mock_test_schedule;

-- Delete AI usage data
DELETE FROM public.ai_rate_limits;
DELETE FROM public.ai_usage_log;

-- Delete conversion/referral data
DELETE FROM public.conversion_prompts;
DELETE FROM public.referrals;

-- Delete payments (fresh start)
DELETE FROM public.payments;

-- Delete extracted questions queue (admin can re-extract)
DELETE FROM public.extracted_questions_queue;

-- Delete admin notifications (fresh start)
DELETE FROM public.admin_notifications;

-- Finally delete profiles (this removes all user accounts)
DELETE FROM public.profiles;

-- Reset sequences if any (optional but clean)
-- Tables we're keeping: chapters, topics, questions, badges, subscription_plans, exam_config, free_content_limits, syllabus_master, topic_dependencies