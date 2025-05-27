-- Create index for faster lookups by user_id if it doesn't exist
CREATE INDEX IF NOT EXISTS email_events_user_id_idx ON public.email_events(user_id);

-- Make sure we have the email_id index
CREATE INDEX IF NOT EXISTS email_events_email_id_idx ON public.email_events(email_id); 