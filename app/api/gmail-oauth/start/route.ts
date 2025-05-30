import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || url.origin;

  // Check required environment variables
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('Missing GOOGLE_CLIENT_ID environment variable');
    return NextResponse.redirect(`${baseUrl}/settings?error=missing_client_id`);
  }

  // Log OAuth configuration (without exposing secrets)
  console.log('OAuth start configuration:', {
    baseUrl,
    redirectUri: `${baseUrl}/api/gmail-oauth/callback`,
    hasClientId: true
  });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${baseUrl}/api/gmail-oauth/callback`,
    response_type: 'code',
    scope: [
      'email',
      'profile',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.modify'
    ].join(' '),
    access_type: 'offline',
    prompt: 'select_account consent'
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  console.log('Redirecting to Google OAuth:', authUrl);

  return NextResponse.redirect(authUrl);
} 