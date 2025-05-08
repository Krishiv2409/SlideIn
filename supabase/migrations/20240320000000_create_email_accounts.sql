-- Create email_accounts table
CREATE TABLE IF NOT EXISTS email_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook')),
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expiry_date BIGINT NOT NULL,
    display_name TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, email)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS email_accounts_user_id_idx ON email_accounts(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_email_accounts_updated_at
    BEFORE UPDATE ON email_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own email accounts
CREATE POLICY "Users can view their own email accounts"
    ON email_accounts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own email accounts
CREATE POLICY "Users can insert their own email accounts"
    ON email_accounts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own email accounts
CREATE POLICY "Users can update their own email accounts"
    ON email_accounts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own email accounts
CREATE POLICY "Users can delete their own email accounts"
    ON email_accounts
    FOR DELETE
    USING (auth.uid() = user_id); 