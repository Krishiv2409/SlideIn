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

Deno.serve(async (req: Request) => {
  const now = new Date()
  console.log('Tracker function called at:', now.toISOString())
  
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
    console.log('Recording open for email ID:', emailId)
    
    // Simple direct update without using complex RPC
    // First, check if this email is already opened
    const { data: existingRecord } = await supabase
      .from('email_events')
      .select('email_id, status, opens, last_opened')
      .eq('email_id', emailId)
      .single()
    
    if (existingRecord) {
      // Update the record
      await supabase
        .from('email_events')
        .update({
          opens: (existingRecord.opens || 0) + 1,
          last_opened: now.toISOString(),
          status: 'Opened'
        })
        .eq('email_id', emailId)
      
      console.log(`Successfully updated email ID: ${emailId}, opens: ${(existingRecord.opens || 0) + 1}`)
    } else {
      console.error('Email record not found for ID:', emailId)
    }
  } catch (err) {
    console.error('Error in tracker function:', err)
  }

  // Always return the transparent GIF regardless of success/failure
  return new Response(TRANSPARENT_GIF, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*'
    },
  })
}) 