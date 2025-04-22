import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function POST(request: Request) {
  try {
    const { refresh_token } = await request.json();
    
    if (!refresh_token) {
      return NextResponse.json(
        { success: false, error: 'Refresh token is required' },
        { status: 400 }
      );
    }
    
    // Set the refresh token
    oauth2Client.setCredentials({
      refresh_token
    });
    
    // Get new access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    if (!credentials.access_token || !credentials.expiry_date) {
      return NextResponse.json(
        { success: false, error: 'Failed to refresh token' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token || refresh_token, // Use existing refresh token if new one not provided
      expiry_date: credentials.expiry_date
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
} 