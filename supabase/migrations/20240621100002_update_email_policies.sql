-- Drop existing policies first
DROP POLICY IF EXISTS "Users can only view their own emails" ON public.email_events;
DROP POLICY IF EXISTS "Users can only insert their own emails" ON public.email_events;
DROP POLICY IF EXISTS "Users can only update their own emails" ON public.email_events;
DROP POLICY IF EXISTS "Service role can access all emails" ON public.email_events;

-- Make user_id nullable to allow anonymous tracking
ALTER TABLE public.email_events
ALTER COLUMN user_id DROP NOT NULL;

-- Create policies that handle both authenticated and anonymous cases
CREATE POLICY "Users can view own emails or anonymous emails" 
ON public.email_events 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own emails or anonymous emails" 
ON public.email_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own emails or anonymous emails" 
ON public.email_events 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Add RLS bypass policy for the service role (used by Edge Functions)
CREATE POLICY "Service role can access all emails" 
ON public.email_events 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role'); 