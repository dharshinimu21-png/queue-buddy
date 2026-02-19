
-- Create tokens table
CREATE TABLE public.tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'served', 'skipped')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  called_at TIMESTAMP WITH TIME ZONE,
  served_at TIMESTAMP WITH TIME ZONE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Create queue_status table (single row config)
CREATE TABLE public.queue_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  current_token INTEGER DEFAULT 0,
  last_token_issued INTEGER DEFAULT 0,
  avg_service_minutes INTEGER DEFAULT 5,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial queue status
INSERT INTO public.queue_status (current_token, last_token_issued, avg_service_minutes, session_date)
VALUES (0, 0, 5, CURRENT_DATE);

-- Create queue_history table
CREATE TABLE public.queue_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  token_number INTEGER,
  details TEXT,
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Enable RLS (public queue system - tokens visible to all, history visible to all)
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_history ENABLE ROW LEVEL SECURITY;

-- Tokens policies - public read, anyone can insert/admin can update
CREATE POLICY "Anyone can view tokens" ON public.tokens FOR SELECT USING (true);
CREATE POLICY "Anyone can generate token" ON public.tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update token status" ON public.tokens FOR UPDATE USING (true);

-- Queue status policies - public read
CREATE POLICY "Anyone can view queue status" ON public.queue_status FOR SELECT USING (true);
CREATE POLICY "Anyone can update queue status" ON public.queue_status FOR UPDATE USING (true);

-- Queue history policies - public read
CREATE POLICY "Anyone can view history" ON public.queue_history FOR SELECT USING (true);
CREATE POLICY "Anyone can insert history" ON public.queue_history FOR INSERT WITH CHECK (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.tokens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_status;
