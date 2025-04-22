-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own Gmail tokens" ON public.gmail_tokens;
DROP POLICY IF EXISTS "Users can insert their own Gmail tokens" ON public.gmail_tokens;
DROP POLICY IF EXISTS "Users can update their own Gmail tokens" ON public.gmail_tokens;
DROP POLICY IF EXISTS "Users can delete their own Gmail tokens" ON public.gmail_tokens;

-- Create new, more permissive policies
CREATE POLICY "Users can view their own Gmail tokens"
    ON public.gmail_tokens
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Gmail tokens"
    ON public.gmail_tokens
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Gmail tokens"
    ON public.gmail_tokens
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Gmail tokens"
    ON public.gmail_tokens
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant additional permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gmail_tokens TO authenticated;

-- Add a function to debug permissions
CREATE OR REPLACE FUNCTION debug_rls_check()
RETURNS TABLE (
    current_user_id TEXT,
    has_gmail_tokens BOOLEAN,
    permission_check TEXT
) LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        auth.uid()::TEXT,
        EXISTS(SELECT 1 FROM public.gmail_tokens WHERE user_id = auth.uid()) AS has_tokens,
        CASE
            WHEN EXISTS(SELECT 1 FROM public.gmail_tokens WHERE user_id = auth.uid()) 
            THEN 'User has gmail_tokens'
            ELSE 'User has no gmail_tokens'
        END AS permission_check;
END;
$$; 