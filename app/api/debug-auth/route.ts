import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return NextResponse.json({ 
        error: 'Session error', 
        details: sessionError.message 
      }, { status: 401 });
    }
    
    if (!session) {
      return NextResponse.json({ 
        error: 'No active session found' 
      }, { status: 401 });
    }
    
    // Check if Gmail tokens exist
    const { data: tokensData, error: tokensError } = await supabase
      .from('gmail_tokens')
      .select('*')
      .eq('user_id', session.user.id);
      
    // Run the debug function
    const { data: debugData, error: debugError } = await supabase
      .rpc('debug_rls_check');
    
    // Check RLS directly
    const { data: rlsCheck, error: rlsError } = await supabase
      .from('gmail_tokens')
      .select('count(*)')
      .eq('user_id', session.user.id);
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
      },
      gmail_tokens: {
        found: tokensData && tokensData.length > 0,
        count: tokensData?.length || 0,
        error: tokensError ? tokensError.message : null,
      },
      rls_debug: {
        data: debugData,
        error: debugError ? debugError.message : null
      },
      direct_rls_check: {
        data: rlsCheck,
        error: rlsError ? rlsError.message : null
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 