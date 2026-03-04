
-- Fix permissive registration policy
DROP POLICY "Students can register" ON public.kuppi_registrations;
CREATE POLICY "Students can register" ON public.kuppi_registrations FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
