
-- Fix the permissive insert policies
DROP POLICY "System can insert profiles" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

DROP POLICY "System can insert roles" ON public.user_roles;
CREATE POLICY "Users can insert own role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
