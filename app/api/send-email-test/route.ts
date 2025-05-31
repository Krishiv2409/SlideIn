import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // TODO: Add your email sending logic here
    return NextResponse.json({ message: 'Email test endpoint ready' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Email test endpoint is working' });
} 