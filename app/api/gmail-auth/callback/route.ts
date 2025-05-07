import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { RequestCookies } from 'next/dist/server/web/spec-extension/cookies'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/settings?error=${error}`)
    }

    if (!code) {
      console.error('No code provided')
      return NextResponse.redirect(`${requestUrl.origin}/settings?error=no_code`)
    }

    const cookieStore = cookies() as unknown as RequestCookies
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
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              console.error('Error removing cookie:', error)
            }
          },
        },
      }
    )

    // Exchange the code for tokens/session FIRST
    const { data: { session }, error: tokenError } = await supabase.auth.exchangeCodeForSession(code)

    if (tokenError) {
      console.error('Token exchange error:', tokenError)
      return NextResponse.redirect(`${requestUrl.origin}/settings?error=token_exchange_failed`)
    }

    if (!session?.user) {
      console.error('No active session found after code exchange')
      return NextResponse.redirect(`${requestUrl.origin}/settings?error=no_session`)
    }

    if (!session?.provider_token) {
      console.error('No provider token in session')
      return NextResponse.redirect(`${requestUrl.origin}/settings?error=no_provider_token`)
    }

    // Save tokens to database
    const { error: saveError } = await supabase
      .from('gmail_tokens')
      .upsert({
        user_id: session.user.id,
        access_token: session.provider_token,
        refresh_token: session.provider_refresh_token,
        expiry_date: Date.now() + (session.expires_in || 3600) * 1000,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (saveError) {
      console.error('Error saving tokens:', saveError)
      return NextResponse.redirect(`${requestUrl.origin}/settings?error=save_tokens_failed`)
    }

    return NextResponse.redirect(`${requestUrl.origin}/?success=true`)
  } catch (error) {
    console.error('Callback error:', error)
    // Ensure requestUrl is defined for the redirect, fallback to '/' if not
    let origin = '/';
    try {
      const requestUrl = new URL(request.url);
      origin = requestUrl.origin;
    } catch {}
    return NextResponse.redirect(`${origin}/settings?error=unknown`)
  }
} 