import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  return async (cookieStore: ReturnType<typeof cookies>) => {
    const resolvedCookies = await cookieStore
    
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            const cookie = resolvedCookies.get(name)
            return cookie?.value
          },
          set(name, value, options) {
            try {
              resolvedCookies.set(name, value, options)
            } catch {
              // The set method will throw in middleware or when cookies are static
            }
          },
          remove(name, options) {
            try {
              resolvedCookies.set(name, '', { ...options, maxAge: 0 })
            } catch {
              // The delete method will throw in middleware or when cookies are static 
            }
          },
        },
      }
    )
  }
} 