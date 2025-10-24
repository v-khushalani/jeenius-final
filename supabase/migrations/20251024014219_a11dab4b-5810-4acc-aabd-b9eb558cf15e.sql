-- Add limit_value and limit_type to free_content_limits
alter table public.free_content_limits
add column if not exists limit_type text,
add column if not exists limit_value integer;