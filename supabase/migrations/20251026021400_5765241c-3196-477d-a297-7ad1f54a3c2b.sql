-- Fix remaining RLS security issues

-- Enable RLS on g_n table
ALTER TABLE public.g_n ENABLE ROW LEVEL SECURITY;

-- Enable RLS on schema_questions table  
ALTER TABLE public.schema_questions ENABLE ROW LEVEL SECURITY;