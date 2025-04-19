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
  'cookie', 'privacy', 'terms', 'social', 'share'
];

// Common title prefixes to look for
const TITLE_PREFIXES = ['Dr.', 'Professor', 'Prof.', 'PhD'];

function extractContactName($: cheerio.CheerioAPI): string | null {
  // Check meta tags first
  const metaName = $('meta[property="og:title"], meta[name="author"]').attr('content');
  if (metaName) {
    const name = metaName.split('|')[0].trim();
    if (name) return name;
  }

  // Check title tag
  const title = $('title').text().trim();
  if (title) {
    const name = title.split('|')[0].split('-')[0].trim();
    if (name) return name;
  }

  // Check headings
  const headings = $('h1, h2').text();
  for (const prefix of TITLE_PREFIXES) {
    const regex = new RegExp(`${prefix}\\s+([A-Z][a-z]+\\s+[A-Z][a-z]+)`, 'i');
    const match = headings.match(regex);
    if (match) return match[0];
  }

  // Check for email-like patterns
  const emailPattern = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
  const email = $('body').text().match(emailPattern);
  if (email) {
    const namePart = email[0].split('@')[0];
    if (namePart) return namePart.replace(/[._-]/g, ' ');
  }

  return null;
}

function shouldIgnoreElement($: cheerio.CheerioAPI, element: cheerio.Element): boolean {
  const classes = $(element).attr('class') || '';
  const id = $(element).attr('id') || '';
  
  return IGNORE_CLASS_PATTERNS.some(pattern => 
    classes.toLowerCase().includes(pattern) || 
    id.toLowerCase().includes(pattern)
  );
}

function extractRelevantContent($: cheerio.CheerioAPI): string {
  const content: string[] = [];

  // Get meta description
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

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    // Validate URL
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

    // Extract content and contact name
    const cleanedText = extractRelevantContent($);
    const contactName = extractContactName($);

    if (!cleanedText.trim()) {
      return NextResponse.json(
        { error: 'Could not extract meaningful content' },
        { status: 400 }
      );
    }

    // Truncate content if necessary
    const truncatedText = cleanedText.length > MAX_CONTENT_LENGTH
      ? cleanedText.substring(0, MAX_CONTENT_LENGTH) + '...'
      : cleanedText;

    // Generate summary using Gemini
    const result = await ai.models.generateContent({
      model: 'gemini-pro',
      contents: `Summarize this page in 2-3 sentences. Highlight any key people, research, roles, or job-related content that would be relevant for a cold email:\n\n${truncatedText}`
    });
    
    const summary = result.text || 'Failed to generate summary';

    return NextResponse.json({
      cleanedText: cleanedText.replace(/\\n/g, '\n'),
      summary: summary.replace(/\\n/g, '\n'),
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