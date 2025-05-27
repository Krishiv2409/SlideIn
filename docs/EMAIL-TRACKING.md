# Email Tracking System for SlideIn

This document explains how to use the email open tracking system built with Supabase Edge Functions.

## Overview

The email tracking system works as follows:

1. You create an entry in the `email_events` table before sending an email
2. You include a 1x1 tracking pixel in your email HTML that points to the Supabase Edge Function
3. When the recipient opens the email, the pixel loads, triggering the Edge Function
4. The Edge Function updates the corresponding row in the `email_events` table

## Setup Instructions

### 1. Deploy the Supabase Edge Function

```bash
# Navigate to your project directory
cd your-slidein-project

# Deploy the Edge Function
supabase functions deploy tracker
```

### 2. Apply the Database Migration

```bash
# Apply the migration to create the email_events table
supabase migration up
```

### 3. Set Required Environment Variables

Make sure the following environment variables are set for your Edge Function:

```bash
supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Usage

### Creating an Email Event

Before sending an email, create an entry in the `email_events` table:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Generate a UUID for the email (or use a library like uuid)
const emailId = crypto.randomUUID()

// Create record in email_events table
const { data, error } = await supabase
  .from('email_events')
  .insert([
    { 
      email_id: emailId,
      recipient_email: 'recipient@example.com',
      subject: 'Your Email Subject'
    }
  ])
```

### Adding the Tracking Pixel to Your Email

Insert this HTML at the end of your email body:

```html
<img src="https://your-project-ref.functions.supabase.co/tracker?id=YOUR_EMAIL_ID" width="1" height="1" style="display:none;" alt="" />
```

Replace:
- `your-project-ref` with your Supabase project reference
- `YOUR_EMAIL_ID` with the UUID you generated earlier

### Example with Resend Email Service

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Send email with tracking pixel
await resend.emails.send({
  from: 'you@example.com',
  to: 'recipient@example.com',
  subject: 'Your Subject',
  html: `
    <p>Your email content here...</p>
    
    <!-- Tracking pixel -->
    <img src="https://your-project-ref.functions.supabase.co/tracker?id=${emailId}" width="1" height="1" style="display:none;" alt="" />
  `
})
```

## Querying Email Open Data

You can query the email events table to see which emails have been opened:

```typescript
// Get all opened emails
const { data, error } = await supabase
  .from('email_events')
  .select('*')
  .eq('status', 'Opened')

// Get open rate statistics
const { data: stats, error: statsError } = await supabase
  .from('email_events')
  .select('status, count(*)')
  .group('status')
```

## Troubleshooting

### Email Opens Not Being Tracked

1. **Image Blocking**: Many email clients block images by default. Users need to allow images to be displayed.
2. **Function Errors**: Check the Supabase Edge Function logs for any errors.
3. **CORS Issues**: Make sure the function allows cross-origin requests.
4. **Invalid Email ID**: Ensure the UUID being passed exists in the database.

### Testing the Tracking Pixel

You can test the tracking pixel by visiting the URL directly in your browser:

```
https://your-project-ref.functions.supabase.co/tracker?id=YOUR_EMAIL_ID
```

After visiting, check the `email_events` table to see if the open count increased.

## Privacy Considerations

- Be transparent with users about email tracking
- Include information about tracking in your privacy policy
- Consider providing an opt-out mechanism for users who don't want to be tracked

## Security Considerations

- The Edge Function uses a service role key which bypasses RLS policies
- Ensure your Supabase service role key is kept secure
- Consider implementing additional validation in the Edge Function if needed 