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
  // Title + Name patterns
  /Dr\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  /Professor\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  /Prof\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  /Professor\s+Dr\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  /Dr\.\s+Professor\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  
  // Name + Title patterns
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+),\s+Ph\.?D\.?/i,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+Ph\.?D\.?/i,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+),\s+Professor/i,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+),\s+(?:Assistant|Associate|Full)\s+Professor/i,
  
  // Name + Context patterns
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+Lab/i,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+Research\s+Group/i,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+Group/i,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:'s)?\s+Lab(?:oratory)?/i,
  /Lab(?:oratory)?\s+of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\'s\s+Research/i,
  
  // Common faculty page patterns
  /Faculty Profile:?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  /Principal Investigator:?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  /Lab Director:?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  /Group Leader:?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  /Head:?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  
  // Fallback patterns
  /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+\([^)]+\)/i,
  /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+at\s+[A-Z]/i,
  /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+Department/i
];

// Elements likely to contain professor names
const NAME_CONTAINING_SELECTORS = [
  'h1', 'h2', 'h3', 
  '.faculty-name', '.professor-name', '.pi-name', '.profile-name', '.staff-name',
  '[itemprop="name"]', '.name', '.fullname', '.title-name',
  '.contact-name', '.author-name', '.researcher-name', '.investigator'
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

// Function to extract potential name from URL
function extractNameFromUrl(url: string): string | null {
  try {
    // Parse the URL
    const parsedUrl = new URL(url);
    
    // Look for common patterns in paths that might contain names
    const pathSegments = parsedUrl.pathname.split('/').filter(segment => segment.length > 0);
    
    // Filter out common non-name segments
    const potentialNameSegments = pathSegments.filter(segment => {
      // Filter out common directory names and file extensions
      return !segment.match(/^(about|faculty|staff|research|lab|group|publications|contact|index|home|www)$/) && 
             !segment.match(/\.(html|php|aspx|jsp)$/);
    });
    
    if (potentialNameSegments.length > 0) {
      // Process potential name segments
      for (const segment of potentialNameSegments) {
        // Replace hyphens and underscores with spaces
        const processedSegment = segment.replace(/[-_]/g, ' ');
        
        // Check if it looks like a name (capitalized words)
        const namePattern = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/;
        if (namePattern.test(processedSegment)) {
          return processedSegment;
        }
        
        // Check for name-like pattern (firstlast or first-last)
        const nameParts = processedSegment.match(/^([A-Z][a-z]+)[-_]?([A-Z][a-z]+)$/i);
        if (nameParts) {
          return `${nameParts[1]} ${nameParts[2]}`;
        }
      }
    }
    
    // Check for name in subdomains (e.g., smith.faculty.university.edu)
    const subdomains = parsedUrl.hostname.split('.');
    if (subdomains.length > 2) {
      const firstSubdomain = subdomains[0];
      // If first subdomain looks like a name
      if (firstSubdomain.length > 3 && !firstSubdomain.match(/^(www|faculty|web|people|staff)$/)) {
        // Check if it looks like a last name
        if (/^[a-z]+$/i.test(firstSubdomain)) {
          return firstSubdomain.charAt(0).toUpperCase() + firstSubdomain.slice(1);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
}

async function extractContactName($: cheerio.CheerioAPI, cleanedContent: string, url?: string): Promise<string> {
  // 1. Check targeted elements that often contain professor names
  for (const selector of NAME_CONTAINING_SELECTORS) {
    const elements = $(selector);
    if (elements.length) {
      for (let i = 0; i < Math.min(elements.length, 5); i++) {
        const text = $(elements[i]).text().trim();
        // Check if this element contains a name pattern
        for (const pattern of NAME_PATTERNS) {
          const match = text.match(pattern);
          if (match) {
            // Process the name
            let name = match[0].trim();
            // If we matched a group, use the first group
            if (match[1]) {
              // If the name doesn't have a title, add "Professor"
              if (!name.match(/^(Dr\.|Professor|Prof\.|Ph\.?D)/i)) {
                name = `Professor ${match[1]}`;
              } else {
                name = match[0];
              }
            }
            return name;
          }
        }
      }
    }
  }

  // 2. Look in meta tags and title
  const metaName = $('meta[property="og:title"], meta[name="author"], meta[name="twitter:title"], meta[property="article:author"]').attr('content');
  if (metaName) {
    for (const pattern of NAME_PATTERNS) {
      const match = metaName.match(pattern);
      if (match) {
        const name = match[0].trim();
        if (match[1] && !name.match(/^(Dr\.|Professor|Prof\.|Ph\.?D)/i)) {
          return `Professor ${match[1]}`;
        }
        return name;
      }
    }
  }

  const title = $('title').text().trim();
  if (title) {
    for (const pattern of NAME_PATTERNS) {
      const match = title.match(pattern);
      if (match) {
        const name = match[0].trim();
        if (match[1] && !name.match(/^(Dr\.|Professor|Prof\.|Ph\.?D)/i)) {
          return `Professor ${match[1]}`;
        }
        return name;
      }
    }
  }

  // 3. Try to extract name from URL if provided
  if (url) {
    const nameFromUrl = extractNameFromUrl(url);
    if (nameFromUrl) {
      return `Professor ${nameFromUrl}`;
    }
  }

  // 4. Try regex patterns on the cleaned content
  for (const pattern of NAME_PATTERNS) {
    const match = cleanedContent.match(pattern);
    if (match) {
      const name = match[0].trim();
      if (match[1] && !name.match(/^(Dr\.|Professor|Prof\.|Ph\.?D)/i)) {
        return `Professor ${match[1]}`;
      }
      return name;
    }
  }

  // 5. Look for any "Contact" sections
  const contactSection = $('*:contains("Contact")').filter(function(this: cheerio.Element) {
    return $(this).text().trim() === 'Contact' || 
           $(this).text().trim() === 'Contact Us' || 
           $(this).text().trim() === 'Contact Information';
  });
  
  if (contactSection.length > 0) {
    // Get the next few elements after the contact section
    let contactElement = contactSection.first();
    let nextElements = contactElement.nextAll().slice(0, 5);
    
    // Check for name patterns in these elements
    for (let i = 0; i < nextElements.length; i++) {
      const text = $(nextElements[i]).text().trim();
      for (const pattern of NAME_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
          const name = match[0].trim();
          if (match[1] && !name.match(/^(Dr\.|Professor|Prof\.|Ph\.?D)/i)) {
            return `Professor ${match[1]}`;
          }
          return name;
        }
      }
    }
  }

  // 6. If all else fails, use Gemini to extract the name
  const prompt = `Extract the name of the professor or lead researcher from this text. The text is from a professor's lab or faculty webpage. Only return the name with title (e.g., "Dr. John Smith" or "Professor Jane Doe"). If no clear name is found, return "Professor":\n\n${cleanedContent.substring(0, 3000)}`;
  
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-pro',
      contents: prompt
    });
    const name = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Professor';
    // If Gemini returns just "Professor", try to find a name in the content
    if (name === 'Professor') {
      const nameMatch = cleanedContent.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
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
          recipientName = await extractContactName($, cleanedContent, url);
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