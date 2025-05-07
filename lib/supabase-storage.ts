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
    throw error;
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
        console.log('Attempting to refresh token via Supabase');
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('Error refreshing session:', refreshError);
          return null;
        }

        if (!refreshedSession?.provider_token) {
          console.log('No provider token in refreshed session, reconnection required');
          return null;
        }

        const refreshedTokens = {
          access_token: refreshedSession.provider_token,
          refresh_token: refreshedSession.provider_refresh_token || data.refresh_token,
          expiry_date: Date.now() + (refreshedSession.expires_in || 3600) * 1000
        };

        // Update tokens in database
        await updateGmailTokens(refreshedTokens);

        return refreshedTokens;
      } catch (error) {
        console.error('Error refreshing token:', error);
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
    const tokens = await getGmailTokens();
    if (!tokens) {
      return false;
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const currentTime = Date.now();
    if (tokens.expiry_date < currentTime + 5 * 60 * 1000) {
      // Try to refresh the token
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.provider_token) {
        return false;
      }

      // Update tokens with new session data
      const newTokens = {
        access_token: session.provider_token,
        refresh_token: session.provider_refresh_token || tokens.refresh_token,
        expiry_date: Date.now() + (session.expires_in || 3600) * 1000
      };

      await updateGmailTokens(newTokens);
      return true;
    }

    return true;
  } catch (error) {
    console.error('Error in isGmailConnected:', error);
    return false;
  }
}; 