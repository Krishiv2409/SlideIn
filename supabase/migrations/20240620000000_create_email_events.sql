-- Create email_events table
CREATE TABLE IF NOT EXISTS public.email_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email_id UUID NOT NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'Sent',
    opens INTEGER DEFAULT 0,
    last_opened TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS email_events_email_id_idx ON email_events(email_id);
CREATE INDEX IF NOT EXISTS email_events_recipient_email_idx ON email_events(recipient_email);

-- Enable Row Level Security
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- Create RPC function to increment open count
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
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.email_events TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_open_count TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.email_events TO anon;
GRANT EXECUTE ON FUNCTION public.increment_open_count TO anon;

-- Add comment to table
COMMENT ON TABLE public.email_events IS 'Tracks email open events and status';
COMMENT ON FUNCTION public.increment_open_count IS 'Atomically increments the open count for an email'; 