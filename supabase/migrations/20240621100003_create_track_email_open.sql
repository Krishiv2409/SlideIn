-- Create a function to track email opens via REST API
-- This function is called directly via the tracking pixel
CREATE OR REPLACE FUNCTION public.track_email_open(p_email_id UUID)
RETURNS SETOF VOID AS $$
BEGIN
  -- Update the email_events table to mark as opened
  UPDATE public.email_events
  SET 
    status = 'Opened',
    opens = opens + 1,
    last_opened = timezone('utc'::text, now())
  WHERE email_id = p_email_id;
  
  -- Log the tracking event for debugging
  INSERT INTO public.email_events_logs(
    email_id, 
    event_type, 
    client_info,
    created_at
  ) VALUES (
    p_email_id,
    'pixel_loaded',
    'REST API call',
    timezone('utc'::text, now())
  ) ON CONFLICT DO NOTHING;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to the anonymous role
GRANT EXECUTE ON FUNCTION public.track_email_open TO anon;

-- Create email_events_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_events_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID REFERENCES public.email_events(email_id),
  event_type TEXT NOT NULL,
  client_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on logs table
ALTER TABLE public.email_events_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to access all logs
CREATE POLICY "Service role can access all logs" 
ON public.email_events_logs 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role'); 