-- Create app_settings table for application configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add index for faster key lookups
CREATE INDEX IF NOT EXISTS app_settings_key_idx ON public.app_settings(key);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_app_settings_updated_at();

-- Add RLS policies
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read app settings
CREATE POLICY "Authenticated users can read app settings"
    ON public.app_settings
    FOR SELECT
    TO authenticated;

-- Policy to allow service role to manage app settings
CREATE POLICY "Service role can manage app settings"
    ON public.app_settings
    USING (auth.jwt() ? 'service_role');

-- Insert Google OAuth credentials (initially empty, to be updated via admin UI)
INSERT INTO public.app_settings (key, value)
VALUES ('google_oauth_credentials', '{"client_id":"", "client_secret":""}')
ON CONFLICT (key) DO NOTHING;

-- Grant access to authenticated users
GRANT SELECT ON public.app_settings TO authenticated;
GRANT SELECT ON public.app_settings TO anon; 