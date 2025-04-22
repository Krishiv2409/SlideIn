-- Add unique constraint on user_id
ALTER TABLE public.gmail_tokens ADD CONSTRAINT gmail_tokens_user_id_key UNIQUE (user_id); 