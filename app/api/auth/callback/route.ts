import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get the authorization code from the URL
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return new Response(
        `
        <html>
          <head>
            <title>Authentication Failed</title>
          </head>
          <body>
            <h1>Authentication Failed</h1>
            <p>No authorization code was provided.</p>
            <script>
              window.close();
            </script>
          </body>
        </html>
        `,
        {
          headers: {
            'Content-Type': 'text/html',
          },
        }
      );
    }
    
    // Send the code to the parent window
    return new Response(
      `
      <html>
        <head>
          <title>Authentication Successful</title>
        </head>
        <body>
          <h1>Authentication Successful</h1>
          <p>You can close this window now.</p>
          <script>
            // Send the code to the parent window
            window.opener.postMessage(
              { 
                type: 'GMAIL_AUTH_CALLBACK', 
                code: '${code}' 
              }, 
              window.location.origin
            );
            
            // Close the window after a short delay
            setTimeout(() => window.close(), 1000);
          </script>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Error in auth callback:', error);
    
    return new Response(
      `
      <html>
        <head>
          <title>Authentication Error</title>
        </head>
        <body>
          <h1>Authentication Error</h1>
          <p>An error occurred during authentication.</p>
          <script>
            window.close();
          </script>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }
} 