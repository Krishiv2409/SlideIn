-- Rename the table back to gmail_tokens
ALTER TABLE public.gmail_connections RENAME TO gmail_tokens;

-- Rename the index
ALTER INDEX public.gmail_connections_user_id_idx RENAME TO gmail_tokens_user_id_idx;

-- Update the table comment
COMMENT ON TABLE public.gmail_tokens IS 'Stores Gmail OAuth tokens for users'; 