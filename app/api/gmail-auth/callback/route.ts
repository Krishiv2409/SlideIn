import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { RequestCookies } from 'next/dist/server/web/spec-extension/cookies'

interface StoredGmailAccount {
  email: string
  tokens: {
    access_token: string
    refresh_token: string
    expiry_date: number
  }
  displayName?: string
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  try {
    const code = requestUrl.searchParams.get('code')

    if (!code) {
      console.error('No code provided')
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=no_code`)
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
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=session_error`)
    }

    if (!session?.provider_token) {
      console.error('No provider token in session')
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=no_provider_token`)
    }

    // Get user's email and name
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      console.error('No user email found')
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=no_user_email`)
    }

    // No need to manually sync user data - the database trigger handles this automatically

    // Check if this is the first account for this user
    const { data: existingAccounts, error: countError } = await supabase
      .from('email_accounts')
      .select('id')
      .eq('user_id', user.id);

    if (countError) {
      console.error('Error checking existing accounts:', countError);
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=check_accounts_failed`);
    }

    // Always insert a new row for every Gmail connection
    const { error: saveError } = await supabase
      .from('email_accounts')
      .insert({
        user_id: user.id,
        email: user.email,
        provider: 'gmail',
        access_token: session.provider_token,
        refresh_token: session.provider_refresh_token || '',
        expiry_date: Date.now() + (session.expires_in || 3600) * 1000,
        display_name: user.user_metadata?.full_name || user.email,
        is_default: !existingAccounts || existingAccounts.length === 0, // Set as default if it's the first account
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (saveError) {
      console.error('Error saving account:', saveError);
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=save_account_failed&details=${encodeURIComponent(saveError.message)}`);
    }

    // Create a script to update localStorage with the new account
    const script = `
      <script>
        try {
          // Get existing accounts
          const storedAccounts = localStorage.getItem('gmailAccounts');
          const gmailAccounts = storedAccounts ? JSON.parse(storedAccounts) : [];
          
          // Add new account
          const newAccount = {
            email: "${user.email}",
            tokens: {
              access_token: "${session.provider_token}",
              refresh_token: "${session.provider_refresh_token || ''}",
              expiry_date: ${Date.now() + (session.expires_in || 3600) * 1000}
            },
            displayName: "${user.user_metadata?.full_name || user.email}"
          };
          
          gmailAccounts.push(newAccount);
          
          // Save updated accounts
          localStorage.setItem('gmailAccounts', JSON.stringify(gmailAccounts));
          
          // Redirect to settings page
          window.location.href = "${requestUrl.origin}/settings?success=true";
        } catch (error) {
          console.error('Error updating localStorage:', error);
          window.location.href = "${requestUrl.origin}/settings?error=storage_update_failed";
        }
      </script>
    `;

    // Return HTML with the script
    return new NextResponse(
      `<!DOCTYPE html><html><head><title>Connecting Gmail...</title></head><body>${script}</body></html>`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Error in Gmail auth callback:', error)
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=unknown_error`)
  }
} 