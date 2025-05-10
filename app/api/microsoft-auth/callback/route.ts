import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  try {
    const code = requestUrl.searchParams.get('code')

    if (!code) {
      console.error('No code provided')
      return NextResponse.redirect(`${requestUrl.origin}/settings?error=no_code`)
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              console.error('Error setting cookie:', error)
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options, maxAge: 0 })
            } catch (error) {
              console.error('Error removing cookie:', error)
            }
          },
        },
      }
    )

    // Exchange the code for a session
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.redirect(`${requestUrl.origin}/settings?error=session_error`)
    }

    if (!session?.provider_token) {
      console.error('No provider token in session')
      return NextResponse.redirect(`${requestUrl.origin}/settings?error=no_provider_token`)
    }

    // Get user's email and name
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      console.error('No user email found')
      return NextResponse.redirect(`${requestUrl.origin}/settings?error=no_user_email`)
    }

    // Check if this is the first account for this user
    const { data: existingAccounts, error: countError } = await supabase
      .from('email_accounts')
      .select('id')
      .eq('user_id', user.id);

    if (countError) {
      console.error('Error checking existing accounts:', countError);
      return NextResponse.redirect(`${requestUrl.origin}/settings?error=check_accounts_failed`);
    }

    // Check if this email already exists for this user
    const { data: existingAccount, error: queryError } = await supabase
      .from('email_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('email', user.email)
      .single();

    if (queryError && queryError.code !== 'PGRST116') { // PGRST116 means "no rows found"
      console.error('Error checking for existing account:', queryError);
      return NextResponse.redirect(`${requestUrl.origin}/settings?error=database_error`);
    }

    if (existingAccount) {
      // Update existing account with new tokens
      const { error: updateError } = await supabase
        .from('email_accounts')
        .update({
          access_token: session.provider_token,
          refresh_token: session.provider_refresh_token || '',
          expiry_date: Date.now() + (session.expires_in || 3600) * 1000,
          display_name: user.user_metadata?.full_name || user.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAccount.id);

      if (updateError) {
        console.error('Error updating existing account:', updateError);
        return NextResponse.redirect(`${requestUrl.origin}/settings?error=update_failed`);
      }
    } else {
      // Create new account
      const { error: insertError } = await supabase
        .from('email_accounts')
        .insert({
          user_id: user.id,
          email: user.email,
          provider: 'outlook',
          access_token: session.provider_token,
          refresh_token: session.provider_refresh_token || '',
          expiry_date: Date.now() + (session.expires_in || 3600) * 1000,
          display_name: user.user_metadata?.full_name || user.email,
          is_default: !existingAccounts || existingAccounts.length === 0, // Set as default if it's the first account
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating new account:', insertError);
        return NextResponse.redirect(`${requestUrl.origin}/settings?error=insert_failed`);
      }
    }

    // Redirect to settings page with success message
    return NextResponse.redirect(`${requestUrl.origin}/settings?success=outlook_connected`);
  } catch (error) {
    console.error('Error in Microsoft auth callback:', error)
    return NextResponse.redirect(`${requestUrl.origin}/settings?error=unknown_error`)
  }
} 