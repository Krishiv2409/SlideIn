import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Create a response to modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client using the middleware's Request and Response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
          })
        },
      },
    }
  )
  
  // This will refresh the session if it exists
  await supabase.auth.getSession()
  
  // Define protected routes
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/email-generator') ||
    request.nextUrl.pathname.startsWith('/settings') ||
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/profile')

  // Check if we need to redirect
  if (isProtectedRoute) {
    const { data } = await supabase.auth.getUser()
    
    if (!data.user) {
      // If no user, redirect to login
      const redirectUrl = new URL('/sign-in', request.url)
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
} 