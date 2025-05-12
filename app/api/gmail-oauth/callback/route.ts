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

  // No need to manually sync user data - the database trigger handles this automatically

  // Check if this email already exists for this user
  const { data: existingAccount, error: queryError } = await supabase
    .from('email_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('email', userInfo.email)
    .single();

  if (queryError && queryError.code !== 'PGRST116') { // PGRST116 means "no rows found"
    console.error('Error checking for existing account:', queryError);
    return NextResponse.redirect(`${baseUrl}/settings?error=database_error`);
  }

  const currentTime = Date.now();
  const expiryDate = currentTime + (tokenData.expires_in || 3600) * 1000;

  if (existingAccount) {
    // Update existing account with new tokens
    const { error: updateError } = await supabase
      .from('email_accounts')
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || 'EMPTY', // Fallback in case no refresh token
        expiry_date: expiryDate,
        display_name: userInfo.name || userInfo.email,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingAccount.id);

    if (updateError) {
      console.error('Error updating existing account:', updateError);
      return NextResponse.redirect(`${baseUrl}/settings?error=update_failed`);
    }
  } else {
    // Check if this is the first account for this user
    const { data: accountCount, error: countError } = await supabase
      .from('email_accounts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Set as default if this is the first account (accountCount is 0)
    // Make sure we check the count properly even if there was an error in the query
    const isFirstAccount = !countError && accountCount !== null && accountCount.length === 0;

    // Create new account
    const { error: insertError } = await supabase
      .from('email_accounts')
      .insert({
        user_id: user.id,
        email: userInfo.email,
        provider: 'gmail',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || 'EMPTY',
        expiry_date: expiryDate,
        display_name: userInfo.name || userInfo.email,
        is_default: isFirstAccount, // Only set as default if it's the first account
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error creating new account:', insertError);
      return NextResponse.redirect(`${baseUrl}/settings?error=insert_failed`);
    }
  }

  // Redirect to the email generator page after connecting Gmail
  return NextResponse.redirect(`${baseUrl}/email-generator?success=gmail_connected`);
}