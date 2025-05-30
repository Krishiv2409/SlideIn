import { createClient } from '@supabase/supabase-js'

/**
 * Creates an email event record in the database before sending an email
 * 
 * @param recipientEmail The email address of the recipient
 * @param subject The subject of the email
 * @param userId Optional user ID to associate with the tracking event
 * @returns The email_id to use in the tracking pixel and the tracking pixel HTML
 */
export async function createEmailTrackingEvent(
  recipientEmail: string, 
  subject: string,
  userId?: string
): Promise<{ 
  emailId: string, 
  trackingPixelHtml: string 
}> {
  console.log('createEmailTrackingEvent called with:', { recipientEmail, subject, hasUserId: !!userId });
  
  // Check if we have the service role key
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY - required for email tracking');
    throw new Error('Server configuration error - missing required service role key');
  }
  
  // Use the service role key for admin access to bypass RLS
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  try {
    // If userId wasn't provided, try to get from auth as fallback
    if (!userId) {
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser();
      
      if (!authError && user) {
        console.log('User found from auth:', user.id);
        userId = user.id;
      } else {
        // Handle auth errors by falling back to anonymous tracking
        if (authError) {
          console.log('Auth error getting user, continuing with anonymous tracking:', authError.message);
        } else {
          console.log('No authenticated user found. Creating anonymous tracking event.');
        }
      }
    } else {
      console.log('Using provided userId:', userId);
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
      opens: 0,
      // Always include user_id, even if null
      user_id: userId
    };
    
    console.log('Inserting record into email_events:', record);
    
    const { data, error } = await supabaseAdmin
      .from('email_events')
      .insert([record])
      .select()

    if (error) {
      console.error('Error creating email tracking event:', error)
      throw error
    }
    
    console.log('Insert successful, returned data:', data);

    // Generate the tracking pixel HTML using edge function approach
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/(.*?)\.supabase/)?.[1] || 'ozzijihomyzoxodqpcin';
    const edgeFunctionUrl = `https://${projectRef}.supabase.co/functions/v1/tracker?id=${emailId}`;
    
    // Don't log the full URL to prevent false triggers
    console.log('Edge function prepared for tracking ID:', emailId);
    
    // Add more cache-busting parameters to prevent Gmail from caching
    // Include more randomness and the current timestamp in milliseconds
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().replaceAll('-', '');
    const cacheBustParam = `&t=${timestamp}&r=${randomId}&cb=${Math.random().toString(36).substring(2, 15)}`;
    
    // Create the tracking pixel HTML with just an img tag
    const trackingPixelHtml = `
<!-- Email tracking pixel (transparent 1x1 image) -->
<div style="display:block; position:absolute; left:-9999px; top:-9999px;">
  <img src="${edgeFunctionUrl}${cacheBustParam}" width="1" height="1" alt="" style="display:block; width:1px; height:1px;" />
</div>

<!-- Tracking ID: ${emailId} -->
`
    // Don't log the HTML that contains the tracking URL
    console.log('Tracking pixel HTML generated (not displayed to prevent false triggers)');

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
 * Inserts the pixel only once in the most optimal location
 */
export function addTrackingPixelToEmail(htmlBody: string, trackingPixelHtml: string): string {
  console.log('Adding tracking pixel to email (single insertion)');
  
  // For Gmail compatibility, insert the tracking pixel in a single strategic location
  let modifiedHtml = htmlBody;
  
  // PRIORITY 1: Insert after opening body tag (most reliable for most email clients)
  if (modifiedHtml.includes('<body')) {
    console.log('Email has body tag, inserting after <body>');
    const bodyTagEnd = modifiedHtml.indexOf('>', modifiedHtml.indexOf('<body')) + 1;
    return modifiedHtml.slice(0, bodyTagEnd) + trackingPixelHtml + modifiedHtml.slice(bodyTagEnd);
  }
  
  // PRIORITY 2: If no body tag found, insert after opening html tag
  if (modifiedHtml.includes('<html')) {
    console.log('No body tag but has html tag, inserting after <html>');
    const htmlTagEnd = modifiedHtml.indexOf('>', modifiedHtml.indexOf('<html')) + 1;
    return modifiedHtml.slice(0, htmlTagEnd) + trackingPixelHtml + modifiedHtml.slice(htmlTagEnd);
  }
  
  // PRIORITY 3: If no html or body tags found, insert at the beginning
  console.log('No body or html tags, inserting at the beginning of email');
  return trackingPixelHtml + modifiedHtml;
} 