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

    // Get the gmail account from email_accounts
    const { data: gmailAccount, error: accountError } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('provider', 'gmail')
      .eq('is_default', true)
      .single();
    
    if (accountError) {
      console.log('No default Gmail account found, trying any Gmail account');
      // Try to get any Gmail account if no default
      const { data: anyGmailAccount, error: anyAccountError } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('provider', 'gmail')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (anyAccountError || !anyGmailAccount) {
        console.log('No Gmail account found in email_accounts table');
        return false;
      }
      
      // Use the non-default account
      if (anyGmailAccount.refresh_token && anyGmailAccount.refresh_token !== 'EMPTY') {
        await saveGmailTokens({
          access_token: anyGmailAccount.access_token,
          refresh_token: anyGmailAccount.refresh_token,
          expiry_date: anyGmailAccount.expiry_date
        });
        console.log('Successfully synced tokens from non-default Gmail account');
        return true;
      }
      
      return false;
    }
    
    // If we found a default account with a valid refresh token, sync it
    if (gmailAccount.refresh_token && gmailAccount.refresh_token !== 'EMPTY') {
      await saveGmailTokens({
        access_token: gmailAccount.access_token,
        refresh_token: gmailAccount.refresh_token,
        expiry_date: gmailAccount.expiry_date
      });
      console.log('Successfully synced tokens from default Gmail account');
      return true;
    }
    
    return false;
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

    // Try to get tokens from gmail_tokens table
    let { data, error } = await supabase
      .from('gmail_tokens')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    console.log('Token retrieval result:', { data, error });

    // If no tokens found or missing refresh token, try to sync from email_accounts
    if ((error || !data || !data.refresh_token) && await syncGmailTokensFromEmailAccounts()) {
      // Try again after sync
      const { data: syncedData, error: syncedError } = await supabase
        .from('gmail_tokens')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      if (syncedError || !syncedData) {
        console.log('Failed to get tokens even after sync');
        return null;
      }
      
      console.log('Successfully retrieved tokens after sync:', syncedData);
      data = syncedData;
      error = null;
    }
    
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
        console.log('Token expired or expiring soon, attempting to refresh with Google API');
        
        // Ensure we have a refresh token
        if (!data.refresh_token) {
          console.error('No refresh token available for token refresh');
          
          // Try to sync from email_accounts as a last resort
          if (await syncGmailTokensFromEmailAccounts()) {
            console.log('Tokens synced from email_accounts, retrying operation');
            // Call ourselves recursively after sync to get the fresh tokens
            return getGmailTokens();
          }
          
          // If sync failed, throw the original error
          throw new Error('Gmail reconnection required: missing refresh token');
        }
        
        // Get OAuth credentials
        const credentials = await getGoogleOAuthCredentials();
        if (!credentials) {
          console.error('Missing Google OAuth credentials');
          
          // Try direct fallback to use tokens from email_accounts table without refresh
          try {
            console.log('Attempting direct fallback to email_accounts table tokens');
            
            // Get available Gmail accounts (sorted by default first, then most recent)
            const { data: accounts, error: accountsError } = await supabase
              .from('email_accounts')
              .select('*')
              .eq('user_id', session.user.id)
              .eq('provider', 'gmail')
              .order('is_default', { ascending: false })
              .order('created_at', { ascending: false });
              
            // Use the first account with a valid access token
            if (!accountsError && accounts && accounts.length > 0) {
              const validAccount = accounts.find(acc => acc.access_token);
              
              if (validAccount) {
                console.log('Found valid token in email_accounts table, using directly');
                return {
                  access_token: validAccount.access_token,
                  refresh_token: validAccount.refresh_token || '',
                  expiry_date: validAccount.expiry_date
                };
              }
            }
          } catch (fallbackError) {
            console.error('Error in direct email_accounts fallback:', fallbackError);
          }
          
          // If direct fallback failed too, return existing token
          console.log('No OAuth credentials and no fallback, using existing token');
          return {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expiry_date: data.expiry_date
          };
        }
        
        console.log('Using OAuth credentials to refresh token');
        const { clientId, clientSecret } = credentials;
        
        const requestBody = new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: data.refresh_token,
          grant_type: 'refresh_token',
        });
        
        // Log the actual request being sent (without sensitive values)
        console.log('Refresh token request:', {
          endpoint: 'https://oauth2.googleapis.com/token',
          method: 'POST',
          params: {
            client_id: clientId.substring(0, 5) + '...',
            refresh_token: 'present: ' + (data.refresh_token ? 'yes' : 'no'),
            grant_type: 'refresh_token',
          }
        });

        // Direct refresh with Google's token endpoint
        const response = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: requestBody,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to refresh token with Google API:', errorText);
          console.log('Using existing token as fallback');
          // Return existing token as fallback
          return {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expiry_date: data.expiry_date
          };
        }

        const refreshedData = await response.json();
        console.log('Successfully refreshed token with Google API:', refreshedData);

        // Create new tokens object
        const refreshedTokens = {
          access_token: refreshedData.access_token,
          // Keep the existing refresh token if not provided in the response
          refresh_token: refreshedData.refresh_token || data.refresh_token,
          // Calculate expiry date from expires_in
          expiry_date: Date.now() + (refreshedData.expires_in || 3600) * 1000
        };

        // Update tokens in database
        await updateGmailTokens(refreshedTokens);

        return refreshedTokens;
      } catch (error) {
        console.error('Error refreshing token:', error);
        // Return existing token as fallback
        return {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expiry_date: data.expiry_date
        };
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

    // Make sure we have both access token and refresh token
    if (!tokens.access_token || !tokens.refresh_token) {
      console.error('Missing required token fields:', {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token
      });
      return false;
    }

    // If we have tokens and getGmailTokens already handles refresh,
    // we can consider Gmail connected
    return true;
  } catch (error) {
    console.error('Error in isGmailConnected:', error);
    return false;
  }
};

/**
 * Forces Gmail account reconnection by first removing existing tokens
 */
export const reconnectGmailAccount = async (): Promise<void> => {
  try {
    console.log('Initiating Gmail account reconnection');
    // First remove existing tokens
    await removeGmailTokens();
    
    // Redirect to the OAuth start endpoint
    window.location.href = '/api/gmail-oauth/start';
  } catch (error) {
    console.error('Error in reconnectGmailAccount:', error);
    throw error;
  }
}; 