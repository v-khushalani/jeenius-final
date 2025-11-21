-- Database cleanup: Remove redundant tables and unused columns

-- Drop redundant tables
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.payment_orders CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.test_attempts CASCADE;

-- Remove unused columns from profiles
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS questions_capacity,
DROP COLUMN IF EXISTS student_level,
DROP COLUMN IF EXISTS subscription_plan,
DROP COLUMN IF EXISTS razorpay_subscription_id;

-- Add comment for clarity
COMMENT ON TABLE public.user_subscriptions IS 'Primary table for user subscriptions - replaces old subscriptions table';
COMMENT ON TABLE public.payments IS 'Primary table for payment tracking - replaces old payment_orders table';
COMMENT ON TABLE public.subscription_plans IS 'Primary table for subscription plan definitions - replaces old plans table';