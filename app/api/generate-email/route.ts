import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import axios from 'axios';
import * as cheerio from 'cheerio';

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Maximum content length to send to Gemini (in characters)
const MAX_CONTENT_LENGTH = 10000;

// Common navigation/footer class patterns to ignore
const IGNORE_CLASS_PATTERNS = [
  'nav', 'footer', 'sidebar', 'menu', 'header', 'banner',
  'cookie', 'privacy', 'terms', 'social', 'share', 'copyright'
];

// Name extraction patterns
const NAME_PATTERNS = [
  /Dr\.\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
  /Professor\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
  /Prof\.\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
  /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+PhD/i,
  /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+Lab/i,
  /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+\([^)]+\)/i, // Name followed by title in parentheses
  /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+at\s+[A-Z]/i, // Name followed by "at" and institution
  /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+Research/i, // Name followed by "Research"
  /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+Group/i, // Name followed by "Group"
  /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+Department/i // Name followed by "Department"
];

// Define the request body type
interface GenerateEmailRequest {
  urlContent: string;
  goal: string;
  tone: string;
  userName: string;
  recipientName?: string;
  url?: string;
}

async function extractContactName($: cheerio.CheerioAPI, cleanedContent: string): Promise<string> {
  // First try to extract name from meta tags and title
  const metaName = $('meta[property="og:title"], meta[name="author"]').attr('content');
  if (metaName) {
    const nameMatch = metaName.match(/(Dr\.|Professor|Prof\.)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i);
    if (nameMatch) return nameMatch[0];
  }

  const title = $('title').text();
  if (title) {
    const nameMatch = title.match(/(Dr\.|Professor|Prof\.)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i);
    if (nameMatch) return nameMatch[0];
  }

  // Then try regex patterns on the content
  for (const pattern of NAME_PATTERNS) {
    const match = cleanedContent.match(pattern);
    if (match) {
      // If the match doesn't include a title, add "Professor"
      const name = match[0].trim();
      if (!name.match(/^(Dr\.|Professor|Prof\.)/i)) {
        return `Professor ${name}`;
      }
      return name;
    }
  }

  // If regex fails, use Gemini to extract the name
  const prompt = `Based on the following text, what is the name of the professor or lead researcher running this lab? Only return the name with title (e.g., "Dr. John Smith" or "Professor Jane Doe"). If no clear name is found, return "Professor":\n\n${cleanedContent}`;
  
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-pro',
      contents: prompt
    });
    const name = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Professor';
    // If Gemini returns just "Professor", try to find a name in the content
    if (name === 'Professor') {
      const nameMatch = cleanedContent.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
      if (nameMatch) {
        return `Professor ${nameMatch[0]}`;
      }
    }
    return name;
  } catch (error) {
    console.error('Error extracting name with Gemini:', error);
    return 'Professor';
  }
}

function extractRelevantContent($: cheerio.CheerioAPI): string {
  const content: string[] = [];

  // Get title and meta description
  const title = $('title').text().trim();
  if (title) content.push(title);

  const metaDesc = $('meta[name="description"]').attr('content');
  if (metaDesc) content.push(metaDesc);

  // Extract from main content areas
  $('article, main, section, div, p, h1, h2').each((_, element) => {
    if (shouldIgnoreElement($, element)) return;

    const text = $(element).text().trim();
    if (text) {
      // Check if element has significant text content
      const wordCount = text.split(/\s+/).length;
      if (wordCount > 5) { // Ignore very short text blocks
        content.push(text);
      }
    }
  });

  return content.join('\n\n');
}

function shouldIgnoreElement($: cheerio.CheerioAPI, element: cheerio.Element): boolean {
  const classes = $(element).attr('class') || '';
  const id = $(element).attr('id') || '';
  
  return IGNORE_CLASS_PATTERNS.some(pattern => 
    classes.toLowerCase().includes(pattern) || 
    id.toLowerCase().includes(pattern)
  );
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body: GenerateEmailRequest = await request.json();
    let { urlContent, goal, tone, userName, recipientName, url } = body;

    // If URL is provided, fetch and process the content
    if (url) {
      try {
        // Fetch the webpage with timeout
        const response = await axios.get(url, {
          timeout: 5000, // 5 second timeout
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        // Load HTML into cheerio
        const $ = cheerio.load(response.data) as unknown as cheerio.CheerioAPI;

        // Remove unwanted elements
        $('nav, footer, script, style, iframe, noscript').remove();

        // Extract and clean content
        const cleanedContent = extractRelevantContent($);

        if (!cleanedContent.trim()) {
          return NextResponse.json(
            { error: 'Could not extract meaningful content from URL' },
            { status: 400 }
          );
        }

        // Extract contact name if not provided
        if (!recipientName) {
          recipientName = await extractContactName($, cleanedContent);
        }

        // Use the cleaned content
        urlContent = cleanedContent;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED') {
            return NextResponse.json(
              { error: 'Request timed out' },
              { status: 408 }
            );
          }
          return NextResponse.json(
            { error: 'Failed to fetch the webpage' },
            { status: 500 }
          );
        }
        return NextResponse.json(
          { error: 'An unexpected error occurred while processing the URL' },
          { status: 500 }
        );
      }
    }

    // Truncate content if necessary
    const truncatedContent = urlContent.length > MAX_CONTENT_LENGTH
      ? urlContent.substring(0, MAX_CONTENT_LENGTH) + '...'
      : urlContent;

    // Create a dynamic prompt based on the input parameters
    const prompt = `Generate a personalized cold email with the following context:
    
URL Content: ${truncatedContent}
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

    const text = response.text || '';
    
    // Clean the response text by removing markdown code block formatting
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    
    if (!text) {
      throw new Error('No response text received from Gemini');
    }
    
    // Parse the JSON response
    try {
      const emailData = JSON.parse(cleanedText);
      return NextResponse.json({
        ...emailData,
        recipientName: recipientName || 'Professor'
      });
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      // If JSON parsing fails, try to extract subject and body using regex
      const subjectMatch = cleanedText.match(/"subject":\s*"([^"]+)"/);
      const bodyMatch = cleanedText.match(/"body":\s*"([^"]+)"/);
      
      if (subjectMatch && bodyMatch) {
        return NextResponse.json({
          subject: subjectMatch[1],
          body: bodyMatch[1],
          recipientName: recipientName || 'Professor'
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