import { NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/gmail';

interface SuccessResult {
  success: true;
  tokens: {
    access_token: string;
    refresh_token: string;
    expiry_date: number;
  };
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Authorization code is required' },
        { status: 400 }
      );
    }
    
    // Exchange the code for tokens
    const result = await getTokensFromCode(code);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    
    // Type assertion - we know this is a success result at this point
    const successResult = result as SuccessResult;
    
    // Return the tokens to the client
    // In a production environment, you might want to save these tokens securely
    // and only return a success message to the client
    return NextResponse.json({
      success: true,
      tokens: {
        access_token: successResult.tokens.access_token,
        refresh_token: successResult.tokens.refresh_token,
        expiry_date: successResult.tokens.expiry_date,
      }
    });
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to exchange code for tokens' },
      { status: 500 }
    );
  }
} 