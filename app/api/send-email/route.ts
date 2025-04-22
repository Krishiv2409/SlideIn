import { NextResponse } from 'next/server';
import { sendEmail, refreshTokenIfNeeded } from '@/lib/gmail';

// Interface for the request body
interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  gmailTokens: {
    access_token: string;
    refresh_token: string;
    expiry_date: number;
  };
}

export async function POST(request: Request) {
  try {
    const { to, subject, html, gmailTokens } = await request.json() as SendEmailRequest;

    if (!to || !subject || !html || !gmailTokens) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if token is about to expire and refresh if needed
    const currentTime = Date.now();
    let accessToken = gmailTokens.access_token;
    let refreshToken = gmailTokens.refresh_token;
    
    // If the token will expire in less than 5 minutes, refresh it
    if (gmailTokens.expiry_date && gmailTokens.expiry_date < currentTime + 5 * 60 * 1000) {
      const refreshResult = await refreshTokenIfNeeded(refreshToken);
      
      if (refreshResult.success && refreshResult.tokens) {
        accessToken = refreshResult.tokens.access_token || accessToken;
        refreshToken = refreshResult.tokens.refresh_token || refreshToken;
      } else {
        return NextResponse.json(
          { success: false, error: 'Failed to refresh authentication token' },
          { status: 401 }
        );
      }
    }

    // Send the email via Gmail API
    const result = await sendEmail({
      accessToken,
      refreshToken,
      to,
      subject,
      htmlContent: html
    });

    if (!result.success) {
      // If token needs refresh, return the refreshed tokens with the error
      if (result.needsTokenRefresh && result.refreshedTokens) {
        return NextResponse.json({
          success: false,
          error: result.error,
          refreshedTokens: result.refreshedTokens
        });
      }
      
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId 
    });
  } catch (error) {
    console.error('Request processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}