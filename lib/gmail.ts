import { google } from 'googleapis';

// Set up OAuth2 client with credentials from environment variables
export const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

// Exchange authorization code for tokens
export const getTokensFromCode = async (code: string) => {
  const oauth2Client = createOAuth2Client();
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return { 
      success: true, 
      tokens 
    };
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to exchange code for tokens' 
    };
  }
};

// Generate authentication URL
export const getAuthUrl = () => {
  const oauth2Client = createOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Required for refresh token
    scope: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
    prompt: 'consent' // Force consent screen to ensure we get refresh token
  });
};

// Send email using Gmail API
export const sendEmail = async ({
  accessToken,
  refreshToken,
  to,
  subject,
  htmlContent
}: {
  accessToken: string;
  refreshToken: string;
  to: string;
  subject: string;
  htmlContent: string;
}) => {
  const oauth2Client = createOAuth2Client();
  
  // Set credentials for the OAuth2 client
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });
  
  // Create Gmail API client
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  // Construct email message in RFC 822 format
  const mimeMessage = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlContent
  ].join('\r\n');
  
  // Encode the email in base64 URL-safe format
  const encodedMessage = Buffer.from(mimeMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  try {
    // Send the message
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });
    
    return {
      success: true,
      messageId: res.data.id
    };
  } catch (error) {
    console.error('Error sending email with Gmail API:', error);
    
    // Check if token needs refresh and retry
    if (error instanceof Error && 
        (error.message.includes('invalid_grant') || 
         error.message.includes('invalid_token') || 
         error.message.includes('expired_token'))) {
      try {
        // Force token refresh
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        if (!credentials.access_token || !credentials.expiry_date) {
          throw new Error('Failed to refresh token');
        }
        
        // Return refreshed tokens along with error for client to update storage
        return {
          success: false,
          needsTokenRefresh: true,
          refreshedTokens: {
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token || refreshToken,
            expiry_date: credentials.expiry_date
          },
          error: 'Token refresh required. Please try again.'
        };
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        return {
          success: false,
          error: 'Authentication expired. Please reconnect your Gmail account.'
        };
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    };
  }
};

// Refresh token if it's expired
export const refreshTokenIfNeeded = async (refreshToken: string) => {
  const oauth2Client = createOAuth2Client();
  
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });
  
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    return {
      success: true,
      tokens: credentials
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh token'
    };
  }
}; 