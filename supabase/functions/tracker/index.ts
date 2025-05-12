import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6'

// 1x1 transparent GIF, base64 encoded
const TRANSPARENT_GIF = Uint8Array.from(atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), c => c.charCodeAt(0))

// Create Supabase client using the automatically set environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

console.log('--- Tracker Edge Function Initialized ---')
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set')
console.log('Supabase Service Key:', supabaseServiceKey ? 'Set' : 'Not set')

// Create Supabase client with the service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Time window in milliseconds to consider duplicate opens (5 seconds)
const DUPLICATE_OPEN_WINDOW_MS = 5000

// Minimum time in milliseconds after an email is sent before we consider an open legitimate (30 seconds)
const MIN_TIME_AFTER_SEND_MS = 5000

Deno.serve(async (req) => {
  const startTime = new Date().toISOString()
  const requestId = crypto.randomUUID()
  const now = new Date()
  
  console.log('==========================================')
  console.log('Tracker request ID:', requestId)
  console.log('Tracker function called at:', startTime)
  console.log('Request URL:', req.url)
  console.log('Request Method:', req.method)
  
  // Capture relevant headers for debugging
  const relevantHeaders = ['user-agent', 'referer', 'origin', 'host']
  const headers = Object.fromEntries(
    [...req.headers].filter(([key]) => relevantHeaders.includes(key.toLowerCase()))
  )
  console.log('Request Headers:', JSON.stringify(headers))
  
  // Create debug info object that we'll save to the database
  const debugInfo = {
    request_id: requestId,
    timestamp: startTime,
    method: req.method,
    url: req.url,
    headers: headers,
    success: false,
    update_method: null,
    error: null
  }
  
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // Extract email ID from query parameter
  const url = new URL(req.url)
  const emailId = url.searchParams.get('id')
  
  if (!emailId) {
    console.error('No email ID provided')
    return new Response('Missing email ID', { 
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain'
      }
    })
  }

  try {
    console.log('Getting email record for ID:', emailId)
    
    // Get current record
    const { data: record, error } = await supabase
      .from('email_events')
      .select('*')
      .eq('email_id', emailId)
      .single()
    
    if (error) {
      console.error('Error fetching record:', error.message)
    } else if (!record) {
      console.error('No record found with email_id:', emailId)
    } else {
      console.log('Found record:', record)
      
      // Calculate time since email was sent
      const sentTime = record.sent_at ? new Date(record.sent_at) : null
      const timeSinceSendMs = sentTime ? now.getTime() - sentTime.getTime() : null
      console.log(`Time since email was sent: ${timeSinceSendMs ? Math.round(timeSinceSendMs / 1000) : 'unknown'} seconds`)
      
      // Check if this is a duplicate open (within 5 seconds of last open)
      const lastOpenTime = record.last_opened ? new Date(record.last_opened) : null
      const isDuplicate = lastOpenTime && (now.getTime() - lastOpenTime.getTime() < DUPLICATE_OPEN_WINDOW_MS)
      
      // Determine if this is potentially a false open (too soon after sending)
      const isTooSoon = sentTime && timeSinceSendMs !== null && timeSinceSendMs < MIN_TIME_AFTER_SEND_MS
      
      if (isDuplicate) {
        console.log('Duplicate open detected (within 5 seconds). Skipping update.')
      } else if (isTooSoon) {
        console.log(`Open detected too soon after sending (${Math.round(timeSinceSendMs! / 1000)} seconds). Likely false positive. Logging but not updating status.`)
        
        // Update only the last_accessed time but don't change status or increment opens
        const { error: logError } = await supabase
          .from('email_events')
          .update({
            last_opened: now.toISOString(),
            // Add a log of potential false positive opens
            false_positive_logs: [
              ...(record.false_positive_logs || []),
              {
                timestamp: now.toISOString(),
                seconds_after_send: Math.round(timeSinceSendMs! / 1000)
              }
            ]
          })
          .eq('email_id', emailId)
        
        if (logError) {
          console.error('Error logging false positive:', logError.message)
        } else {
          console.log('Logged false positive open')
        }
      } else {
        // This is a legitimate open
        console.log('Legitimate open detected. Updating status and incrementing count.')
        
        const { error: updateError } = await supabase
          .from('email_events')
          .update({
            opens: (record.opens || 0) + 1,
            last_opened: now.toISOString(),
            status: 'Opened'
          })
          .eq('email_id', emailId)
        
        if (updateError) {
          console.error('Error updating record:', updateError.message)
        } else {
          console.log('Successfully updated email status to Opened')
        }
      }
    }
  } catch (err) {
    console.error('Error in tracker function:', err)
  }

  // Always return the transparent GIF with CORS headers
  console.log('Returning transparent GIF image. Success:', debugInfo.success)
  return new Response(TRANSPARENT_GIF, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
      'X-Tracking-ID': emailId,
      'X-Request-ID': requestId,
      'X-Tracking-Success': debugInfo.success ? 'true' : 'false'
    },
  })
}) 