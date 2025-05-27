-- Drop existing policies first to avoid errors
DROP POLICY IF EXISTS "Users can only view their own emails" ON public.email_events;
DROP POLICY IF EXISTS "Users can only insert their own emails" ON public.email_events;
DROP POLICY IF EXISTS "Users can only update their own emails" ON public.email_events;
DROP POLICY IF EXISTS "Service role can access all emails" ON public.email_events;

-- Create policy to restrict access to a user's own emails
CREATE POLICY "Users can only view their own emails" 
ON public.email_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own emails" 
ON public.email_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own emails" 
ON public.email_events 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add RLS bypass policy for the service role (used by Edge Functions)
CREATE POLICY "Service role can access all emails" 
ON public.email_events 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Update the increment_open_count function to work as security definer (bypasses RLS)
DROP FUNCTION IF EXISTS public.increment_open_count;
CREATE OR REPLACE FUNCTION public.increment_open_count(p_email_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.email_events
    SET 
        opens = opens + 1,
        last_opened = timezone('utc'::text, now()),
        status = CASE WHEN status != 'Opened' THEN 'Opened' ELSE status END
    WHERE email_id = p_email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to get current user emails
CREATE OR REPLACE FUNCTION public.get_current_user_email_events()
RETURNS SETOF public.email_events AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.email_events 
  WHERE user_id = auth.uid()
  ORDER BY sent_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 