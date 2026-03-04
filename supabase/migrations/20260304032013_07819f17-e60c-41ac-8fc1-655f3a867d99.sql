
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('student', 'organizer');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  role app_role NOT NULL DEFAULT 'student',
  current_year INTEGER,
  current_semester INTEGER,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Modules table
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_code TEXT UNIQUE NOT NULL,
  module_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view modules" ON public.modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Organizers can manage modules" ON public.modules FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'organizer')
);

-- Student modules junction
CREATE TABLE public.student_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  enrolled_semester TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, module_id)
);
ALTER TABLE public.student_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view own enrollments" ON public.student_modules FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Organizers can manage enrollments" ON public.student_modules FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'organizer')
);

-- Kuppi notices
CREATE TABLE public.kuppi_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  description TEXT,
  google_form_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kuppi_notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view notices" ON public.kuppi_notices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Organizers can create notices" ON public.kuppi_notices FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'organizer')
);
CREATE POLICY "Organizers can update own notices" ON public.kuppi_notices FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Organizers can delete own notices" ON public.kuppi_notices FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Kuppi registrations
CREATE TABLE public.kuppi_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id UUID NOT NULL REFERENCES public.kuppi_notices(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kuppi_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Organizers can view registrations" ON public.kuppi_registrations FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'organizer')
);
CREATE POLICY "Students can register" ON public.kuppi_registrations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Students can view own registrations" ON public.kuppi_registrations FOR SELECT TO authenticated USING (student_id = auth.uid());

-- Kuppi sessions
CREATE TABLE public.kuppi_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id UUID NOT NULL REFERENCES public.kuppi_notices(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_time TEXT NOT NULL,
  platform TEXT NOT NULL,
  meeting_link TEXT NOT NULL,
  covered_parts TEXT,
  organizer_id UUID NOT NULL REFERENCES public.profiles(id),
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kuppi_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view sessions" ON public.kuppi_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Organizers can manage sessions" ON public.kuppi_sessions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'organizer')
);

-- Kuppi recordings
CREATE TABLE public.kuppi_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.kuppi_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kuppi_recordings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view recordings" ON public.kuppi_recordings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Organizers can manage recordings" ON public.kuppi_recordings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'organizer')
);

-- Kuppi feedback
CREATE TABLE public.kuppi_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.kuppi_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  comment TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, student_id)
);
ALTER TABLE public.kuppi_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can create feedback" ON public.kuppi_feedback FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can view own feedback" ON public.kuppi_feedback FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Organizers can view all feedback" ON public.kuppi_feedback FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'organizer')
);

-- Indexes
CREATE INDEX idx_student_modules_student ON public.student_modules(student_id);
CREATE INDEX idx_student_modules_module ON public.student_modules(module_id);
CREATE INDEX idx_kuppi_notices_module ON public.kuppi_notices(module_id);
CREATE INDEX idx_kuppi_notices_created_by ON public.kuppi_notices(created_by);
CREATE INDEX idx_kuppi_sessions_notice ON public.kuppi_sessions(notice_id);
CREATE INDEX idx_kuppi_recordings_session ON public.kuppi_recordings(session_id);
CREATE INDEX idx_kuppi_feedback_session ON public.kuppi_feedback(session_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('recordings', 'recordings', true);
CREATE POLICY "Authenticated can view recordings files" ON storage.objects FOR SELECT USING (bucket_id = 'recordings');
CREATE POLICY "Organizers can upload recordings" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'recordings' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'organizer')
);
