import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// This endpoint allows admin users to save Google OAuth credentials
// in the app_settings table to be used for token refreshing
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            return cookieStore.get(name)?.value;
          },
          async set(name: string, value: string, options: any) {
            try {
              cookieStore.set({
                name,
                value,
                ...options,
              });
            } catch (error) {
              // Handle cookie setting error
              console.error('Error setting cookie:', error);
            }
          },
          async remove(name: string, options: any) {
            try {
              cookieStore.delete(name);
            } catch (error) {
              // Handle cookie deletion error
              console.error('Error deleting cookie:', error);
            }
          },
        },
      }
    );
    
    // Check authorization (user is logged in and has admin role)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user has admin role (simplified check - implement proper role check in production)
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
      
    if (rolesError || !userRoles) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Get credentials from request body
    const { client_id, client_secret } = await request.json();
    
    if (!client_id || !client_secret) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Save credentials to app_settings table
    const { error: saveError } = await supabase
      .from('app_settings')
      .upsert({
        key: 'google_oauth_credentials',
        value: { client_id, client_secret },
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
      
    if (saveError) {
      console.error('Error saving credentials:', saveError);
      return NextResponse.json(
        { success: false, error: 'Failed to save credentials' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in save-google-credentials endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 