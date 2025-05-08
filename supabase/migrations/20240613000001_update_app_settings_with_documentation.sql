-- Update existing Google OAuth credentials record with documentation
UPDATE public.app_settings
SET value = '{
  "client_id": "",
  "client_secret": "",
  "documentation": {
    "setup_instructions": "To get your Google OAuth credentials, visit https://console.cloud.google.com/apis/credentials",
    "required_scopes": [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.compose",
      "https://www.googleapis.com/auth/gmail.modify"
    ],
    "redirect_uri": "Your app URL + /api/gmail-oauth/callback"
  }
}'
WHERE key = 'google_oauth_credentials';

-- Add a documentation record for troubleshooting Gmail integration
INSERT INTO public.app_settings (key, value)
VALUES ('gmail_integration_docs', '{
  "common_issues": [
    {
      "issue": "Missing Google OAuth credentials error",
      "solution": "Go to Settings > Admin > Set Google OAuth Credentials and enter your credentials from Google Cloud Console"
    },
    {
      "issue": "No refresh token available error",
      "solution": "Reconnect your Gmail account using the Connect Gmail button"
    }
  ],
  "setup_docs": "See full instructions in README-GMAIL.md"
}')
ON CONFLICT (key) DO NOTHING; 