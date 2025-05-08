import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!code) return NextResponse.redirect(`${baseUrl}/settings?error=no_code`);

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${baseUrl}/api/gmail-oauth/callback`,
      grant_type: 'authorization_code'
    })
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return NextResponse.redirect(`${baseUrl}/settings?error=token_exchange_failed`);
  }

  // Get user info
  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const userInfo = await userInfoRes.json();

  // Get current Supabase user
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${baseUrl}/settings?error=no_supabase_user`);

  // Save to email_accounts
  await supabase.from('email_accounts').insert({
    user_id: user.id,
    email: userInfo.email,
    provider: 'gmail',
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expiry_date: Date.now() + (tokenData.expires_in || 3600) * 1000,
    display_name: userInfo.name || userInfo.email,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // Redirect to the email generator page after connecting Gmail
  return NextResponse.redirect(`${baseUrl}/email-generator?success=gmail_connected`);
} 