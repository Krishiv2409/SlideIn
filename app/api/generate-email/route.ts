import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Define the request body type
interface GenerateEmailRequest {
  urlContent: string;
  goal: string;
  tone: string;
  userName: string;
  recipientName?: string;
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body: GenerateEmailRequest = await request.json();
    const { urlContent, goal, tone, userName, recipientName } = body;

    // Create a dynamic prompt based on the input parameters
    const prompt = `Generate a personalized cold email with the following context:
    
URL Content: ${urlContent}
Goal: ${goal}
Tone: ${tone}
Sender's Name: ${userName}
Recipient's Name: ${recipientName || 'there'}

Please analyze the URL content and create a short, direct email that:
1. References something specific from the content
2. Matches the specified tone ("${tone}")
3. Clearly states the sender's goal
4. Sounds natural and human-like, not like a template

The response must be in valid JSON format with exactly these fields:
{
  "subject": "The email subject line",
  "body": "The complete email body"
}

Make sure the email is concise, professional, and genuinely engaging.`;

    // Generate the email using Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text;
    
    // Parse the JSON response
    try {
      const emailData = JSON.parse(text);
      return NextResponse.json(emailData);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      // If JSON parsing fails, try to extract subject and body using regex
      const subjectMatch = text.match(/"subject":\s*"([^"]+)"/);
      const bodyMatch = text.match(/"body":\s*"([^"]+)"/);
      
      if (subjectMatch && bodyMatch) {
        return NextResponse.json({
          subject: subjectMatch[1],
          body: bodyMatch[1]
        });
      } else {
        throw new Error('Could not parse response format');
      }
    }
  } catch (error) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    );
  }
} 