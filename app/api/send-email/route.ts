import { NextResponse } from 'next/server';
import { sendEmail, refreshTokenIfNeeded } from '@/lib/gmail';
import { createEmailTrackingEvent, addTrackingPixelToEmail } from '@/utils/email-tracking';

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
  trackingEnabled?: boolean;
  userId?: string;
}

export async function POST(request: Request) {
  console.log('Send Email API route called');
  
  try {
    const body = await request.json();
    const { to, subject, html, gmailTokens, trackingEnabled = false, userId } = body as SendEmailRequest;
    
    console.log('Request body received:', { 
      to, 
      subject, 
      htmlLength: html?.length, 
      tokensPresent: !!gmailTokens, 
      trackingEnabled,
      hasUserId: !!userId
    });

    if (!to || !subject || !html || !gmailTokens) {
      console.error('Missing required fields in request');
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
      console.log('Token is about to expire, refreshing');
      const refreshResult = await refreshTokenIfNeeded(refreshToken);
      
      if (refreshResult.success && refreshResult.tokens) {
        accessToken = refreshResult.tokens.access_token || accessToken;
        refreshToken = refreshResult.tokens.refresh_token || refreshToken;
        console.log('Token refreshed successfully');
      } else {
        console.error('Failed to refresh token:', refreshResult);
        return NextResponse.json(
          { success: false, error: 'Failed to refresh authentication token' },
          { status: 401 }
        );
      }
    }

    // Add tracking pixel if enabled
    let finalHtml = html;
    let emailId = null;
    
    if (trackingEnabled) {
      console.log('Tracking is enabled, adding tracking pixel');
      try {
        // Create a tracking event and get tracking pixel, passing userId
        const trackingResult = await createEmailTrackingEvent(to, subject, userId);
        emailId = trackingResult.emailId;
        
        console.log('Tracking event created with ID:', emailId);
        
        // Add tracking pixel to email HTML
        finalHtml = addTrackingPixelToEmail(html, trackingResult.trackingPixelHtml);
        console.log('Tracking pixel added to HTML');
      } catch (trackingError) {
        console.error('Failed to add email tracking:', trackingError);
        // Instead of silently continuing, let's include this error in the response
        emailId = null;
        finalHtml = html;
      }
    } else {
      console.log('Tracking is disabled, skipping tracking pixel');
    }

    // Send the email via Gmail API
    console.log('Sending email via Gmail API');
    const result = await sendEmail({
      accessToken,
      refreshToken,
      to,
      subject,
      htmlContent: finalHtml
    });

    if (!result.success) {
      console.error('Failed to send email:', result);
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

    console.log('Email sent successfully', { messageId: result.messageId, emailId });
    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId,
      emailId: emailId // Include the email ID if tracking was enabled
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