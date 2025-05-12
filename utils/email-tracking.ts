import { createClient } from '@supabase/supabase-js'

/**
 * Creates an email event record in the database before sending an email
 * 
 * @param recipientEmail The email address of the recipient
 * @param subject The subject of the email
 * @returns The email_id to use in the tracking pixel and the tracking pixel HTML
 */
export async function createEmailTrackingEvent(
  recipientEmail: string, 
  subject: string
): Promise<{ 
  emailId: string, 
  trackingPixelHtml: string 
}> {
  console.log('createEmailTrackingEvent called with:', { recipientEmail, subject });
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Initialize userId as null (for anonymous tracking)
    let userId = null;
    
    // If there's no auth error and we have a user, use their ID
    if (!authError && user) {
      console.log('User found:', user.id);
      userId = user.id;
      
      // Ensure this user exists in the public.users table
      const { data: publicUser, error: publicUserError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (publicUserError || !publicUser) {
        console.log('Syncing auth user to public users table for email tracking');
        // Insert user into public.users table if they don't exist there
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            provider: 'auth',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error syncing user to public users table:', insertError);
        }
      }
    } else {
      // Handle auth errors by falling back to anonymous tracking
      if (authError) {
        console.log('Auth error getting user, continuing with anonymous tracking:', authError.message);
      } else {
        console.log('No authenticated user found. Creating anonymous tracking event.');
      }
    }

    // Generate a UUID for the email
    const emailId = crypto.randomUUID()
    console.log('Generated email ID:', emailId);

    // Get current timestamp for sent_at
    const now = new Date().toISOString();

    // Create record in email_events table
    const record = { 
      email_id: emailId,
      recipient_email: recipientEmail,
      subject: subject,
      status: 'Sent',
      sent_at: now,
      // Start with 0 opens
      opens: 0
    };
    
    // Only add the user_id field if there is a logged-in user
    if (userId) {
      Object.assign(record, { user_id: userId });
    }
    
    console.log('Inserting record into email_events:', record);
    
    const { data, error } = await supabase
      .from('email_events')
      .insert([record])
      .select()

    if (error) {
      console.error('Error creating email tracking event:', error)
      throw error
    }
    
    console.log('Insert successful, returned data:', data);

    // Generate the tracking pixel HTML using edge function approach
    const edgeFunctionUrl = `https://ozzijihomyzoxodqpcin.functions.supabase.co/tracker?id=${emailId}`
    console.log('Edge function URL for tracking pixel:', edgeFunctionUrl);
    
    // Add cache-busting parameter and random UUID to prevent Gmail from caching
    const cacheBustParam = `&t=${Date.now()}&r=${crypto.randomUUID()}`
    
    // Create the tracking pixel HTML
    const trackingPixelHtml = `
<!-- Email tracking pixel (transparent 1x1 image) -->
<img src="${edgeFunctionUrl}${cacheBustParam}" width="1" height="1" alt="" style="display:block; position:absolute; left:-9999px; top:-9999px;" />

<!-- Tracking ID: ${emailId} -->
`
    console.log('Generated tracking pixel HTML:', trackingPixelHtml);

    return {
      emailId,
      trackingPixelHtml
    }
  } catch (error) {
    console.error('Error in createEmailTrackingEvent:', error);
    throw error;
  }
}

/**
 * Returns tracking statistics for emails
 */
export async function getEmailTrackingStats() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get basic statistics - will now only include current user's emails due to RLS
  const { data: totalSent } = await supabase
    .from('email_events')
    .select('count')
    .eq('status', 'Sent')
    .single()

  const { data: opened } = await supabase
    .from('email_events')
    .select('count')
    .eq('status', 'Opened')
    .single()

  const openRate = totalSent?.count ? (opened?.count || 0) / totalSent.count : 0

  // Get recent opens - only show emails with positive opens (real human opens)
  // This ensures false positives don't appear in the reporting
  const { data: recentOpens } = await supabase
    .from('email_events')
    .select('*')
    .eq('status', 'Opened')
    .gt('opens', 0) // Only emails with positive opens (real human opens)
    .order('last_opened', { ascending: false })
    .limit(10)

  return {
    totalSent: totalSent?.count || 0,
    opened: opened?.count || 0,
    openRate,
    recentOpens
  }
}

/**
 * Adds a tracking pixel to an HTML email body
 */
export function addTrackingPixelToEmail(htmlBody: string, trackingPixelHtml: string): string {
  console.log('Adding tracking pixel to email');
  
  // For Gmail compatibility, we need to insert the tracking pixel near the top of the email
  // This is because Gmail clips messages at 102KB and may not load the pixel if at the end
  
  // Insert after opening body tag if it exists
  if (htmlBody.includes('<body')) {
    console.log('Email has body tag, inserting after <body>');
    // Find where the body tag ends with >
    const bodyTagEnd = htmlBody.indexOf('>', htmlBody.indexOf('<body')) + 1;
    return htmlBody.slice(0, bodyTagEnd) + trackingPixelHtml + htmlBody.slice(bodyTagEnd);
  }
  
  // If no body tag, try to insert after html tag
  if (htmlBody.includes('<html')) {
    console.log('Email has html tag, inserting after <html>');
    const htmlTagEnd = htmlBody.indexOf('>', htmlBody.indexOf('<html')) + 1;
    return htmlBody.slice(0, htmlTagEnd) + trackingPixelHtml + htmlBody.slice(htmlTagEnd);
  }
  
  // If no html tag, insert at the beginning of the email
  console.log('Email has no body or html tag, inserting at the beginning');
  return trackingPixelHtml + htmlBody;
} 