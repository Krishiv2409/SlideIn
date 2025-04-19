import { Resend } from 'resend';
import { NextResponse } from 'next/server';


// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);


export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();


    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }


    const { data, error } = await resend.emails.send({
      from: 'aditya.jain2702@gmail.com', // You should replace this with your verified domain
      to: 'aditya.jain2702@gmail.com',
      subject: 'Test Email',
      html: '<p>This is a test email</p>',
    });


    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }


    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}