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
 * Synchronize Gmail tokens from email_accounts table to gmail_tokens table
 * Used to ensure both tables have consistent token data
 */
export const syncGmailTokensFromEmailAccounts = async (): Promise<boolean> => {
  try {
    console.log('Attempting to sync Gmail tokens from email_accounts');
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // First check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      console.error('Session error or no user:', sessionError);
      return false;
    }

    // Get all Gmail accounts for the user, ordered by default first then most recent
    const { data: gmailAccounts, error: accountsError } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('provider', 'gmail')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (accountsError || !gmailAccounts || gmailAccounts.length === 0) {
      console.log('No Gmail accounts found:', accountsError);
      return false;
    }

    // Find the first account with a valid refresh token
    const validAccount = gmailAccounts.find(acc => acc.refresh_token && acc.refresh_token !== 'EMPTY');
    
    if (!validAccount) {
      console.log('No Gmail account found with valid refresh token');
      return false;
    }

    // Save the tokens to gmail_tokens table
    await saveGmailTokens({
      access_token: validAccount.access_token,
      refresh_token: validAccount.refresh_token,
      expiry_date: validAccount.expiry_date
    });

    console.log('Successfully synced tokens from Gmail account:', validAccount.email);
    return true;
  } catch (error) {
    console.error('Error in syncGmailTokensFromEmailAccounts:', error);
    return false;
  }
};

/**
 * Attempt to get Google OAuth credentials
 */
const getGoogleOAuthCredentials = async (): Promise<{clientId: string, clientSecret: string} | null> => {
  try {
    // First try environment variables
    let clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    let clientSecret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
    
    // Log available environment variables (without exposing secrets)
    console.log('OAuth environment variables present:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      envKeys: Object.keys(process.env).filter(key => key.includes('GOOGLE') || key.includes('CLIENT'))
    });
    
    // If not available and we're in the browser, try to load from a credentials file or use options
    if ((!clientId || !clientSecret) && typeof window !== 'undefined') {
      // Fallback to use credentials from OAuth configuration in database
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', 'google_oauth_credentials')
        .single();
        
      if (!error && data?.value) {
        try {
          const credentials = JSON.parse(data.value);
          clientId = credentials.client_id;
          clientSecret = credentials.client_secret;
          console.log('Loaded OAuth credentials from app_settings');
        } catch (e) {
          console.error('Error parsing OAuth credentials from app_settings:', e);
        }
      }
    }
    
    if (!clientId || !clientSecret) {
      console.error('Google OAuth credentials not found in any source');
      return null;
    }
    
    return { clientId, clientSecret };
  } catch (error) {
    console.error('Error getting Google OAuth credentials:', error);
    return null;
  }
};

/**
 * Get Gmail tokens from the default or most recently used Gmail account
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

    // Get the default Gmail account or most recently created one
    const { data: account, error } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('provider', 'gmail')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error querying Gmail account:', error);
      return null;
    }

    if (!account || !account.access_token) {
      console.log('No Gmail account found with valid tokens');
      return null;
    }

    // Check if token needs refresh (with 5 minutes buffer)
    const currentTime = Date.now();
    if (account.expiry_date < currentTime + 5 * 60 * 1000) {
      try {
        // Get OAuth credentials
        const credentials = await getGoogleOAuthCredentials();
        if (!credentials) {
          console.error('Missing Google OAuth credentials');
          return {
            access_token: account.access_token,
            refresh_token: account.refresh_token || '',
            expiry_date: account.expiry_date
          };
        }

        const { clientId, clientSecret } = credentials;
        
        // Only attempt refresh if we have a refresh token
        if (!account.refresh_token) {
          console.error('No refresh token available');
          return {
            access_token: account.access_token,
            refresh_token: '',
            expiry_date: account.expiry_date
          };
        }

        const requestBody = new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: account.refresh_token,
          grant_type: 'refresh_token',
        });

        const response = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: requestBody,
        });

        if (!response.ok) {
          console.error('Failed to refresh token');
          return {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expiry_date: account.expiry_date
          };
        }

        const refreshedData = await response.json();
        
        // Update the account with new tokens
        const refreshedTokens = {
          access_token: refreshedData.access_token,
          refresh_token: refreshedData.refresh_token || account.refresh_token,
          expiry_date: Date.now() + (refreshedData.expires_in || 3600) * 1000
        };

        const { error: updateError } = await supabase
          .from('email_accounts')
          .update({
            access_token: refreshedTokens.access_token,
            refresh_token: refreshedTokens.refresh_token,
            expiry_date: refreshedTokens.expiry_date,
            updated_at: new Date().toISOString()
          })
          .eq('id', account.id);

        if (updateError) {
          console.error('Error updating tokens:', updateError);
          return {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expiry_date: account.expiry_date
          };
        }

        return refreshedTokens;
      } catch (error) {
        console.error('Error refreshing token:', error);
        return {
          access_token: account.access_token,
          refresh_token: account.refresh_token || '',
          expiry_date: account.expiry_date
        };
      }
    }

    return {
      access_token: account.access_token,
      refresh_token: account.refresh_token || '',
      expiry_date: account.expiry_date
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
    return !!(tokens?.access_token);
  } catch (error) {
    console.error('Error in isGmailConnected:', error);
    return false;
  }
};

/**
 * Forces Gmail account reconnection
 */
export const reconnectGmailAccount = async (): Promise<void> => {
  try {
    console.log('Initiating Gmail account reconnection');
    window.location.href = '/api/gmail-oauth/start';
  } catch (error) {
    console.error('Error in reconnectGmailAccount:', error);
    throw error;
  }
}; 
