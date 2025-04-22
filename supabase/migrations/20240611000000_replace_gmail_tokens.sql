-- Drop the old table and all its dependencies
DROP TABLE IF EXISTS public.gmail_tokens CASCADE;

-- Create the new table
CREATE TABLE public.gmail_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- No RLS - open access
ALTER TABLE public.gmail_connections DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to authenticated users
GRANT ALL ON public.gmail_connections TO authenticated;
GRANT ALL ON public.gmail_connections TO anon;

-- Index for faster lookups
CREATE INDEX gmail_connections_user_id_idx ON public.gmail_connections(user_id);

-- Add comment to table
COMMENT ON TABLE public.gmail_connections IS 'Stores Gmail OAuth tokens for users'; 