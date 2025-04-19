import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini
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

function formatEmailResponse(text: string): { subject: string; body: string } {
  // Split into lines and clean up
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // First line is usually the subject
  const subject = lines[0].startsWith('Subject:') 
    ? lines[0].replace('Subject:', '').trim()
    : 'Potential Collaboration Opportunity';
  
  // Process the body to create proper paragraphs
  const bodyLines = lines.slice(1);
  const paragraphs: string[] = [];
  let currentParagraph: string[] = [];

  for (const line of bodyLines) {
    if (line === '') {
      // Empty line indicates paragraph break
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
    } else {
      currentParagraph.push(line);
    }
  }

  // Add the last paragraph if there is one
  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join(' '));
  }

  // Clean up any remaining placeholders and format the body
  const cleanedBody = paragraphs
    .map(para => para.replace(/\[\*\*.*?\*\*\]/g, '').replace(/\[.*?\]/g, '').trim())
    .filter(para => para.length > 0)
    .join('\n\n');

  return {
    subject,
    body: cleanedBody
  };
}

export async function POST(request: Request) {
  try {
    const { url, goal, tone, yourName } = await request.json();

    // Validate required fields
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

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
        { error: 'Could not extract meaningful content' },
        { status: 400 }
      );
    }

    // Extract contact name using regex and Gemini
    const contactName = await extractContactName($, cleanedContent);

    // Truncate content if necessary
    const truncatedContent = cleanedContent.length > MAX_CONTENT_LENGTH
      ? cleanedContent.substring(0, MAX_CONTENT_LENGTH) + '...'
      : cleanedContent;

    // Generate email using Gemini
    const emailPrompt = `Write a personalized cold email from ${yourName || 'a researcher'} to ${contactName} about potential ${goal || 'collaboration'} opportunities.
Use a ${tone || 'professional'} tone.
The message should be based on this lab description:\n\n${truncatedContent}

Requirements:
- Keep the email short (4-6 sentences)
- Make it personalized based on the lab's research
- Use paragraph breaks
- Format it like a real email with a greeting, body, and signature
- Do not use placeholders or brackets
- Do not include the word "Subject:" in the response
- Address the recipient by their name (${contactName})`;

    const result = await ai.models.generateContent({
      model: 'gemini-pro',
      contents: emailPrompt
    });
    
    const emailText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const { subject, body } = formatEmailResponse(emailText);

    return NextResponse.json({
      subject,
      body,
      contactName
    });
  } catch (error: unknown) {
    console.error('Error processing request:', error);
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
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 