// Constants
const GMAIL_TOKENS_KEY = 'gmail_tokens';

// Types
export interface GmailTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

/**
 * Save Gmail tokens to local storage
 */
export const saveGmailTokens = (tokens: GmailTokens): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(GMAIL_TOKENS_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error('Error saving Gmail tokens to local storage:', error);
  }
};

/**
 * Get Gmail tokens from local storage
 */
export const getGmailTokens = (): GmailTokens | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const tokensString = localStorage.getItem(GMAIL_TOKENS_KEY);
    if (!tokensString) return null;
    
    return JSON.parse(tokensString) as GmailTokens;
  } catch (error) {
    console.error('Error getting Gmail tokens from local storage:', error);
    return null;
  }
};

/**
 * Update Gmail tokens in local storage
 */
export const updateGmailTokens = (partialTokens: Partial<GmailTokens>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const existingTokens = getGmailTokens();
    if (!existingTokens) return;
    
    const updatedTokens = {
      ...existingTokens,
      ...partialTokens
    };
    
    localStorage.setItem(GMAIL_TOKENS_KEY, JSON.stringify(updatedTokens));
  } catch (error) {
    console.error('Error updating Gmail tokens in local storage:', error);
  }
};

/**
 * Remove Gmail tokens from local storage
 */
export const removeGmailTokens = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(GMAIL_TOKENS_KEY);
  } catch (error) {
    console.error('Error removing Gmail tokens from local storage:', error);
  }
};

/**
 * Check if Gmail is connected (tokens exist and not expired)
 */
export const isGmailConnected = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const tokens = getGmailTokens();
    if (!tokens) return false;
    
    // Check if token is expired (with 5 minutes buffer)
    const currentTime = Date.now();
    const isExpired = tokens.expiry_date < currentTime + 5 * 60 * 1000;
    
    return !isExpired;
  } catch (error) {
    console.error('Error checking Gmail connection status:', error);
    return false;
  }
}; 