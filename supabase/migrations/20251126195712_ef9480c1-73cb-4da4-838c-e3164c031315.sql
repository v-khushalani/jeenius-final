-- Add user as admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('63ce5fdb-a21d-454b-97a2-3fa620023751', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;