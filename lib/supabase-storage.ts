import { createBrowserClient } from '@supabase/ssr';

export interface GmailTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

/**
 * Save Gmail tokens to Supabase
 */
export const saveGmailTokens = async (tokens: GmailTokens): Promise<void> => {
  try {
    console.log('Attempting to save Gmail tokens:', { tokens });
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // First check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session check in saveGmailTokens:', { session, error: sessionError });
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error(`Failed to get session: ${sessionError.message}`);
    }

    if (!session?.user) {
      console.error('No active session found');
      throw new Error('No active session found');
    }

    // Validate tokens
    if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
      console.error('Invalid token data provided:', tokens);
      throw new Error('Invalid token data provided');
    }

    const { data, error } = await supabase
      .from('gmail_tokens')
      .upsert({
        user_id: session.user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select();

    if (error) {
      console.error('Error saving Gmail tokens:', error);
      throw new Error(`Failed to save tokens: ${error.message}`);
    }

    if (!data) {
      console.error('No data returned after insert');
      throw new Error('No data returned after insert');
    }

    console.log('Successfully saved/updated Gmail tokens:', data);
  } catch (error) {
    console.error('Error in saveGmailTokens:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to save Gmail tokens: ${error.message}`);
    }
    throw new Error('Failed to save Gmail tokens: Unknown error');
  }
};

/**
 * Get Gmail tokens from Supabase and refresh if needed
 */
export const getGmailTokens = async (): Promise<GmailTokens | null> => {
  try {
    console.log('Attempting to get Gmail tokens');
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // First check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session check in getGmailTokens:', { session, error: sessionError });
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return null;
    }

    if (!session?.user) {
      console.log('No active session found');
      return null;
    }

    const { data, error } = await supabase
      .from('gmail_tokens')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    console.log('Token retrieval result:', { data, error });

    if (error) {
      if (error.code === 'PGRST116' || error.code === '406') {
        console.log('No Gmail tokens found for user');
        return null;
      }
      console.error('Error querying Gmail tokens:', error);
      return null;
    }
    
    if (!data) {
      console.log('No Gmail tokens found for user');
      return null;
    }

    // Check if token needs refresh (with 5 minutes buffer)
    const currentTime = Date.now();
    console.log('Token expiry check:', { 
      currentTime, 
      expiryDate: data.expiry_date,
      needsRefresh: data.expiry_date < currentTime + 5 * 60 * 1000 
    });

    if (data.expiry_date < currentTime + 5 * 60 * 1000) {
      try {
        console.log('Attempting to refresh token');
        const response = await fetch('/api/gmail-auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: data.refresh_token
          }),
        });

        console.log('Token refresh response status:', response.status);

        if (!response.ok) {
          console.error('Failed to refresh token:', await response.text());
          return null;
        }

        const refreshedTokens = await response.json();
        console.log('Refreshed tokens:', refreshedTokens);
        
        if (!refreshedTokens.success) {
          console.error('Token refresh failed:', refreshedTokens.error);
          return null;
        }

        // Update tokens in database
        await updateGmailTokens({
          access_token: refreshedTokens.access_token,
          refresh_token: refreshedTokens.refresh_token,
          expiry_date: refreshedTokens.expiry_date
        });

        return {
          access_token: refreshedTokens.access_token,
          refresh_token: refreshedTokens.refresh_token,
          expiry_date: refreshedTokens.expiry_date
        };
      } catch (error) {
        console.error('Error refreshing Gmail tokens:', error);
        return null;
      }
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expiry_date: data.expiry_date
    };
  } catch (error) {
    console.error('Error in getGmailTokens:', error);
    return null;
  }
};

/**
 * Update Gmail tokens in Supabase
 */
export const updateGmailTokens = async (partialTokens: Partial<GmailTokens>): Promise<void> => {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // First check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Failed to get session');
    }

    if (!session?.user) {
      console.error('No active session found');
      throw new Error('No active session found');
    }

    const { error } = await supabase
      .from('gmail_tokens')
      .update({
        ...partialTokens,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error updating Gmail tokens:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateGmailTokens:', error);
    throw error;
  }
};

/**
 * Remove Gmail tokens from Supabase
 */
export const removeGmailTokens = async (): Promise<void> => {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // First check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Failed to get session');
    }

    if (!session?.user) {
      console.error('No active session found');
      throw new Error('No active session found');
    }

    const { error } = await supabase
      .from('gmail_tokens')
      .delete()
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error removing Gmail tokens:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in removeGmailTokens:', error);
    throw error;
  }
};

/**
 * Check if Gmail is connected (tokens exist and not expired)
 */
export const isGmailConnected = async (): Promise<boolean> => {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // First check if we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      console.log('No valid session found');
      return false;
    }

    // Check if we have stored tokens
    const tokens = await getGmailTokens();
    if (!tokens) {
      console.log('No stored Gmail tokens found');
      return false;
    }

    // Validate token data
    if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
      console.log('Invalid token data found');
      return false;
    }

    // Check if token is expired (with 5 minutes buffer)
    const currentTime = Date.now();
    if (tokens.expiry_date < currentTime + 5 * 60 * 1000) {
      console.log('Gmail token is expired or about to expire');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in isGmailConnected:', error);
    return false;
  }
}; 