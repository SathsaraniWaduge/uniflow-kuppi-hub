ALTER TABLE public.kuppi_sessions
ADD COLUMN meeting_room_url text,
ADD COLUMN meeting_room_name text,
ADD COLUMN recording_status text DEFAULT 'none' CHECK (recording_status IN ('none', 'pending', 'ready', 'failed'));