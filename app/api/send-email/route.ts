import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Define the default sender email that is verified in your Resend account
// Note: For Resend, you need to verify your domain or use their onboarding domain
const DEFAULT_SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

// Interface for the request body
interface SendEmailRequest {
  to: string;
  from?: string;
  subject: string;
  html: string;
}

export async function POST(request: Request) {
  try {
    const { to, from, subject, html } = await request.json() as SendEmailRequest;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Always use the default sender email to avoid domain verification issues
    // Custom sender emails require domain verification in Resend
    const senderEmail = DEFAULT_SENDER_EMAIL;
    
    // Optional: You can include a reply-to header if you want replies to go to a different address
    const replyTo = from || undefined;

    try {
      const { data, error } = await resend.emails.send({
        from: senderEmail,
        replyTo: replyTo,
        to: to,
        subject: subject,
        html: html,
      });

      if (error) {
        console.error('Resend API error:', error);
        return NextResponse.json(
          { error: typeof error === 'string' ? error : error.message || 'Email service error' },
          { status: 400 }
        );
      }

      return NextResponse.json({ data });
    } catch (sendError) {
      console.error('Resend send error:', sendError);
      const errorMessage = sendError instanceof Error 
        ? `Email sending failed: ${sendError.message}` 
        : 'Failed to send email';
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Request processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}