import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
2. Matches the specified tone
3. Clearly states the sender's goal
4. Sounds natural and human-like

Return the response in JSON format with "subject" and "body" fields.`;

    // Generate the email using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at writing personalized, engaging cold emails. Your responses should be concise, professional, and tailored to the specific context."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    // Parse the response and return it
    const response = JSON.parse(completion.choices[0].message.content || '{}');
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    );
  }
} 