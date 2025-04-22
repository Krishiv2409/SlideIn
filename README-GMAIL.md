# Gmail API Integration for SlideIn

This document details how to set up and use the Gmail API integration in the SlideIn application.

## Overview

The Gmail API integration allows users to:
- Authenticate with their own Gmail account via OAuth 2.0
- Send emails directly from their Gmail using the Gmail API
- Have those emails appear in their "Sent" folder
- Avoid spoofing or deliverability issues (no SPF/DKIM configuration needed)

## Prerequisites

1. Create a Google Cloud Platform project
2. Enable the Gmail API
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials (Web Application)

## Google Cloud Console Setup

Follow these steps to set up your Google Cloud project:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for "Gmail API" and enable it
5. Set up the OAuth consent screen:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "External" user type (or "Internal" if using Google Workspace)
   - Fill in the required information (app name, support email, etc.)
   - Add the scope: `https://www.googleapis.com/auth/gmail.send`
   - Add test users if in testing mode
6. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add authorized JavaScript origins (e.g., `http://localhost:3000`)
   - Add authorized redirect URIs (e.g., `http://localhost:3000/api/auth/callback`)
   - Create and download the credentials

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
# Google OAuth credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

## Implementation Details

The Gmail API integration consists of several components:

1. **Frontend Components**:
   - `GmailConnectButton`: A React component that triggers the Google OAuth flow
   - `GmailTest`: A component for testing Gmail API integration

2. **API Routes**:
   - `/api/gmail-auth/auth-url`: Generates the OAuth authentication URL
   - `/api/gmail-auth/token`: Exchanges the authorization code for access and refresh tokens
   - `/api/auth/callback`: Handles the OAuth callback and sends code to the parent window
   - `/api/send-email`: Sends emails using the Gmail API

3. **Utilities**:
   - `lib/gmail.ts`: Contains functions for Gmail API interactions
   - `lib/storage.ts`: Manages Gmail tokens in local storage

## Usage

1. Add the `GmailConnectButton` component to your application where you want users to connect their Gmail account:

```jsx
import { GmailConnectButton } from '@/components/gmail-connect-button';

// In your component
<GmailConnectButton 
  onSuccess={(tokens) => {
    // Handle successful connection
    console.log('Gmail connected successfully!', tokens);
  }}
/>
```

2. To send an email using the connected Gmail account:

```jsx
import { getGmailTokens } from '@/lib/storage';
import axios from 'axios';

// Get the stored tokens
const gmailTokens = getGmailTokens();

// Send the email
const response = await axios.post('/api/send-email', {
  to: 'recipient@example.com',
  subject: 'Test Email',
  html: '<p>This is a test email.</p>',
  gmailTokens
});

if (response.data.success) {
  console.log('Email sent successfully!');
} else {
  console.error('Failed to send email:', response.data.error);
}
```

## Testing

1. Navigate to `/gmail-test` in your application
2. Connect your Gmail account using the "Connect Gmail" button
3. Fill in the recipient email, subject, and content
4. Click "Send Test Email"
5. Check your Gmail "Sent" folder to verify the email was sent correctly

## Security Considerations

- Access and refresh tokens are stored in local storage (for simplicity in this example)
- For production, consider using more secure storage methods
- Never expose tokens in client-side code
- Implement proper error handling for token expiration and refresh
- Always use HTTPS in production environments

## Troubleshooting

- Check browser console for errors
- Verify that redirect URIs in Google Cloud Console match your application
- Ensure the Gmail API is enabled in your Google Cloud project
- Make sure the required scopes are configured in the OAuth consent screen
- Check that the user has granted permission to the requested scopes 