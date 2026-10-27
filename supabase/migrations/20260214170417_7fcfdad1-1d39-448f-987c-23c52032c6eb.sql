
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Membership plans
CREATE TABLE public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  duration_days INT NOT NULL DEFAULT 30,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  payment_method TEXT DEFAULT 'card',
  membership_start DATE NOT NULL DEFAULT CURRENT_DATE,
  membership_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Attendance
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  check_in TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Auto-create profile and member role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.membership_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies

-- Profiles: users see own, admins see all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "System can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- User roles: admins can manage, users can read own
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert roles" ON public.user_roles FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Membership plans: everyone can read, admins can manage
CREATE POLICY "Anyone can view active plans" ON public.membership_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert plans" ON public.membership_plans FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update plans" ON public.membership_plans FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete plans" ON public.membership_plans FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Payments: users see own, admins see all
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Attendance: users see own, admins see all
CREATE POLICY "Users can view own attendance" ON public.attendance FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own attendance" ON public.attendance FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own attendance" ON public.attendance FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Notifications: users see own, admins can insert
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());
