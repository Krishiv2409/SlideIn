# Email Tracking System Deployment Guide

This guide walks you through the steps to deploy the email open tracking system for your SlideIn application.

## Prerequisites

Before you begin, make sure you have:

1. A Supabase account and project set up
2. The Supabase CLI installed on your machine
3. Docker installed (required for local Supabase development)

## Steps to Deploy the Email Tracking System

### 1. Link Your Local Project to Supabase

```bash
# Login to Supabase CLI
supabase login

# Link your local project to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# You can find your project reference ID in the URL of your Supabase dashboard:
# https://app.supabase.com/project/YOUR_PROJECT_REF
```

### 2. Apply Database Migrations

Apply the database migration to create the `email_events` table:

```bash
# Apply the migration
supabase db push
```

This will create the `email_events` table and the `increment_open_count` function in your Supabase database.

### 3. Set Environment Variables for the Edge Function

Set the required environment variables for the Supabase Edge Function:

```bash
# Set the environment variables
supabase secrets set MY_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
supabase secrets set MY_SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

You can find these values in your Supabase dashboard under Project Settings > API.

### 4. Deploy the Edge Function

Deploy the `tracker` edge function to your Supabase project:

```bash
# Deploy the edge function
supabase functions deploy tracker
```

The tracker function will be available at: `https://YOUR_PROJECT_REF.functions.supabase.co/tracker`

### 5. Test the Tracking Pixel

1. Create a new record in the `email_events` table:

```sql
INSERT INTO public.email_events 
(email_id, recipient_email, subject) 
VALUES 
(gen_random_uuid(), 'test@example.com', 'Test Subject');
```

2. Note the `email_id` value that was generated.

3. Test the tracking pixel by visiting:
```
https://YOUR_PROJECT_REF.functions.supabase.co/tracker?id=THE_EMAIL_ID
```

4. Check the `email_events` table to verify that the open count was incremented.

## Using the Tracking Pixel in Your Emails

To track email opens, include this HTML in your email templates:

```html
<img src="https://YOUR_PROJECT_REF.functions.supabase.co/tracker?id=EMAIL_ID" width="1" height="1" style="display:none;" alt="" />
```

Replace:
- `YOUR_PROJECT_REF` with your Supabase project reference
- `EMAIL_ID` with the UUID from the `email_id` column in the `email_events` table

## Troubleshooting

### Check Edge Function Logs

If the tracking pixel isn't working, check the logs for your edge function:

```bash
supabase functions logs tracker
```

### Check for CORS Issues

If you're experiencing CORS issues, the edge function already includes CORS headers to allow requests from any origin.

### Verify Environment Variables

Ensure that your environment variables are set correctly:

```bash
supabase secrets list
```

## Local Development

For local development, you can use a `.env.local` file:

```bash
# Create a .env.local file
echo "MY_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co" >> .env.local
echo "MY_SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY" >> .env.local

# Run the function locally
supabase functions serve tracker --env-file .env.local
```

## Monitoring and Analytics

You can view email tracking statistics in the SlideIn dashboard on the Inbox Tracker page. This page shows:

1. Total number of emails sent
2. Open rate percentage 
3. Number of recent opens
4. Detailed list of tracked emails with open counts

For more detailed analytics, you can query the `email_events` table directly in the Supabase dashboard. 