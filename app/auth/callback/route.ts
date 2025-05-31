import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  if (error) {
    console.error('Auth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(errorDescription || 'Authentication failed')}`, requestUrl.origin)
    )
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = await createClient()(cookieStore)
    
    try {
      // Exchange the auth code for a session
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error('Error exchanging code for session:', sessionError)
        return NextResponse.redirect(
          new URL('/sign-in?error=Failed to authenticate', requestUrl.origin)
        )
      }
      
      console.log('Authentication successful, session created:', !!data.session)
      
      // The profile table is automatically managed by the database trigger
      // No need to manually sync user data here
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(
        new URL('/sign-in?error=Failed to authenticate', requestUrl.origin)
      )
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/email-generator', requestUrl.origin))
} 